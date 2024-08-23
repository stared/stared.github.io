import { Feed } from "feed";
import { serverQueryContent } from "#content/server";
import { BlogPostLabel } from "~/scripts/postData";

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

  const posts = await serverQueryContent(event)
    .where({ _path: /^\/blog/ })
    .find();
  const externalPosts = (await import("~/content/data/external-articles.json"))
    .default.items;

  const allPosts = [
    ...posts.map((post) => BlogPostLabel.fromQueryContent(post)),
    ...externalPosts.map((post) => BlogPostLabel.fromExternalPost(post)),
  ];

  allPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  for (const post of allPosts) {
    feed.addItem({
      title: post.title,
      id: post.isExternal ? post.href : `https://p.migdal.pl${post._path}`,
      link: post.isExternal ? post.href : `https://p.migdal.pl${post._path}`,
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
      image: post.image,
    });
  }

  const feedString = feed.rss2();

  event.node.res.setHeader("content-type", "text/xml");
  event.node.res.end(feedString);
});
