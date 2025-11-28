import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";
import matter from "gray-matter";
import { glob } from "glob";

const BANANAS_DIR = "src/assets/bananas";
const EXTERNAL_CONTENT_DIR = "src/data/external-content";
const MODEL = "gemini-3-pro-image-preview";

interface Post {
  id: string;
  slug: string;
  title: string;
  body: string;
  isExternal: boolean;
}

interface ExternalArticle {
  title: string;
  href: string;
  source: string;
  date: string;
  tags: string[];
  migdal_score: number;
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

function slugify(id: string): string {
  return id.replace(/\//g, "-").replace(/\/index\.mdx?$/, "");
}

async function generateImage(prompt: string, outputPath: string): Promise<boolean> {
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: { responseModalities: ["TEXT", "IMAGE"] },
  });

  for (const part of response.candidates![0].content!.parts!) {
    if (part.inlineData) {
      const buffer = Buffer.from(part.inlineData.data!, "base64");
      fs.writeFileSync(outputPath, buffer);
      return true;
    }
  }
  return false;
}

function loadExternalContent(): Map<string, string> {
  const contentMap = new Map<string, string>();
  const files = fs.readdirSync(EXTERNAL_CONTENT_DIR).filter(f => f.endsWith(".md"));

  for (const file of files) {
    const { data, content } = matter(fs.readFileSync(path.join(EXTERNAL_CONTENT_DIR, file), "utf-8"));
    if (data.source) {
      contentMap.set(data.source, content);
    }
  }
  return contentMap;
}

async function loadPosts(): Promise<Post[]> {
  const posts: Post[] = [];
  const externalContent = loadExternalContent();

  // Internal blog posts
  const mdxFiles = await glob("src/content/blog/**/*.{md,mdx}");
  for (const file of mdxFiles) {
    const { data, content } = matter(fs.readFileSync(file, "utf-8"));
    const id = file.replace("src/content/blog/", "").replace(/\/index\.mdx?$/, "").replace(/\.mdx?$/, "");
    posts.push({
      id,
      slug: slugify(id),
      title: data.title,
      body: content,
      isExternal: false,
    });
  }

  // External articles
  const externalData: ExternalArticle[] = JSON.parse(fs.readFileSync("src/data/external-articles.json", "utf-8"));
  for (const article of externalData) {
    const slug = new URL(article.href).pathname.split("/").filter(Boolean).join("-").slice(0, 50);
    const body = externalContent.get(article.href);
    if (body) {
      posts.push({
        id: article.href,
        slug: `external-${slug}`,
        title: article.title,
        body,
        isExternal: true,
      });
    }
  }

  return posts;
}

function printUsage(): void {
  console.log(`Usage:
  pnpm generate:bananas --all              Generate for all posts
  pnpm generate:bananas <slug>             Generate for specific post
  pnpm generate:bananas <slug> --force     Regenerate even if exists`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(0);
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not set");
    process.exit(1);
  }

  fs.mkdirSync(BANANAS_DIR, { recursive: true });

  const posts = await loadPosts();
  const isAll = args.includes("--all");
  const force = args.includes("--force");
  const slugArg = args.find(a => !a.startsWith("--"));

  let toGenerate: Post[] = [];

  if (isAll) {
    toGenerate = posts;
  } else if (slugArg) {
    const match = posts.find(p => p.slug === slugArg || p.slug.includes(slugArg) || slugArg.includes(p.slug));
    if (!match) {
      console.error(`Post not found: ${slugArg}`);
      process.exit(1);
    }
    toGenerate = [match];
  }

  console.log(`Found ${posts.length} posts, generating ${toGenerate.length}`);

  for (let i = 0; i < toGenerate.length; i++) {
    const post = toGenerate[i];
    const outputPath = path.join(BANANAS_DIR, `${post.slug}.png`);

    if (fs.existsSync(outputPath) && !force) {
      console.log(`[${i + 1}/${toGenerate.length}] Skip: ${post.title} (exists)`);
      continue;
    }

    console.log(`[${i + 1}/${toGenerate.length}] Generating: ${post.title}`);

    const prompt = `Make an infographic of: ${post.title}\n\n${post.body}`;

    try {
      const success = await generateImage(prompt, outputPath);
      if (success) {
        console.log(`  Saved: ${outputPath}`);
      } else {
        console.log(`  No image generated`);
      }
    } catch (err) {
      console.error(`  Error: ${(err as Error).message}`);
    }
  }

  console.log("Done!");
}

main();
