// Build the project thumbnails in src/assets/projects/.
//
// Sources are curated in scripts/projectShots.ts: either an illustration the
// project already ships, or a clipped region of its live page. Everything is
// normalised to a 16:10 PNG so the grid needs no per-image CSS.
//
//   pnpm generate:screenshots              # only missing ones
//   pnpm generate:screenshots --force      # redo everything
//   pnpm generate:screenshots tagoverflow  # redo named slugs
//   pnpm generate:screenshots --probe <url>  # list clippable elements

import { readFileSync, existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { Browser, sleep, type Rect } from './lib/cdp.ts';
import { SHOTS, type Shot } from './projectShots.ts';
import { projectSlug } from '../src/lib/projectSlug.ts';

const OUT_DIR = path.join(import.meta.dirname, '../src/assets/projects');
const OUT_WIDTH = 1200;
const OUT_HEIGHT = 750; // 16:10
const VIEWPORT = { width: 1440, height: 900 };

const args = process.argv.slice(2);
const force = args.includes('--force');
const only = new Set(args.filter((a) => !a.startsWith('--')));

interface Project {
  title: string;
  href: string;
}

/** Largest visually-meaningful element in the upper page — the usual artefact. */
const AUTO_CLIP = `
  (() => {
    const nodes = document.querySelectorAll('canvas,svg,img,figure,video,.plot,.chart');
    let best = null;
    for (const el of nodes) {
      const r = el.getBoundingClientRect();
      const area = r.width * r.height;
      if (r.width < 220 || r.height < 140) continue;
      if (r.top + scrollY > 2200) continue;
      if (!best || area > best.area) {
        best = {area, x: r.x + scrollX, y: r.y + scrollY, width: r.width, height: r.height};
      }
    }
    return best;
  })()
`;

async function normalise(input: Buffer, shot: Shot): Promise<Buffer> {
  const fit = shot.fit ?? 'cover';
  const meta = await sharp(input).metadata();

  // An animated demo's first frame is its empty starting state — a training
  // plot before any epoch has run. The last frame is the finished result.
  const pages = meta.pages ?? 1;
  const page = shot.frame === 'first' || pages < 2 ? 0 : pages - 1;

  // Letterbox colour: white suits most artefacts, but a dark visualisation
  // needs a dark surround or the tile reads as broken.
  const hex = (shot.background ?? '#ffffff').replace('#', '');
  const bg = {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };

  let pipeline = sharp(input, { page });
  // Trim slack so the artefact is centred on its true bounds rather than on
  // whatever whitespace the page included. Only safe when letterboxing:
  // trimming changes the aspect ratio, and `cover` would then crop into the
  // content to get back to 16:10.
  const shouldTrim = shot.trim ?? fit === 'contain';
  if (shouldTrim) pipeline = pipeline.trim({ threshold: 12 });

  // Letterboxed art is trimmed to its exact ink, so give it a margin instead of
  // running edge to edge.
  const m = fit === 'contain' ? (shot.margin ?? 28) : 0;

  return pipeline
    .resize(OUT_WIDTH - 2 * m, OUT_HEIGHT - 2 * m, {
      fit,
      // Cropping keeps the top, where a screenshot's subject usually is.
      // Letterboxing centres, so the artefact sits in the middle of the tile.
      position: fit === 'contain' ? 'center' : 'top',
      background: { ...bg, alpha: 1 },
    })
    .extend({ top: m, bottom: m, left: m, right: m, background: bg })
    .flatten({ background: bg })
    .png()
    .toBuffer();
}

async function probe(browser: Browser, url: string) {
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT.width, VIEWPORT.height, 1);
  await page.goto(url);
  await page.dismissOverlays();
  const found = await page.evaluate<unknown[]>(`
    Array.from(document.querySelectorAll('canvas,svg,img,figure,video,section,main,div'))
      .map(el => {
        const r = el.getBoundingClientRect();
        return {
          sel: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') +
               (el.className && typeof el.className === 'string'
                 ? '.' + el.className.trim().split(/\\s+/).slice(0, 2).join('.') : ''),
          x: Math.round(r.x + scrollX), y: Math.round(r.y + scrollY),
          w: Math.round(r.width), h: Math.round(r.height),
        };
      })
      .filter(e => e.w > 200 && e.h > 120 && e.y < 2500)
      .sort((a, b) => b.w * b.h - a.w * a.h)
      .slice(0, 25)
  `);
  console.log(JSON.stringify(found, null, 1));
  await page.close();
}

