/**
 * Core content types with strict typing
 * All fields are required unless they truly can be absent
 */

// ============== Base Types ==============

export interface Mention {
  text: string;
  href: string;
}

export interface DateRange {
  dateStart: string; // ISO 8601 format
  dateEnd: string | null; // null for ongoing
}

// ============== Blog Post Types ==============

export interface BlogPostFrontmatter {
  title: string;
  date: string; // ISO 8601 format
  author: string; // Default: "Piotr Migdał"
  description: string; // For SEO and previews
  tags: string[];
  image: string | null; // Hero image URL or null
  mentions: Mention[];
  views_k: number; // Views in thousands, default: 0
  migdal_score: number; // Personal preference score, default: 0
}

export interface BlogPostContent extends BlogPostFrontmatter {
  _path: string; // Nuxt Content path
  _id: string;
  _type: string;
  _source: string;
  _file: string;
  _extension: string;
  body: object; // Nuxt Content parsed body
  excerpt: object | null;
  navigation: {
    title: string;
    _path: string;
  };
}

// ============== External Article Types ==============

export interface ExternalArticle {
  title: string;
  source: string; // Publication name
  href: string; // Full URL
  date: string; // ISO 8601 format
  author: string; // Default: "Piotr Migdał"
  description: string; // Summary or excerpt
  image: string | null; // Preview image URL or null
  tags: string[];
  mentions: Mention[];
  views_k: number; // Views in thousands, default: 0
  migdal_score: number; // Personal preference score, default: 0
}

export interface ExternalArticlesData {
  items: ExternalArticle[];
}

// ============== Project Types ==============

export interface Project {
  title: string;
  desc: string; // Description
  href: string; // Project URL
  dateStart: string; // ISO 8601 format
  dateEnd: string | null; // null for ongoing projects
  status: 'active' | 'completed' | 'archived' | 'on-hold';
  tags: string[];
  mentions: Mention[];
  role: string; // e.g., "Lead Developer", "Founder"
  technologies: string[]; // Tech stack used
}

export interface ProjectsData {
  items: Project[];
}

// ============== Publication Types ==============

export interface Publication {
  authors: string; // Comma-separated list
  title: string;
  journal: string;
  year: number; // Numeric year
  volume: string | null;
  pages: string | null;
  doi: string | null; // Digital Object Identifier
  arxiv: string | null; // arXiv identifier
  pmid: string | null; // PubMed ID
  abstract: string;
  keywords: string[];
  citations: number; // Citation count, default: 0
}

export interface PublicationsData {
  items: Publication[];
}

// ============== Experience Types ==============

export interface Experience {
  title: string;
  company: string;
  location: string;
  dateStart: string; // ISO 8601 format
  dateEnd: string | null; // null for current position
  description: string;
  achievements: string[];
  technologies: string[];
}

export interface ExperiencesData {
  items: Experience[];
}

// ============== Media Mention Types ==============

export interface MediaMention {
  title: string;
  outlet: string; // Media outlet name
  href: string;
  date: string; // ISO 8601 format
  type: 'interview' | 'quote' | 'feature' | 'mention';
  language: string; // ISO 639-1 code
  description: string;
}

export interface MediaMentionsData {
  items: MediaMention[];
}

// ============== Similarity Types ==============

export interface SimilarPost {
  slug: string;
  path: string;
  title: string;
  similarity: number; // Cosine similarity score 0-1
}

export interface SimilarityData {
  stem: string; // e.g., "similarities/2017_01_king-man-woman-queen-why"
  most_similar: SimilarPost[];
}

// ============== Text Component Types ==============

export interface TextComponent {
  _path: string;
  _id: string;
  title: string;
  body: object; // Markdown/MDC content
  navigation: {
    title: string;
    _path: string;
  };
}

// ============== Utility Types ==============

export type PostSource = 
  | { type: 'internal'; path: string }
  | { type: 'external'; href: string; source: string };

export interface ProcessedBlogPost {
  title: string;
  date: string;
  displayDate: string; // Formatted for display
  tags: string[];
  mentions: Mention[];
  views_k: number;
  migdal_score: number;
  description: string;
  image: string | null;
  author: string;
  source: PostSource;
  popularity: number; // Calculated score
  age: number; // Years since publication
  mentionCount: number; // Important mentions only
  weight: number; // Combined weight for sorting
}

// ============== Type Guards ==============

export function isBlogPostContent(obj: unknown): obj is BlogPostContent {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'title' in obj &&
    'date' in obj &&
    '_path' in obj
  );
}

export function isExternalArticle(obj: unknown): obj is ExternalArticle {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'href' in obj &&
    'source' in obj &&
    !('_path' in obj)
  );
}

export function hasValidDate(date: unknown): date is string {
  if (typeof date !== 'string') return false;
  const parsed = Date.parse(date);
  return !isNaN(parsed);
}

// ============== Default Values ==============

export const DEFAULT_VALUES = {
  author: 'Piotr Migdał',
  views_k: 0,
  migdal_score: 0,
  mentions: [] as Mention[],
  tags: [] as string[],
  description: '',
  image: null as string | null,
} as const;

// Export for use in other modules
export { DEFAULT_VALUES as ContentDefaults };

// ============== Validation Helpers ==============

export function validateBlogPost(data: Partial<BlogPostFrontmatter>): BlogPostFrontmatter {
  if (!data.title) throw new Error('Blog post must have a title');
  if (!data.date || !hasValidDate(data.date)) {
    throw new Error('Blog post must have a valid date');
  }

  return {
    title: data.title,
    date: data.date,
    author: data.author || DEFAULT_VALUES.author,
    description: data.description || DEFAULT_VALUES.description,
    tags: data.tags || DEFAULT_VALUES.tags,
    image: data.image !== undefined ? data.image : DEFAULT_VALUES.image,
    mentions: data.mentions || DEFAULT_VALUES.mentions,
    views_k: data.views_k ?? DEFAULT_VALUES.views_k,
    migdal_score: data.migdal_score ?? DEFAULT_VALUES.migdal_score,
  };
}

export function validateExternalArticle(data: Partial<ExternalArticle>): ExternalArticle {
  if (!data.title) throw new Error('External article must have a title');
  if (!data.source) throw new Error('External article must have a source');
  if (!data.href) throw new Error('External article must have an href');
  if (!data.date || !hasValidDate(data.date)) {
    throw new Error('External article must have a valid date');
  }

  return {
    title: data.title,
    source: data.source,
    href: data.href,
    date: data.date,
    author: data.author || DEFAULT_VALUES.author,
    description: data.description || DEFAULT_VALUES.description,
    image: data.image !== undefined ? data.image : DEFAULT_VALUES.image,
    tags: data.tags || DEFAULT_VALUES.tags,
    mentions: data.mentions || DEFAULT_VALUES.mentions,
    views_k: data.views_k ?? DEFAULT_VALUES.views_k,
    migdal_score: data.migdal_score ?? DEFAULT_VALUES.migdal_score,
  };
}