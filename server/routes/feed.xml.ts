import { Feed } from "feed";
import { BlogPostLabel } from "~/scripts/postData";
import type { BlogPostMetadata } from "~/scripts/postData"; // Assuming this structure matches ParsedContent
import { useStorage } from "#imports"; // Use Nuxt's auto-import

export default defineEventHandler(async (event) => {
  const feed = new Feed({
    title: "Piotr Migdał's Blog",
    description: "Read blog posts by Piotr Migdał.",
    id: "https://p.migdal.pl/",
    link: "https://p.migdal.pl/",
    language: "en",
    image: "https://p.migdal.pl/favicon.png",
    favicon: "https://p.migdal.pl/favicon.png",
    copyright: "All rights reserved 2024, Piotr Migdał",
    author: {
      name: "Piotr Migdał",
      email: "pmigdal@gmail.com",
      link: "https://p.migdal.pl/",
    },
  });

  // Use Nitro storage to fetch parsed content data
  const storage = useStorage("content:source");
  // Prefix for blog content keys (adjust if needed, e.g., based on content.sources config)
  const blogPrefix = "content:blog:";
  const keys = await storage.getKeys(blogPrefix);

  const postsDataPromises = keys
    .filter((key) => key.startsWith(blogPrefix) && key.endsWith(".md")) // Ensure we only process markdown files within the blog source
    .map(async (key): Promise<BlogPostMetadata | null> => {
      // Return null for invalid items
      const item = await storage.getItem(key);

      // Check if item is a valid, non-null object representing content
      // Added a check for 'title' as a basic sanity check for content structure
      if (
        typeof item !== "object" ||
        item === null ||
        !("_path" in item) ||
        !(item as any).title
      ) {
        console.warn(`[Feed] Skipping invalid content item for key: ${key}`);
        return null; // Skip this item
      }

      // Assert type and reconstruct structure for BlogPostLabel
      const parsedItem = item as Record<string, any>; // Assert as a generic object
      return {
        ...parsedItem, // Spread the parsed content properties
        path: parsedItem._path, // Ensure 'path' is set from '_path' for BlogPostLabel
        // Ensure other required fields for BlogPostMetadata are present or mapped
        title: parsedItem.title,
        date: parsedItem.date,
        tags: parsedItem.tags || [],
        // Map other optional fields if necessary
        description: parsedItem.description,
        image: parsedItem.image,
        author: parsedItem.author,
        mentions: parsedItem.mentions,
        views_k: parsedItem.views_k,
        migdal_score: parsedItem.migdal_score,
        _path: parsedItem._path, // Ensure _path itself is included if needed by BlogPostMetadata
      } as BlogPostMetadata; // Cast to the expected final type
    });

  const postsDataResults = await Promise.all(postsDataPromises);
  // Filter out any null results from invalid items
  const posts = postsDataResults.filter(
    (post): post is BlogPostMetadata => post !== null
  );

  const externalPosts = (await import("~/content/data/external-articles.json"))
    .default.items;

  // Cast posts to BlogPostMetadata[] if necessary and confident in type compatibility
  // Or adjust BlogPostLabel.fromQueryContent if the structure differs significantly
  const allPosts = [
    ...posts.map(
      (post) => BlogPostLabel.fromQueryContent(post) // Assuming BlogPostLabel can handle this structure
    ),
    ...externalPosts.map((post) => BlogPostLabel.fromExternalPost(post)),
  ];

  // Sorting remains the same
  allPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const post of allPosts) {
    // Feed item generation remains the same, using post.postSource.path
    feed.addItem({
      title: post.title,
      id: post.postSource.isExternal
        ? post.postSource.href
        : `https://p.migdal.pl${post.postSource.path}`,
      link: post.postSource.isExternal
        ? post.postSource.href
        : `https://p.migdal.pl${post.postSource.path}`,
      description: post.description || "",
      content: post.description || "", // Consider mapping body content if needed
      author: [
        {
          name: "Piotr Migdał",
          email: "pmigdal@gmail.com",
          link: "https://p.migdal.pl/",
        },
      ],
      date: new Date(post.date),
      image:
        post.image && post.image.startsWith("http") ? post.image : undefined,
    });
  }

  const feedString = feed.rss2();

  event.node.res.setHeader("content-type", "text/xml");
  event.node.res.end(feedString);
});
