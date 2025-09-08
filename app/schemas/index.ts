// Single source of truth for ALL types
// Everything is defined ONCE here

import { z } from 'zod'
import { BlogPostFrontmatterSchema, DEFAULT_AUTHOR, DEFAULT_IMAGE } from './content'
import type { BlogPostFrontmatter } from './content'

// ============== Content Schemas ==============
export * from './content'

// ============== External Data Schemas ==============

export const ExternalArticleSchema = z.object({
  title: z.string(),
  source: z.string(),
  href: z.string(),
  date: z.string(),
  tags: z.array(z.string()),
  author: z.string().optional(),
  description: z.string().optional(),
  image: z.string().optional(),
  mentions: z.array(z.object({ text: z.string(), href: z.string() })).optional(),
  views_k: z.number().optional(),
  migdal_score: z.number(),
})

export const ProjectSchema = z.object({
  title: z.string(),
  desc: z.string(),
  href: z.string(),
  dateStart: z.string(),
  dateEnd: z.string().nullable().optional(),
  status: z.enum(['active', 'completed', 'archived', 'on-hold']).optional(),
  tags: z.array(z.string()).optional(),
  mentions: z.array(z.object({ text: z.string(), href: z.string() })).optional(),
  role: z.string().optional(),
  technologies: z.array(z.string()).optional(),
})

export const PublicationSchema = z.object({
  authors: z.string(),
  title: z.string(),
  journal: z.string(),
  year: z.number(),
  link: z.string().optional(),
  doi: z.string().optional(),
  arxiv: z.string().optional(),
  volume: z.string().optional(),
  pages: z.string().optional(),
  pmid: z.string().optional(),
  abstract: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  citations: z.number().optional(),
  mentions: z.array(z.object({ text: z.string(), href: z.string() })).optional(),
})

export const ExperienceSchema = z.object({
  period: z.string(),
  position: z.string(),
  company: z.string(),
  href: z.string(),
  description: z.string(),
  stack: z.string(),
  mentions: z.array(z.object({ text: z.string(), href: z.string() })).default([]),
})

// ============== Type Exports ==============

export type ExternalArticle = z.infer<typeof ExternalArticleSchema>
export type Project = z.infer<typeof ProjectSchema>
export type Publication = z.infer<typeof PublicationSchema>
export type Experience = z.infer<typeof ExperienceSchema>

// ============== Validation Functions ==============

export function validateBlogPost(data: any): BlogPostFrontmatter {
  return BlogPostFrontmatterSchema.parse(data)
}

export function validateExternalArticle(data: any): Required<ExternalArticle> {
  const validated = ExternalArticleSchema.parse(data)
  return {
    title: validated.title,
    source: validated.source,
    href: validated.href,
    date: validated.date,
    tags: validated.tags,
    author: validated.author || DEFAULT_AUTHOR,
    description: validated.description || '',
    image: validated.image || DEFAULT_IMAGE,
    mentions: validated.mentions || [],
    views_k: validated.views_k ?? 0,
    migdal_score: validated.migdal_score,
  }
}