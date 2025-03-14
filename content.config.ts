import { defineContentConfig, defineCollection, z } from "@nuxt/content";

export default defineContentConfig({
  collections: {
    // Blog posts collection
    blog: defineCollection({
      // Types of content in collection
      type: "page",
      // Add explicit source path
      source: "blog/**/*.md",
      // Schema for content fields
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.string(),
        author: z.string().optional(),
        tags: z.array(z.string()).optional(),
        image: z.string().optional(),
        mentions: z
          .array(
            z.object({
              text: z.string(),
              href: z.string(),
            })
          )
          .optional(),
        views_k: z.number().optional(),
        migdal_score: z.number().optional(),
      }),
    }),

    // Text components collection (for footer, resume, etc.)
    textComponents: defineCollection({
      type: "page",
      // Add explicit source path
      source: "text-components/**/*.md",
      schema: z.object({
        // Text components have flexible schema
      }),
    }),

    // Similarities collection (for similar posts feature)
    similarities: defineCollection({
      type: "data",
      // Add explicit source path
      source: "similarities/**/*.json",
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
