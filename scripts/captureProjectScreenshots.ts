// Capture screenshots for the projects page into src/assets/projects/.
// GitHub repos use their auto-generated OpenGraph card; everything else is
// screenshotted with headless Chrome (no extra dependencies).
//
// Usage: node scripts/captureProjectScreenshots.ts [--force]

import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { projectSlug } from '../src/lib/projectSlug.ts';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const OUT_DIR = path.join(import.meta.dirname, '../src/assets/projects');
const WIDTH = 1280;
const HEIGHT = 800;
const force = process.argv.includes('--force');

interface Project {
  title: string;
  href: string;
}

const projects: Project[] = JSON.parse(
  readFileSync(path.join(import.meta.dirname, '../src/data/projects.json'), 'utf-8')
);

mkdirSync(OUT_DIR, { recursive: true });

function githubRepo(href: string): string | null {
  const m = href.match(/^https?:\/\/github\.com\/([\w.-]+)\/([\w.-]+)/);
  return m ? `${m[1]}/${m[2]}` : null;
}

async function captureGithubCard(repo: string, outPath: string): Promise<void> {
  const res = await fetch(`https://opengraph.githubassets.com/1/${repo}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
}

function captureScreenshot(url: string, outPath: string): void {
  execFileSync(
    CHROME,
    [
      '--headless=new',
      `--screenshot=${outPath}`,
      `--window-size=${WIDTH},${HEIGHT}`,
      '--hide-scrollbars',
      '--disable-gpu',
      '--virtual-time-budget=15000',
      '--timeout=30000',
      url,
    ],
    { stdio: 'pipe', timeout: 60000 }
  );
}

const failures: string[] = [];

for (const project of projects) {
  const slug = projectSlug(project.title);
  const outPath = path.join(OUT_DIR, `${slug}.png`);
  if (!force && existsSync(outPath)) {
    console.log(`skip   ${slug} (exists)`);
    continue;
  }
  const repo = githubRepo(project.href);
  try {
    if (repo) {
      await captureGithubCard(repo, outPath);
      console.log(`github ${slug} <- ${repo}`);
    } else {
      captureScreenshot(project.href, outPath);
      const size = statSync(outPath).size;
      if (size < 5000) throw new Error(`suspiciously small (${size} bytes)`);
      console.log(`shot   ${slug} <- ${project.href}`);
    }
  } catch (err) {
    failures.push(`${slug}: ${project.href} (${(err as Error).message})`);
    console.error(`FAIL   ${slug}: ${(err as Error).message}`);
  }
}

if (failures.length > 0) {
  console.error(`\n${failures.length} failure(s):\n${failures.join('\n')}`);
  process.exitCode = 1;
}
