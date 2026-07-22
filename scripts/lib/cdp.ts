// Minimal Chrome DevTools Protocol client over Node's built-in WebSocket.
// Enough to navigate a headless tab and screenshot a clipped region.

import { spawn, type ChildProcess } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Pending {
  resolve: (value: Record<string, unknown>) => void;
  reject: (err: Error) => void;
}

class Connection {
  private ws: WebSocket;
  private nextId = 1;
  private pending = new Map<number, Pending>();

  constructor(ws: WebSocket) {
    this.ws = ws;
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(String(event.data));
      if (msg.id === undefined) return;
      const entry = this.pending.get(msg.id);
      if (!entry) return;
      this.pending.delete(msg.id);
      if (msg.error) entry.reject(new Error(`${msg.error.message} (${msg.method ?? ''})`));
      else entry.resolve(msg.result ?? {});
    });
  }

  send(method: string, params: object = {}, sessionId?: string): Promise<Record<string, unknown>> {
    const id = this.nextId++;
    this.ws.send(JSON.stringify({ id, method, params, sessionId }));
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      setTimeout(() => {
        if (this.pending.delete(id)) reject(new Error(`CDP timeout: ${method}`));
      }, 60000);
    });
  }

  close() {
    this.ws.close();
  }
}

export class Page {
  private conn: Connection;
  private sessionId: string;
  private targetId: string;

  constructor(conn: Connection, sessionId: string, targetId: string) {
    this.conn = conn;
    this.sessionId = sessionId;
    this.targetId = targetId;
  }

  private send(method: string, params: object = {}) {
    return this.conn.send(method, params, this.sessionId);
  }

  async setViewport(width: number, height: number, deviceScaleFactor = 2) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor,
      mobile: false,
    });
  }

  /** Navigate and settle. Never rejects on a slow page — screenshots what loaded. */
  async goto(url: string, settleMs = 3500) {
    await this.send('Page.enable');
    // Headless Chrome defaults to dark prefers-color-scheme; the tiles sit on
    // a light page, so render sites in their light theme.
    await this.send('Emulation.setEmulatedMedia', {
      features: [{ name: 'prefers-color-scheme', value: 'light' }],
    });
    await this.send('Page.navigate', { url });
    const loaded = new Promise<void>((resolve) => {
      const onMessage = (event: MessageEvent) => {
        const msg = JSON.parse(String(event.data));
        if (msg.sessionId === this.sessionId && msg.method === 'Page.loadEventFired') {
          resolve();
        }
      };
      // @ts-expect-error - reaching into the shared socket for one event
      this.conn.ws.addEventListener('message', onMessage);
    });
    await Promise.race([loaded, sleep(20000)]);
    await sleep(settleMs);
  }

  async evaluate<T>(expression: string): Promise<T> {
    const result = (await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    })) as { result?: { value?: T } };
    return result.result?.value as T;
  }

  /** Strip cookie banners, fixed headers and other chrome that ruins a crop. */
  async dismissOverlays() {
    await this.evaluate(`
      (() => {
        const patterns = /cookie|consent|gdpr|rodo|newsletter|popup|modal|banner|onetrust|cky-|paywall/i;
        for (const el of Array.from(document.querySelectorAll('div,section,aside,dialog,iframe'))) {
          const style = getComputedStyle(el);
          if (style.position !== 'fixed' && style.position !== 'sticky') continue;
          const id = (el.id || '') + ' ' + (el.className?.toString?.() || '');
          if (patterns.test(id)) el.remove();
        }
        for (const el of Array.from(document.querySelectorAll('dialog[open]'))) el.remove();
        document.documentElement.style.scrollBehavior = 'auto';
        return true;
      })()
    `);
  }

  /**
   * Bounding box of the *largest* match, in CSS pixels relative to the page.
   * Largest rather than first: pages often lead with a logo or spacer before
   * the artefact actually worth showing.
   */
  async rectOf(selector: string): Promise<Rect | null> {
    return this.evaluate<Rect | null>(`
      (() => {
        let best = null;
        for (const el of document.querySelectorAll(${JSON.stringify(selector)})) {
          const r = el.getBoundingClientRect();
          if (!best || r.width * r.height > best.width * best.height) {
            best = {x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height};
          }
        }
        return best && best.width > 0 ? best : null;
      })()
    `);
  }

  /**
   * `captureBeyondViewport` re-lays-out the page to the clip's width, which
   * silently moves content on responsive pages — so it stays off. Callers must
   * make the region visible by growing the viewport height instead, keeping the
   * width (and therefore the layout) fixed.
   */
  async screenshot(clip?: Rect): Promise<Buffer> {
    const params: Record<string, unknown> = {
      format: 'png',
      captureBeyondViewport: false,
    };
    if (clip) params['clip'] = { ...clip, scale: 1 };
    const result = (await this.send('Page.captureScreenshot', params)) as { data: string };
    return Buffer.from(result.data, 'base64');
  }

  async close() {
    await this.conn.send('Target.closeTarget', { targetId: this.targetId });
  }
}

export class Browser {
  private proc: ChildProcess;
  private conn: Connection;
  private profileDir: string;

  private constructor(proc: ChildProcess, conn: Connection, profileDir: string) {
    this.proc = proc;
    this.conn = conn;
    this.profileDir = profileDir;
  }

  static async launch(): Promise<Browser> {
    const port = 9500 + Math.floor(process.pid % 400);
    const profileDir = mkdtempSync(path.join(tmpdir(), 'shots-'));
    const proc = spawn(
      CHROME,
      [
        '--headless=new',
        `--remote-debugging-port=${port}`,
        `--user-data-dir=${profileDir}`,
        '--disable-gpu',
        '--hide-scrollbars',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-extensions',
        'about:blank',
      ],
      { stdio: 'ignore' }
    );

    let wsUrl = '';
    for (let i = 0; i < 100; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${port}/json/version`);
        wsUrl = ((await res.json()) as { webSocketDebuggerUrl: string }).webSocketDebuggerUrl;
        break;
      } catch {
        await sleep(100);
      }
    }
    if (!wsUrl) throw new Error('Chrome did not expose a debugging port');

    const ws = new WebSocket(wsUrl);
    await new Promise<void>((resolve, reject) => {
      ws.addEventListener('open', () => resolve(), { once: true });
      ws.addEventListener('error', () => reject(new Error('CDP socket failed')), { once: true });
    });

    return new Browser(proc, new Connection(ws), profileDir);
  }

  async newPage(): Promise<Page> {
    const { targetId } = (await this.conn.send('Target.createTarget', {
      url: 'about:blank',
    })) as { targetId: string };
    const { sessionId } = (await this.conn.send('Target.attachToTarget', {
      targetId,
      flatten: true,
    })) as { sessionId: string };
    return new Page(this.conn, sessionId, targetId);
  }

  async close() {
    this.conn.close();
    const exited = new Promise<void>((resolve) => this.proc.once('exit', () => resolve()));
    this.proc.kill();
    await Promise.race([exited, sleep(3000)]);
    // Chrome may still be flushing its profile; a leftover temp dir is harmless.
    try {
      rmSync(this.profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
    } catch {
      /* ignore */
    }
  }
}

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
