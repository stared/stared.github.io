// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["nuxt-content-assets", "@nuxt/content"],
  content: {
    markdown: {
      remarkPlugins: ["remark-math"],
      rehypePlugins: {
        "rehype-mathjax": {
          output: "html", // the default value is 'htmlAndMathml'
        },
      },
    },
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
  hooks: {
    close: () => {
      // fixes `nuxi generate` hanging at the end "You can preview this build"
      // @see https://github.com/nuxt/cli/issues/169#issuecomment-1729300497
      // Workaround for https://github.com/nuxt/cli/issues/169
      process.exit(0);
    },
  },
});
