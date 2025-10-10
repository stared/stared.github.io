import { Feed } from "feed";
import { BlogPostLabel, type BlogPostMetadata, type ExternalPost } from "~/scripts/postData";
import { AUTHOR, SITE_URL } from "~/constants";

export default defineEventHandler(async (event) => {
  const feed = new Feed({
    title: `${AUTHOR}'s Blog`,
    description: `Read blog posts by ${AUTHOR}.`,
    id: `${SITE_URL}/`,
    link: `${SITE_URL}/`,
    language: "en",
    image: `${SITE_URL}/favicon.png`,
    favicon: `${SITE_URL}/favicon.png`,
    copyright: `All rights reserved 2024, ${AUTHOR}`,
    author: {
      name: AUTHOR,
      email: "pmigdal@gmail.com",
      link: `${SITE_URL}/`,
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

      if (
        typeof item !== "object" ||
        item === null ||
        !("_path" in item) ||
        !("title" in item)
      ) {
        console.warn(`[Feed] Skipping invalid content item for key: ${key}`);
        return null; // Skip this item
      }

      const parsedItem = item as Record<string, unknown>;
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
        : `${SITE_URL}${post.postSource.path}`,
      link: post.postSource.isExternal
        ? post.postSource.href
        : `${SITE_URL}${post.postSource.path}`,
      description: post.description || "",
      content: post.description || "", // Consider mapping body content if needed
      author: [
        {
          name: AUTHOR,
          email: "pmigdal@gmail.com",
          link: `${SITE_URL}/`,
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
