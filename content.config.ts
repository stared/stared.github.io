import { defineContentConfig, defineCollection, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',
      schema: z.object({
        title: z.string(),
        date: z.string(),
        tags: z.array(z.string()).default([]),
        description: z.string().default(''),
        author: z.string().default('Piotr Migdał'),
        image: z.string().default(''),
        mentions: z
          .array(
            z.object({
              text: z.string(),
              href: z.string(),
            }),
          )
          .default([]),
        views_k: z.number().default(0),
        migdal_score: z.number().default(0),
      }),
    }),

    textComponents: defineCollection({
      type: 'page',
      source: 'text-components/**/*.md',
      schema: z.object({}),
    }),

    similarities: defineCollection({
      type: 'data',
      source: 'similarities/**/*.json',
      schema: z.object({
        most_similar: z.array(
          z.object({
            slug: z.string(),
            similarity: z.number(),
            title: z.string(),
            path: z.string(),
          }),
        ).default([]),
      }),
    }),

    data: defineCollection({
      source: 'data/**/*',
      type: 'data',
      schema: z.object({}).passthrough(),
    }),
  },
})
