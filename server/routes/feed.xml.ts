import { Feed } from "feed";
import { BlogPostLabel } from "~/scripts/postData";
import type { BlogPostMetadata } from "~/scripts/postData";

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

  // Use direct fetch API for Content v3
  const posts = await $fetch<BlogPostMetadata[]>("/api/_content/query", {
    method: "GET",
    params: {
      _path: "/blog",
      first: false,
    },
  });

  const externalPosts = (await import("~/content/data/external-articles.json"))
    .default.items;

  const allPosts = [
    ...posts.map((post: BlogPostMetadata) =>
      BlogPostLabel.fromQueryContent(post)
    ),
    ...externalPosts.map((post) => BlogPostLabel.fromExternalPost(post)),
  ];

  allPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const post of allPosts) {
    feed.addItem({
      title: post.title,
      id: post.postSource.isExternal
        ? post.postSource.href
        : `https://p.migdal.pl${post.postSource._path}`,
      link: post.postSource.isExternal
        ? post.postSource.href
        : `https://p.migdal.pl${post.postSource._path}`,
      description: post.description || "",
      content: post.description || "",
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
