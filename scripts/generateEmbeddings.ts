import { createHash } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import { globby } from "globby";
import type { BlogPostMetadata } from "./postData";

// Initialize OpenAI client
// We'll use dynamic import for OpenAI to avoid the module not found error
let openai: any;

// Function to calculate cosine similarity between two vectors
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
  const magnitudeA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
  const magnitudeB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
  return dotProduct / (magnitudeA * magnitudeB);
}

// Function to generate a hash for a file path
function generateHash(filePath: string): string {
  return createHash("md5").update(filePath).digest("hex");
}

// Function to get embedding for a text
async function getEmbedding(text: string): Promise<number[]> {
  try {
    // Initialize OpenAI if not already initialized
    if (!openai) {
      // Using dynamic import with type assertion to avoid the module not found error
      const OpenAIModule = (await import("openai")) as any;
      const OpenAI = OpenAIModule.default;
      openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }

    const response = await openai.embeddings.create({
      model: "text-embedding-3-large",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error) {
    console.error("Error getting embedding:", error);
    throw error;
  }
}

// Function to extract content from a markdown file
async function extractContentFromMarkdown(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath, "utf-8");

  // Remove frontmatter (content between --- and ---)
  const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---/, "");

  // Remove markdown syntax for a cleaner text representation
  return contentWithoutFrontmatter
    .replace(/!\[.*?\]\(.*?\)/g, "") // Remove images
    .replace(/\[([^\]]*)\]\(([^)]*)\)/g, "$1") // Replace links with just the text
    .replace(/#{1,6}\s+/g, "") // Remove headings
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, "") // Remove code blocks
    .replace(/\*\*|\*|__|\|/g, "") // Remove bold, italic, etc.
    .trim();
}

// Function to process a single blog post
async function processBlogPost(filePath: string): Promise<{
  path: string;
  hash: string;
  embedding: number[];
  metadata: Partial<BlogPostMetadata>;
}> {
  // Extract content from the markdown file
  const content = await extractContentFromMarkdown(filePath);

  // Get the frontmatter metadata
  const fileContent = await fs.readFile(filePath, "utf-8");
  const frontmatterMatch = fileContent.match(/^---\n([\s\S]*?)\n---/);
  const frontmatter = frontmatterMatch ? frontmatterMatch[1] : "";

  // Parse the frontmatter
  const metadata: Partial<BlogPostMetadata> = {};

  // Extract title specifically with a more robust approach
  const titleMatch = frontmatter.match(/title:\s*["']?(.*?)["']?(\n|$)/);
  if (titleMatch && titleMatch[1]) {
    metadata.title = titleMatch[1].trim();
  }

  // Extract other metadata
  const lines = frontmatter.split("\n");
  for (const line of lines) {
    const [key, ...valueParts] = line.split(":");
    if (key && valueParts.length && key.trim() !== "title") {
      // Skip title as we handled it above
      const value = valueParts.join(":").trim();
      const keyTrim = key.trim();

      if (keyTrim === "tags") {
        // Handle tags specifically
        const tagsValue = value.startsWith("[")
          ? JSON.parse(value.replace(/'/g, '"'))
          : value.split(",").map((tag) => tag.trim());

        // Type assertion to avoid TypeScript errors
        (metadata as any)[keyTrim] = tagsValue;
      } else {
        // Handle other metadata fields
        // Type assertion to avoid TypeScript errors
        (metadata as any)[keyTrim] = value.replace(/^["']|["']$/g, ""); // Remove quotes
      }
    }
  }

  // Generate embedding for the content
  const embedding = await getEmbedding(content);

  // Generate a hash for the file path
  const hash = generateHash(filePath);

  return {
    path: filePath,
    hash,
    embedding,
    metadata,
  };
}

// Main function to generate embeddings for all blog posts
async function generateEmbeddings() {
  console.log("Generating embeddings for blog posts...");

  // Find all markdown files in the blog directory
  const blogPosts = await globby(["content/blog/**/*.md"]);

  // Create embeddings directory if it doesn't exist
  const embeddingsDir = path.join(process.cwd(), "content/data/embeddings");
  await fs.mkdir(embeddingsDir, { recursive: true });

  // Process each blog post
  const embeddings = [];
  const embeddingsMap: Record<
    string,
    { hash: string; metadata: Partial<BlogPostMetadata> }
  > = {};

  for (const blogPost of blogPosts) {
    try {
      console.log(`Processing ${blogPost}...`);
      const result = await processBlogPost(blogPost);

      // Save individual embedding file
      const embeddingFilePath = path.join(embeddingsDir, `${result.hash}.json`);
      await fs.writeFile(
        embeddingFilePath,
        JSON.stringify(
          {
            path: result.path,
            embedding: result.embedding,
            metadata: result.metadata,
          },
          null,
          2
        )
      );

      // Add to map for the combined file
      embeddingsMap[result.path] = {
        hash: result.hash,
        metadata: result.metadata,
      };

      embeddings.push(result);
    } catch (error) {
      console.error(`Error processing ${blogPost}:`, error);
    }
  }

  // Save a map of all embeddings
  await fs.writeFile(
    path.join(embeddingsDir, "embeddings-map.json"),
    JSON.stringify(embeddingsMap, null, 2)
  );

  console.log(`Generated embeddings for ${embeddings.length} blog posts.`);
}

// Run the script if it's called directly
// Using import.meta.url check instead of require.main === module for ES modules
if (import.meta.url === import.meta.resolve("./generateEmbeddings.ts")) {
  generateEmbeddings().catch(console.error);
}

export { generateEmbeddings };
