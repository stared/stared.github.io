// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    // Temporarily disable nuxt-content-assets due to compatibility issues with Nuxt Content 3.3.0
    // "nuxt-content-assets",
    "@nuxt/content",
    "@nuxtjs/plausible",
  ],

  runtimeConfig: {
    public: {
      assetsBase:
        process.env.NODE_ENV === "production" ? "https://p.migdal.pl" : "",
    },
  },

  content: {
    // Content v3 configuration
    build: {
      markdown: {
        remarkPlugins: {
          "remark-math": {},
        },
        rehypePlugins: {
          "rehype-mathjax": {
            output: "html", // the default value is 'htmlAndMathml'
          },
        },
      },
    },
    // Note: experimental.search is removed as it's not supported in the current version
  },

  plausible: {
    ignoredHostnames: ["localhost"],
  },

  vue: {
    compilerOptions: {
      isCustomElement: (tag) => {
        const isMathjax =
          tag.startsWith("mjx-") || ["defs", "path", "G", "use"].includes(tag);
        return isMathjax;
      },
    },
  },

  nitro: {
    prerender: {
      routes: [
        "/2017/01/06/king-man-woman-queen-why.html",
        "/2017/04/30/teaching-deep-learning.html",
        "/2016/08/15/quantum-mechanics-for-high-school-students.html",
        "/2015/12/14/sci-to-data-sci.html",
        "/2016/03/15/data-science-intro-for-math-phys-background.html",
        "/2017/09/30/dating-for-nerds-gender-differences.html",
        "/2017/07/23/dating-for-nerds.html",
        "/2018/09/15/simple-diagrams-deep-learning.html",
        "/2017/08/14/bangbangcon.html",
        "/feed.xml",
      ],
    },
  },

  routeRules: {
    // Redirect specific posts
    // Legacy links from Jekyll times, still used online
    "/2017/01/06/king-man-woman-queen-why.html": {
      redirect: "/blog/2017/01/king-man-woman-queen-why",
    },
    "/2017/04/30/teaching-deep-learning.html": {
      redirect: "/blog/2017/04/teaching-deep-learning",
    },
    "/2016/08/15/quantum-mechanics-for-high-school-students.html": {
      redirect: "/blog/2016/08/quantum-mechanics-for-high-school-students",
    },
    "/2015/12/14/sci-to-data-sci.html": {
      redirect: "/blog/2015/12/sci-to-data-sci",
    },
    "/2016/03/15/data-science-intro-for-math-phys-background.html": {
      redirect: "/blog/2016/03/data-science-intro-for-math-phys-background",
    },
    "/2017/09/30/dating-for-nerds-gender-differences.html": {
      redirect: "/blog/2017/09/dating-for-nerds-gender-differences",
    },
    "/2017/07/23/dating-for-nerds.html": {
      redirect: "/blog/2017/07/dating-for-nerds",
    },
    "/2018/09/15/simple-diagrams-deep-learning.html": {
      redirect: "/blog/2018/09/simple-diagrams-deep-learning",
    },
    "/2017/08/14/bangbangcon.html": {
      redirect: "/blog/2017/08/bangbangcon",
    },
  },

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
    cdnURL: "https://p.migdal.pl",
  },

  compatibilityDate: "2024-10-13",
});
