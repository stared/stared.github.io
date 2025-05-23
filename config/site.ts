export const SITE_CONFIG = {
  // Site information
  name: "Piotr Migdał",
  title: "Piotr Migdał",
  description: "Piotr Migdał - blog posts and stuff",
  author: "Piotr Migdał",
  email: "pmigdal@gmail.com",

  // URLs
  baseUrl: "https://p.migdal.pl",
  feedUrl: "/feed.xml",

  // Social media
  twitter: {
    card: "summary_large_image",
  },

  // RSS Feed config
  rss: {
    title: "Piotr Migdał's Blog",
    description: "Read blog posts by Piotr Migdał.",
    copyright: "All rights reserved 2024, Piotr Migdał",
  },

  // Images
  images: {
    favicon: "/favicon.png",
    defaultThumbnail:
      "/assets/imgs/piotr-migdal-direct-smiling-2022-by-cytacka-thumbnail.jpg",
    mainPhoto:
      "~/assets/imgs/piotr-migdal-direct-smiling-2022-by-cytacka-600px.jpg",
  },

  // Navigation
  navigation: [
    { name: "Blog", path: "/blog" },
    { name: "Projects", path: "/projects" },
    { name: "Publications", path: "/publications" },
    { name: "Resume", path: "/resume" },
  ],

  // Legacy redirects configuration
  legacyPosts: [
    {
      old: "/2017/01/06/king-man-woman-queen-why.html",
      new: "/blog/2017/01/king-man-woman-queen-why",
    },
    {
      old: "/2017/04/30/teaching-deep-learning.html",
      new: "/blog/2017/04/teaching-deep-learning",
    },
    {
      old: "/2016/08/15/quantum-mechanics-for-high-school-students.html",
      new: "/blog/2016/08/quantum-mechanics-for-high-school-students",
    },
    {
      old: "/2015/12/14/sci-to-data-sci.html",
      new: "/blog/2015/12/sci-to-data-sci",
    },
    {
      old: "/2016/03/15/data-science-intro-for-math-phys-background.html",
      new: "/blog/2016/03/data-science-intro-for-math-phys-background",
    },
    {
      old: "/2017/09/30/dating-for-nerds-gender-differences.html",
      new: "/blog/2017/09/dating-for-nerds-gender-differences",
    },
    {
      old: "/2017/07/23/dating-for-nerds.html",
      new: "/blog/2017/07/dating-for-nerds",
    },
    {
      old: "/2018/09/15/simple-diagrams-deep-learning.html",
      new: "/blog/2018/09/simple-diagrams-deep-learning",
    },
    {
      old: "/2017/08/14/bangbangcon.html",
      new: "/blog/2017/08/bangbangcon",
    },
  ],
} as const;
