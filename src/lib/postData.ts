import type { CollectionEntry } from 'astro:content';

// External posts come from external-articles.json
export interface ExternalPost {
  title: string;
  date: string;
  tags: string[];
  mentions?: Array<{ text: string; href: string }>;
  view_k?: number;
  views_k?: number;
  migdal_score: number;
  source: string;
  href: string;
  description?: string;
  image?: string;
  author?: string;
}

// Unified blog post type that works with both internal and external posts
export type BlogPost = CollectionEntry<'blog'> | ExternalPost;

// Scores computed once at build time - prevents hydration mismatches
export interface PostScores {
  readonly popularity: number;
  readonly mentions: number;
  readonly age: number;
  readonly migdalBias: number;
}

// Post with pre-computed scores attached
export interface ScoredBlogPost {
  readonly post: BlogPost;
  readonly scores: PostScores;
  readonly initialOrder: number; // Position in default-sorted list
}

// Default weights for sorting blog posts
// Used to ensure SSR and CSR render identical initial state
export const DEFAULT_WEIGHTS = {
  popularity: 4,
  mentions: 2,
  age: -8,
  migdalScore: 2,
} as const;

// Helper to get URL from a post
export function getPostUrl(post: BlogPost): string {
  return 'href' in post ? post.href : `/blog/${post.id.replace(/\/index\.mdx?$/, '')}`;
}

// Helper to check if post is external
export function isExternalPost(post: BlogPost): post is ExternalPost {
  return 'href' in post;
}

// Scoring utilities - referenceDate is REQUIRED to prevent SSR/CSR hydration mismatches
export function calculatePostScores(post: BlogPost, referenceDate: Date): PostScores {
  const data = 'data' in post ? post.data : post;
  const viewsK = data.views_k || ('view_k' in data ? data.view_k : 0) || 0;
  const popularity = viewsK > 0 ? Math.log2(viewsK) : 0;
  const postMentions = data.mentions || [];
  const importantMentions = postMentions.filter(
    (m: { href: string }) => !m.href.includes('medium.com')
  ).length;
  const mentions = Math.sqrt(importantMentions);
  const yearsSince =
    (referenceDate.getTime() - new Date(data.date).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const age = Math.log2(Math.max(yearsSince, 0.01)); // Avoid log(0) for very recent posts

  return { popularity, mentions, age, migdalBias: data.migdal_score };
}

// Sort ScoredBlogPosts using pre-computed scores (no Date.now() calls)
export function sortScoredPosts(
  scoredPosts: readonly ScoredBlogPost[],
  weights: { popularity: number; mentions: number; age: number; migdalScore: number }
): ScoredBlogPost[] {
  return [...scoredPosts].sort((a, b) => {
    const wa =
      weights.popularity * a.scores.popularity +
      weights.mentions * a.scores.mentions +
      weights.age * a.scores.age +
      weights.migdalScore * a.scores.migdalBias;
    const wb =
      weights.popularity * b.scores.popularity +
      weights.mentions * b.scores.mentions +
      weights.age * b.scores.age +
      weights.migdalScore * b.scores.migdalBias;
    return wb - wa;
  });
}

// Create scored posts with pre-computed scores at build time
// This is the SINGLE SOURCE OF TRUTH for initial render
export function createScoredPosts(
  posts: BlogPost[],
  weights = DEFAULT_WEIGHTS
): ScoredBlogPost[] {
  const referenceDate = new Date(); // Single reference for all posts

  const scored = posts.map((post) => ({
    post,
    scores: calculatePostScores(post, referenceDate),
    initialOrder: 0, // Will be set after sorting
  }));

  const sorted = sortScoredPosts(scored, weights);

  // Assign initial order indices
  return sorted.map((sp, index) => ({
    ...sp,
    initialOrder: index,
  }));
}

// Helper to get post data from ScoredBlogPost
export function getPostData(sp: ScoredBlogPost) {
  return 'data' in sp.post ? sp.post.data : sp.post;
}

// Check if post has Hacker News mention
export function hasHackerNews(post: BlogPost): boolean {
  const data = 'data' in post ? post.data : post;
  return (data.mentions || []).some((m: { href: string }) => m.href.includes('news.ycombinator'));
}

// Format date for display
export function formatPostDate(post: BlogPost): string {
  const data = 'data' in post ? post.data : post;
  return new Date(data.date).toLocaleDateString('en-us', {
    year: 'numeric',
    month: 'short',
  });
}

// Get all tags with counts from ScoredBlogPosts
export function getAllTagsWithCounts(scoredPosts: readonly ScoredBlogPost[]) {
  const counter: Record<string, number> = { all: scoredPosts.length };

  for (const { post } of scoredPosts) {
    const data = 'data' in post ? post.data : post;
    const tags = data.tags || [];
    for (const tag of tags) {
      counter[tag] = (counter[tag] || 0) + 1;
    }
  }

  return Object.entries(counter)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

// Filter ScoredBlogPosts by tag
export function filterScoredPostsByTag(
  scoredPosts: readonly ScoredBlogPost[],
  tag: string
): ScoredBlogPost[] {
  if (tag === 'all') return [...scoredPosts];
  return scoredPosts.filter(({ post }) => {
    const data = 'data' in post ? post.data : post;
    return (data.tags || []).includes(tag);
  });
}
