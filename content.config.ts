import { defineContentConfig, defineCollection, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    // Blog collection
    blog: defineCollection({
      source: "blog/**/*.md",
      // Use page type for regular content pages
      type: "page",
    }),
    // Text components collection
    textComponents: defineCollection({
      source: "text-components/**/*.md",
      type: "page",
    }),
    // Similarities data collection
    similarities: defineCollection({
      source: "similarities/**/*.json",
      // Use data type for non-page content
      type: "data",
      // Define a basic schema
      schema: z.object({
        most_similar: z
          .array(
            z.object({
              slug: z.string(),
              similarity: z.number(),
              title: z.string(),
              path: z.string(),
            })
          )
          .optional(),
      }),
    }),
    // Other data collection
    data: defineCollection({
      source: "data/**/*",
      type: "data",
      // Define a flexible schema
      schema: z
        .object({
          // Allow any properties
          // This is a catch-all schema for various data files
        })
        .passthrough(),
    }),
  },
});
