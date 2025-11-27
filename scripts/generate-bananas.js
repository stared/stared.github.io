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

async function main() {
  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY not set");
    process.exit(1);
  }

  fs.mkdirSync(BANANAS_DIR, { recursive: true });

  const posts = await loadBlogPosts();
  console.log(`Found ${posts.length} posts`);

  const limit = parseInt(process.argv[2]) || 3; // Default: generate 3
  let generated = 0;

  for (const post of posts) {
    if (generated >= limit) break;

    const outputPath = path.join(BANANAS_DIR, `${post.slug}.png`);

    if (fs.existsSync(outputPath)) {
      console.log(`Skipping ${post.slug} (exists)`);
      continue;
    }

    console.log(`\n[${generated + 1}/${limit}] ${post.title}`);

    const prompt = `Make an infographic of: ${post.title}\n\n${post.description}\n\n${post.body}`.trim();

    try {
      await generateImage(prompt, outputPath);
      generated++;

      // Rate limiting - wait 2 seconds between requests
      if (generated < limit) {
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error(`  Error: ${err.message}`);
    }
  }

  console.log(`\nDone! Generated ${generated} images.`);
}

main();
