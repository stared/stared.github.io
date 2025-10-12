import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.string(),
    tags: z.array(z.string()).default([]),
    description: z.string().default(''),
    author: z.string().default('Piotr Migdał'),
    image: z.string().default(''),
    mentions: z
      .array(
        z.object({
          text: z.string(),
          href: z.string(),
        })
      )
      .default([]),
    views_k: z.number().default(0),
    migdal_score: z.number().default(0),
  }),
});

const textComponents = defineCollection({
  type: 'content',
  schema: z.object({}),
});

const similarities = defineCollection({
  type: 'data',
  schema: z.object({
    stem: z.string().optional(),
    most_similar: z
      .array(
        z.object({
          slug: z.string(),
          similarity: z.number(),
          title: z.string(),
          path: z.string(),
        })
      )
      .default([]),
  }),
});

const data = defineCollection({
  type: 'data',
  schema: z.object({}).passthrough(),
});

export const collections = {
  blog,
  textComponents,
  similarities,
  data,
};
