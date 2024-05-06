// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ["nuxt-content-assets", "@nuxt/content"],
  hooks: {
    close: () => {
      // fixes `nuxi generate` hanging at the end "You can preview this build"
      // @see https://github.com/nuxt/cli/issues/169#issuecomment-1729300497
      // Workaround for https://github.com/nuxt/cli/issues/169
      process.exit(0);
    },
  },
});
