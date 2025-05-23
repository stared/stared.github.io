import { fileURLToPath } from "node:url";
import { SITE_CONFIG } from "./config/site";

// Generate route rules from legacy posts configuration
const generateRouteRules = () => {
  const rules: Record<string, { redirect: string }> = {};
  SITE_CONFIG.legacyPosts.forEach((post) => {
    rules[post.old] = { redirect: post.new };
  });
  return rules;
};

// Extract prerender routes from legacy posts
const prerenderRoutes = [
  ...SITE_CONFIG.legacyPosts.map((post) => post.old),
  SITE_CONFIG.feedUrl,
];

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["@nuxt/content", "@nuxtjs/plausible"],

  runtimeConfig: {
    public: {
      assetsBase:
        process.env.NODE_ENV === "production" ? SITE_CONFIG.baseUrl : "",
    },
  },

  content: {
    build: {
      markdown: {
        remarkPlugins: {
          "remark-math": {},
        },
        rehypePlugins: {
          "rehype-katex": {},
        },
      },
      pathMeta: {},
    },
    database: {
      type: "sqlite",
      filename: ":memory:",
    },
  },

  plausible: {
    ignoredHostnames: ["localhost"],
  },

  nitro: {
    prerender: {
      routes: prerenderRoutes,
    },
  },

  routeRules: generateRouteRules(),

  hooks: {
    close: () => {
      // fixes `nuxi generate` hanging at the end "You can preview this build"
      // @see https://github.com/nuxt/cli/issues/169#issuecomment-1729300497
      // Workaround for https://github.com/nuxt/cli/issues/169
      process.exit(0);
    },
  },

  app: {
    baseURL: "/",
    cdnURL: SITE_CONFIG.baseUrl,
    head: {
      link: [
        {
          rel: "stylesheet",
          href: "https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css",
        },
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: SITE_CONFIG.rss.title,
          href: `${SITE_CONFIG.baseUrl}${SITE_CONFIG.feedUrl}`,
        },
      ],
    },
  },

  compatibilityDate: "2024-10-13",
});
