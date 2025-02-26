import { generateEmbeddings } from "./generateEmbeddings";
import { updateAllBlogPostsWithSimilarPosts } from "./findSimilarPosts";

async function main() {
  console.log("Starting similarity processing...");

  // Generate embeddings for all blog posts
  await generateEmbeddings();

  // Update all blog posts with similar posts sections
  await updateAllBlogPostsWithSimilarPosts();

  console.log("Similarity processing completed!");
}

// Run the script
main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
