import { defineContentConfig, defineCollection, z } from "@nuxt/content";
import { BlogPostFrontmatterSchema, SimilaritySchema } from "./app/schemas/content";

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: "page",
      source: "blog/**/*.md",
      schema: BlogPostFrontmatterSchema,
    }),

    textComponents: defineCollection({
      type: "page",
      source: "text-components/**/*.md",
      schema: z.object({}),
    }),

    similarities: defineCollection({
      type: "data",
      source: "similarities/**/*.json",
      schema: SimilaritySchema,
    }),

    data: defineCollection({
      source: "data/**/*",
      type: "data",
      schema: z.object({}).passthrough(),
    }),
  },
});