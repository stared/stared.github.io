import { promises as fs } from "fs";
import path from "path";
import { cosineSimilarity } from "./generateEmbeddings";
import type { BlogPostMetadata } from "./postData";

interface EmbeddingData {
  path: string;
  embedding: number[];
  metadata: Partial<BlogPostMetadata>;
}

interface SimilarPost {
  path: string;
  similarity: number;
  metadata: Partial<BlogPostMetadata>;
}

// Interface for the JSON structure we'll save
interface SimilarPostsJson {
  posts: {
    title: string;
    path: string;
    similarity: number;
  }[];
}

// Function to load all embeddings
async function loadAllEmbeddings(): Promise<EmbeddingData[]> {
  const embeddingsDir = path.join(process.cwd(), "content/data/embeddings");

  try {
    // Load the embeddings map
    const mapPath = path.join(embeddingsDir, "embeddings-map.json");
    const mapContent = await fs.readFile(mapPath, "utf-8");
    const embeddingsMap = JSON.parse(mapContent);

    // Load each individual embedding file
    const embeddings: EmbeddingData[] = [];

    for (const filePath of Object.keys(embeddingsMap)) {
      const { hash } = embeddingsMap[filePath];
      const embeddingFilePath = path.join(embeddingsDir, `${hash}.json`);

      try {
        const embeddingContent = await fs.readFile(embeddingFilePath, "utf-8");
        const embeddingData = JSON.parse(embeddingContent) as EmbeddingData;
        embeddings.push(embeddingData);
      } catch (error) {
        console.error(`Error loading embedding for ${filePath}`);
      }
    }

    return embeddings;
  } catch (error) {
    console.error("Error loading embeddings");
    return [];
  }
}

// Function to calculate similarities for a given post with all other posts
export async function calculateAllSimilarities(
  targetPath: string
): Promise<SimilarPost[]> {
  // Load all embeddings
  const allEmbeddings = await loadAllEmbeddings();

  // Find the target embedding
  const targetEmbedding = allEmbeddings.find((e) => e.path === targetPath);

  if (!targetEmbedding) {
    console.error(`No embedding found for ${targetPath}`);
    return [];
  }

  // Calculate similarity with all other posts
  const similarities: SimilarPost[] = allEmbeddings
    .filter((e) => e.path !== targetPath) // Exclude the target post
    .map((e) => ({
      path: e.path,
      similarity: cosineSimilarity(targetEmbedding.embedding, e.embedding),
      metadata: e.metadata,
    }))
    .sort((a, b) => b.similarity - a.similarity); // Sort by similarity (descending)

  return similarities;
}

// Helper function to extract title from a post
async function extractTitle(post: SimilarPost): Promise<string> {
  // If metadata is empty or title is missing, try to extract a title from the file path
  let title = "Untitled";

  if (post.metadata && post.metadata.title) {
    // Remove any quotation marks from the title
    title = post.metadata.title.replace(/["']/g, "");
  } else {
    // Extract title from path as a fallback
    const pathParts = post.path.split("/");
    const slug = pathParts[pathParts.length - 2]; // Get the directory name before index.md

    // Convert slug to title case
    if (slug) {
      title = slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    }

    // Try to find the actual title by reading the file
    try {
      const content = await fs.readFile(post.path, "utf-8");
      const titleMatch = content.match(/title:\s*["']?(.*?)["']?(\n|$)/);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim().replace(/["']/g, "");
      }
    } catch (error) {
      // Silently continue with the fallback title
    }
  }

  return title;
}

// Helper function to create a blog path from a file path
function createBlogPath(filePath: string): string {
  return `/blog/${filePath
    .split("/blog/")[1]
    .replace("/index.md", "")
    .replace(".md", "")}`;
}

// Function to ensure directory exists
async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.access(dirPath);
  } catch (error) {
    // Directory doesn't exist, create it
    await fs.mkdir(dirPath, { recursive: true });
  }
}

// Function to generate similar posts JSON for a given post
export async function generateSimilarPostsJson(
  targetPath: string
): Promise<SimilarPostsJson> {
  const allSimilarities = await calculateAllSimilarities(targetPath);

  // Format all posts with their similarities
  const formattedPosts = await Promise.all(
    allSimilarities.map(async (post) => ({
      title: await extractTitle(post),
      path: createBlogPath(post.path),
      similarity: parseFloat(post.similarity.toFixed(3)),
    }))
  );

  return {
    posts: formattedPosts,
  };
}

// Function to remove hardcoded similar posts sections from markdown files
async function removeHardcodedSimilarPostsSections(
  filePath: string
): Promise<void> {
  try {
    const content = await fs.readFile(filePath, "utf-8");

    // Check if the file contains a "## Similar posts" section
    if (content.includes("## Similar posts")) {
      // Remove the "## Similar posts" section and everything after it
      const newContent = content.replace(/## Similar posts[\s\S]*$/, "");

      // Write the updated content back to the file
      await fs.writeFile(filePath, newContent);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}`);
  }
}

// Main function to update all blog posts with similar posts JSON files
export async function updateAllBlogPostsWithSimilarPosts(): Promise<void> {
  // Load all embeddings
  const allEmbeddings = await loadAllEmbeddings();

  for (const embedding of allEmbeddings) {
    try {
      const filePath = embedding.path;

      // Generate similar posts JSON
      const similarPostsJson = await generateSimilarPostsJson(filePath);

      // Determine the directory of the blog post
      const fileDir = path.dirname(filePath);

      // Create the similarPosts.json file path in the content directory
      const jsonFilePath = path.join(fileDir, "similarPosts.json");

      // Write the JSON file to the content directory
      await fs.writeFile(
        jsonFilePath,
        JSON.stringify(similarPostsJson, null, 2)
      );

      // Also copy the JSON file to the public directory for browser access
      const publicPath = fileDir.replace(/^content/, "public");

      // Ensure the public directory exists
      await ensureDirectoryExists(publicPath);

      // Create the similarPosts.json file path in the public directory
      const publicJsonFilePath = path.join(publicPath, "similarPosts.json");

      // Copy the JSON file to the public directory
      await fs.writeFile(
        publicJsonFilePath,
        JSON.stringify(similarPostsJson, null, 2)
      );

      // Remove hardcoded similar posts sections from the markdown file
      await removeHardcodedSimilarPostsSections(filePath);
    } catch (error) {
      console.error(`Error updating ${embedding.path}`);
    }
  }
}

// Run the script if it's called directly
// Using import.meta.url check instead of require.main === module for ES modules
if (import.meta.url === import.meta.resolve("./findSimilarPosts.ts")) {
  updateAllBlogPostsWithSimilarPosts().catch(console.error);
}

export { loadAllEmbeddings };
