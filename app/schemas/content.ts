import { z } from 'zod'

// ============== Base Schemas ==============

export const MentionSchema = z.object({
  text: z.string(),
  href: z.string().url(),
})

export const BlogPostFrontmatterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  date: z.string().datetime("Date must be in ISO format"),
  description: z.string().min(1, "Description is required"),
  author: z.string().min(1, "Author is required"),
  tags: z.array(z.string()),
  image: z.string().min(1, "Image URL is required"),
  mentions: z.array(MentionSchema).default([]),
  views_k: z.number().min(0).default(0),
  migdal_score: z.number().default(0),
})

export const SimilarPostSchema = z.object({
  slug: z.string(),
  similarity: z.number(),
  title: z.string(),
  path: z.string(),
})

export const SimilaritySchema = z.object({
  most_similar: z.array(SimilarPostSchema).optional(),
})

// ============== Type Exports ==============

export type Mention = z.infer<typeof MentionSchema>
export type BlogPostFrontmatter = z.infer<typeof BlogPostFrontmatterSchema>
export type SimilarPost = z.infer<typeof SimilarPostSchema>
export type Similarity = z.infer<typeof SimilaritySchema>

// Extended types with Nuxt Content metadata
export type BlogPost = BlogPostFrontmatter & {
  _path: string
  _id: string
  _type: 'markdown'
  _source: string
  body: any
  excerpt?: any
}

// ============== Constants ==============

export const DEFAULT_AUTHOR = 'Piotr Migdał'
export const DEFAULT_IMAGE = 'https://p.migdal.pl/imgs/blog/pmigdal-2024-by-julia-migdal.webp'

export const DEFAULT_VALUES = {
  author: DEFAULT_AUTHOR,
  image: DEFAULT_IMAGE,
  views_k: 0,
  migdal_score: 0,
  mentions: [] as Mention[],
  tags: [] as string[],
  description: '',
} as const