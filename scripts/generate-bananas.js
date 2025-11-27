import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import * as path from "node:path";
import matter from "gray-matter";
import { glob } from "glob";

const BANANAS_DIR = "src/assets/bananas";
const MODEL = "gemini-3-pro-image-preview";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

function slugify(id) {
  return id.replace(/\//g, "-").replace(/\/index\.mdx?$/, "");
}

async function generateImage(prompt, outputPath) {
  console.log(`  Generating image...`);

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      responseModalities: ["TEXT", "IMAGE"],
    },
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      const buffer = Buffer.from(part.inlineData.data, "base64");
      fs.writeFileSync(outputPath, buffer);
      console.log(`  Saved: ${outputPath}`);
      return true;
    }
  }

  console.log(`  No image generated`);
  return false;
}

async function loadBlogPosts() {
  const posts = [];

  // Internal blog posts (MDX)
  const mdxFiles = await glob("src/content/blog/**/*.{md,mdx}");
  for (const file of mdxFiles) {
    const content = fs.readFileSync(file, "utf-8");
    const { data, content: body } = matter(content);
    const id = file.replace("src/content/blog/", "").replace(/\/index\.mdx?$/, "").replace(/\.mdx?$/, "");
    posts.push({
      id,
      slug: slugify(id),
      title: data.title,
      description: data.description || "",
      body: body.slice(0, 2000), // First 2000 chars
      isExternal: false,
    });
  }

  // External articles
  const externalData = JSON.parse(fs.readFileSync("src/data/external-articles.json", "utf-8"));
  for (const article of externalData) {
    const slug = new URL(article.href).pathname.split("/").filter(Boolean).join("-").slice(0, 50);
    posts.push({
      id: article.href,
      slug: `external-${slug}`,
      title: article.title,
      description: article.description || "",
      body: "",
      isExternal: true,
    });
  }

  return posts;
}

function printUsage() {
  console.log(`Usage:
  pnpm generate:bananas --all              Generate for all posts (skips existing)
  pnpm generate:bananas <path>             Generate for specific post
  pnpm generate:bananas <path> --force     Regenerate even if exists

Examples:
  pnpm generate:bananas src/content/blog/2024/01/my-post.md
  pnpm generate:bananas 2024-01-my-post    (by slug)
  pnpm generate:bananas --all`);
}

async function main() {
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

  const posts = await loadBlogPosts();
  const isAll = args.includes("--all");
  const force = args.includes("--force");
  const pathArg = args.find(a => !a.startsWith("--"));

  let toGenerate = [];

  if (isAll) {
    toGenerate = posts;
  } else if (pathArg) {
    // Match by path or slug
    const match = posts.find(p =>
      p.id === pathArg ||
      p.slug === pathArg ||
      pathArg.includes(p.id) ||
      p.id.includes(pathArg.replace("src/content/blog/", "").replace(/\.mdx?$/, ""))
    );
    if (!match) {
      console.error(`Post not found: ${pathArg}`);
      console.log("\nAvailable posts:");
      posts.slice(0, 10).forEach(p => console.log(`  ${p.slug}`));
      console.log(`  ... and ${posts.length - 10} more`);
      process.exit(1);
    }
    toGenerate = [match];
  }

  console.log(`Found ${posts.length} posts, generating ${toGenerate.length}`);
  let generated = 0;

  for (const post of toGenerate) {
    const outputPath = path.join(BANANAS_DIR, `${post.slug}.png`);

    if (fs.existsSync(outputPath) && !force) {
      console.log(`Skipping ${post.slug} (exists, use --force to regenerate)`);
      continue;
    }

    console.log(`\n[${generated + 1}/${toGenerate.length}] ${post.title}`);

    const prompt = `Make an infographic of: ${post.title}\n\n${post.description}\n\n${post.body}`.trim();

    try {
      await generateImage(prompt, outputPath);
      generated++;

      // Rate limiting - wait 2 seconds between requests
      if (generated < toGenerate.length) {
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }

  console.log(`\nDone! Generated ${generated} images.`);
}

main();
