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

const mentionSchema = z.object({
  text: z.string(),
  href: z.string(),
});

const projects = defineCollection({
  type: 'data',
  schema: z.object({
    items: z.array(
      z.object({
        title: z.string(),
        desc: z.string(),
        href: z.string(),
        dateStart: z.string(),
        dateEnd: z.string().nullable().optional(),
        tags: z.array(z.string()).default([]),
        mentions: z.array(mentionSchema).optional(),
        status: z.string().optional(),
      })
    ),
  }),
});

const publications = defineCollection({
  type: 'data',
  schema: z.object({
    items: z.array(
      z.object({
        authors: z.string(),
        title: z.string(),
        journal: z.string().optional(),
        link: z.string().optional(),
        year: z.number(),
        arxiv: z.string().optional(),
        doi: z.string().optional(),
        misc: z.string().optional(),
        mentions: z.array(mentionSchema).optional(),
      })
    ),
  }),
});

const experiences = defineCollection({
  type: 'data',
  schema: z.object({
    items: z.array(
      z.object({
        period: z.string(),
        position: z.string(),
        company: z.string(),
        href: z.string().optional(),
        description: z.string(),
        stack: z.string().optional(),
        mentions: z.array(mentionSchema).optional(),
      })
    ),
  }),
});

const externalArticles = defineCollection({
  type: 'data',
  schema: z.object({
    items: z.array(
      z.object({
        title: z.string(),
        source: z.string(),
        href: z.string(),
        date: z.string(),
        tags: z.array(z.string()).default([]),
        migdal_score: z.number(),
        description: z.string().optional(),
        image: z.string().optional(),
        author: z.string().optional(),
        mentions: z.array(mentionSchema).optional(),
        view_k: z.number().optional(),
        views_k: z.number().optional(),
      })
    ),
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
  projects,
  publications,
  experiences,
  externalArticles,
  data,
};
