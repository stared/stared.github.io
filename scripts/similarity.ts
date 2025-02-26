import { generateEmbeddings } from "./generateEmbeddings";
import { updateAllBlogPostsWithSimilarPosts } from "./findSimilarPosts";

async function main() {
  console.log("Starting similarity processing...");

  // Step 1: Generate embeddings for all blog posts
  console.log("Step 1: Generating embeddings...");
  await generateEmbeddings();

  // Step 2: Update all blog posts with similar posts sections
  console.log("Step 2: Updating blog posts with similar posts sections...");
  await updateAllBlogPostsWithSimilarPosts();

  console.log("Similarity processing completed successfully!");
}

// Run the script
main().catch((error) => {
  console.error("Error running similarity processing:", error);
  process.exit(1);
});
