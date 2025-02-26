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
        console.error(`Error loading embedding for ${filePath}:`, error);
      }
    }

    return embeddings;
  } catch (error) {
    console.error("Error loading embeddings:", error);
    return [];
  }
}

// Function to find similar posts for a given post
export async function findSimilarPosts(
  targetPath: string,
  count: number = 5
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
    .sort((a, b) => b.similarity - a.similarity) // Sort by similarity (descending)
    .slice(0, count); // Take the top N

  return similarities;
}

// Function to find the least similar posts
export async function findLeastSimilarPosts(
  targetPath: string,
  count: number = 5
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
    .sort((a, b) => a.similarity - b.similarity) // Sort by similarity (ascending)
    .slice(0, count); // Take the bottom N

  return similarities;
}

// Function to generate similar posts markdown for a given post
export async function generateSimilarPostsMarkdown(
  targetPath: string,
  mostSimilarCount: number = 5,
  leastSimilarCount: number = 3
): Promise<string> {
  const similarPosts = await findSimilarPosts(targetPath, mostSimilarCount);
  const leastSimilarPosts = await findLeastSimilarPosts(
    targetPath,
    leastSimilarCount
  );

  let markdown = "## Similar posts\n\n";

  // Add most similar posts
  for (const post of similarPosts) {
    // If metadata is empty or title is missing, try to extract a title from the file path
    let title = "Untitled";

    if (post.metadata && post.metadata.title) {
      // Remove any quotation marks from the title
      title = post.metadata.title.replace(/["']/g, "");
    } else {
      // Extract title from path as a fallback
      // For example, from "content/blog/2020/03/types-tests-typescript/index.md"
      // Extract "types-tests-typescript" and convert to title case
      const pathParts = post.path.split("/");
      const slug = pathParts[pathParts.length - 2]; // Get the directory name before index.md

      // Convert slug to title case (e.g., "types-tests-typescript" -> "Types Tests Typescript")
      if (slug) {
        title = slug
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }

      // Try to find the actual title by reading the file
      try {
        const fs = require("fs");
        const content = fs.readFileSync(post.path, "utf-8");
        const titleMatch = content.match(/title:\s*["']?(.*?)["']?(\n|$)/);
        if (titleMatch && titleMatch[1]) {
          title = titleMatch[1].trim().replace(/["']/g, "");
        }
      } catch (error) {
        console.error(`Error reading file ${post.path}:`, error);
      }
    }

    const pathParts = post.path.split("/");
    const slug = pathParts[pathParts.length - 1].replace(".md", "");

    // Create absolute URL path without the /index part
    const blogPath = `https://p.migdal.pl/blog/${post.path
      .split("/blog/")[1]
      .replace("/index.md", "")
      .replace(".md", "")}`;

    markdown += `- \`${post.similarity.toFixed(3)}\` [${title}](${blogPath})\n`;
  }

  // Add least similar posts if requested
  if (leastSimilarCount > 0) {
    markdown += "\nAnd, as an experiment, here are my least similar posts:\n\n";

    for (const post of leastSimilarPosts) {
      // If metadata is empty or title is missing, try to extract a title from the file path
      let title = "Untitled";

      if (post.metadata && post.metadata.title) {
        // Remove any quotation marks from the title
        title = post.metadata.title.replace(/["']/g, "");
      } else {
        // Extract title from path as a fallback
        // For example, from "content/blog/2020/03/types-tests-typescript/index.md"
        // Extract "types-tests-typescript" and convert to title case
        const pathParts = post.path.split("/");
        const slug = pathParts[pathParts.length - 2]; // Get the directory name before index.md

        // Convert slug to title case (e.g., "types-tests-typescript" -> "Types Tests Typescript")
        if (slug) {
          title = slug
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        }

        // Try to find the actual title by reading the file
        try {
          const fs = require("fs");
          const content = fs.readFileSync(post.path, "utf-8");
          const titleMatch = content.match(/title:\s*["']?(.*?)["']?(\n|$)/);
          if (titleMatch && titleMatch[1]) {
            title = titleMatch[1].trim().replace(/["']/g, "");
          }
        } catch (error) {
          console.error(`Error reading file ${post.path}:`, error);
        }
      }

      const pathParts = post.path.split("/");
      const slug = pathParts[pathParts.length - 1].replace(".md", "");

      // Create absolute URL path without the /index part
      const blogPath = `https://p.migdal.pl/blog/${post.path
        .split("/blog/")[1]
        .replace("/index.md", "")
        .replace(".md", "")}`;

      markdown += `- \`${post.similarity.toFixed(
        3
      )}\` [${title}](${blogPath})\n`;
    }
  }

  return markdown;
}

// Main function to update all blog posts with similar posts sections
export async function updateAllBlogPostsWithSimilarPosts(): Promise<void> {
  // Load all embeddings
  const allEmbeddings = await loadAllEmbeddings();

  for (const embedding of allEmbeddings) {
    try {
      const filePath = embedding.path;
      console.log(`Updating similar posts for ${filePath}...`);

      // Generate similar posts markdown
      const similarPostsMarkdown = await generateSimilarPostsMarkdown(filePath);

      // Read the current file content
      const content = await fs.readFile(filePath, "utf-8");

      // Check if the file already has a similar posts section
      const similarPostsSectionRegex = /## Similar posts[\s\S]*?(?=\n##|$)/;

      let updatedContent;
      if (similarPostsSectionRegex.test(content)) {
        // Replace the existing similar posts section
        updatedContent = content.replace(
          similarPostsSectionRegex,
          similarPostsMarkdown
        );
      } else {
        // Add the similar posts section at the end of the file
        updatedContent = `${content}\n\n${similarPostsMarkdown}`;
      }

      // Write the updated content back to the file
      await fs.writeFile(filePath, updatedContent);

      console.log(`Updated ${filePath}`);
    } catch (error) {
      console.error(`Error updating ${embedding.path}:`, error);
    }
  }
}

// Run the script if it's called directly
// Using import.meta.url check instead of require.main === module for ES modules
if (import.meta.url === import.meta.resolve("./findSimilarPosts.ts")) {
  updateAllBlogPostsWithSimilarPosts().catch(console.error);
}

export { loadAllEmbeddings };