async function capture(browser: Browser, project: Project, shot: Shot): Promise<Buffer> {
  if (shot.image) {
    const res = await fetch(shot.image);
    if (!res.ok) throw new Error(`fetch ${res.status} for ${shot.image}`);
    return Buffer.from(await res.arrayBuffer());
  }

  const page = await browser.newPage();
  try {
    const viewport = shot.viewport ?? VIEWPORT;
    // `fixture:name.html` renders a committed page from scripts/fixtures/.
    const target = shot.url?.startsWith('fixture:')
      ? `file://${path.join(import.meta.dirname, 'fixtures', shot.url.slice('fixture:'.length))}`
      : (shot.url ?? project.href);
    await page.setViewport(viewport.width, viewport.height, 2);
    await page.goto(target, shot.wait ?? 3500);
    await page.dismissOverlays();
    if (shot.prepare) {
      await page.evaluate(shot.prepare);
      // Whatever prepare triggered — a render, a dismissed modal — needs to settle.
      await sleep(shot.prepareWait ?? 4000);
    }

    const pad = shot.pad ?? 0;
    const measure = async (): Promise<Rect | null> => {
      let rect: Rect | null = shot.clip ?? null;
      if (!rect && shot.pickRect) {
        rect = await page.evaluate<Rect | null>(shot.pickRect);
        if (!rect) throw new Error('pickRect matched nothing');
      }
      if (!rect && shot.selector) {
        rect = await page.rectOf(shot.selector);
        if (!rect) throw new Error(`selector not found: ${shot.selector}`);
      }
      if (!rect) rect = await page.evaluate<Rect | null>(AUTO_CLIP);
      if (!rect) return null;
      return {
        x: Math.max(0, rect.x - pad),
        y: Math.max(0, rect.y - pad),
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      };
    };

    let clip = await measure();
    // Only a region inside the viewport can be captured. Grow the viewport
    // downwards to reach it — never sideways, which would reflow the page.
    if (clip && clip.y + clip.height > viewport.height) {
      const needed = clip.y + clip.height;
      // Tall viewports at 2x rasterise a lot of pixels; drop to 1x for those.
      await page.setViewport(viewport.width, Math.ceil(needed + 40), needed > 4000 ? 1 : 2);
      await sleep(1200);
      // Resizing can move things, so the measurement has to be redone.
      clip = await measure();
    }
    return await page.screenshot(clip ?? undefined);
  } finally {
    await page.close();
  }
}

const projects: Project[] = JSON.parse(
  readFileSync(path.join(import.meta.dirname, '../src/data/projects.json'), 'utf-8')
);

mkdirSync(OUT_DIR, { recursive: true });
const browser = await Browser.launch();

try {
  const probeIndex = args.indexOf('--probe');
  const probeUrl = probeIndex === -1 ? undefined : args[probeIndex + 1];
  if (probeIndex !== -1) {
    if (!probeUrl) throw new Error('--probe needs a URL');
    await probe(browser, probeUrl);
  } else {
    const failures: string[] = [];
    for (const project of projects) {
      const slug = projectSlug(project.title);
      const outPath = path.join(OUT_DIR, `${slug}.png`);
      if (only.size > 0 && !only.has(slug)) continue;
      if (!force && only.size === 0 && existsSync(outPath)) continue;

      const shot = SHOTS[slug] ?? {};
      if (shot.skip) {
        // Remove a previously generated file, so flipping a project to `skip`
        // actually clears its tile.
        if (existsSync(outPath)) rmSync(outPath);
        console.log(`--   ${slug} (no meaningful visual)`);
        continue;
      }
      try {
        const raw = await capture(browser, project, shot);
        writeFileSync(outPath, await normalise(raw, shot));
        console.log(`ok   ${slug}`);
      } catch (err) {
        failures.push(`${slug}: ${(err as Error).message}`);
        console.error(`FAIL ${slug}: ${(err as Error).message}`);
      }
    }
    if (failures.length) {
      console.error(`\n${failures.length} failed:\n${failures.join('\n')}`);
      process.exitCode = 1;
    }
  }
} finally {
  await browser.close();
}
