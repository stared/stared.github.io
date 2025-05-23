/**
 * Base content interface for all content types
 */
export interface BaseContent {
  _path?: string;
  path?: string;
  title: string;
  description?: string;
  [key: string]: any;
}

/**
 * Blog post content interface
 */
export interface BlogPost extends BaseContent {
  date: string;
  author?: string;
  tags?: string[];
  image?: string;
  mentions?: Mention[];
  views_k?: number;
  migdal_score?: number;
  body?: any; // For the rendered content body
}

/**
 * Text component content interface
 */
export interface TextComponent extends BaseContent {
  // Text components can have flexible content
}

/**
 * Mention interface
 */
export interface Mention {
  text: string;
  href: string;
}

/**
 * External post interface
 */
export interface ExternalPost {
  title: string;
  date: string;
  tags: string[];
  source: string;
  href: string;
  mentions?: Mention[];
  views_k?: number;
  migdal_score?: number;
  description?: string;
  image?: string;
  author?: string;
}

/**
 * Similarity data interface
 */
export interface SimilarityData {
  stem?: string;
  most_similar?: SimilarPost[];
}

/**
 * Similar post interface
 */
export interface SimilarPost {
  slug: string;
  similarity: number;
  title: string;
  path: string;
}

/**
 * Project interface
 */
export interface Project {
  title: string;
  desc: string;
  href: string;
  dateStart: string | null;
  dateEnd: string | null;
  status: string;
  mentions?: Mention[];
}

/**
 * Navigation item interface
 */
export interface NavigationItem {
  name: string;
  path: string;
}
