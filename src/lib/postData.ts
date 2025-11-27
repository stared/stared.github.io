import type { CollectionEntry } from 'astro:content';

export interface BasePostData {
  title: string;
  date: string;
  tags: string[];
  description: string;
  image: string;
  author: string;
  mentions: Array<{ text: string; href: string }>;
  views_k: number;
  migdal_score: number;
}

export interface ExternalPostData extends BasePostData {
  source: string;
  href: string;
}

export type UnifiedPost =
  | { type: 'internal'; id: string; data: BasePostData }
  | { type: 'external'; data: ExternalPostData };

type RawExternalPost = CollectionEntry<'externalArticles'>['data'];
export type BlogPost = CollectionEntry<'blog'> | RawExternalPost;

function isRawExternalPost(post: BlogPost): post is RawExternalPost {
  return 'href' in post && 'source' in post;
}

export function normalizePost(post: BlogPost): UnifiedPost {
  if (isRawExternalPost(post)) {
    return {
      type: 'external',
      data: {
        title: post.title,
        date: post.date,
        tags: post.tags,
        description: post.description,
        image: post.image,
        author: post.author,
        mentions: post.mentions,
        views_k: post.views_k,
        migdal_score: post.migdal_score,
        source: post.source,
        href: post.href,
      },
    };
  }

  return {
    type: 'internal',
    id: post.id,
    data: {
      title: post.data.title,
      date: post.data.date.toISOString(),
      tags: post.data.tags,
      description: post.data.description,
      image: post.data.image,
      author: post.data.author,
      mentions: post.data.mentions,
      views_k: post.data.views_k,
      migdal_score: post.data.migdal_score,
    },
  };
}

export interface PostScores {
  readonly popularity: number;
  readonly mentions: number;
  readonly age: number;
  readonly migdalBias: number;
}

export interface ScoredBlogPost {
  readonly post: UnifiedPost;
  readonly scores: PostScores;
  readonly initialOrder: number;
}

export const DEFAULT_WEIGHTS = {
  popularity: 4,
  mentions: 2,
  age: -8,
  migdalScore: 2,
} as const;

export function calculatePostScores(post: UnifiedPost, referenceDate: Date): PostScores {
  const { data } = post;
  const popularity = data.views_k > 0 ? Math.log2(data.views_k) : 0;
  const importantMentions = data.mentions.filter(
    (m) => !m.href.includes('medium.com')
  ).length;
  const mentions = Math.sqrt(importantMentions);
  const yearsSince =
    (referenceDate.getTime() - new Date(data.date).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const age = Math.log2(Math.max(yearsSince, 0.01));

  return { popularity, mentions, age, migdalBias: data.migdal_score };
}

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

export function createScoredPosts(
  posts: UnifiedPost[],
  weights = DEFAULT_WEIGHTS
): ScoredBlogPost[] {
  const referenceDate = new Date();

  const scored = posts.map((post) => ({
    post,
    scores: calculatePostScores(post, referenceDate),
    initialOrder: 0,
  }));

  const sorted = sortScoredPosts(scored, weights);

  return sorted.map((sp, index) => ({
    ...sp,
    initialOrder: index,
  }));
}

export function getPostUrl(post: UnifiedPost): string {
  return post.type === 'external'
    ? post.data.href
    : `/blog/${post.id.replace(/\/index\.mdx?$/, '')}`;
}

export function isExternal(post: UnifiedPost): post is UnifiedPost & { type: 'external' } {
  return post.type === 'external';
}

export function hasHackerNews(post: UnifiedPost): boolean {
  return post.data.mentions.some((m) => m.href.includes('news.ycombinator'));
}

export function formatPostDate(post: UnifiedPost): string {
  return new Date(post.data.date).toLocaleDateString('en-us', {
    year: 'numeric',
    month: 'short',
  });
}

export function getAllTagsWithCounts(scoredPosts: readonly ScoredBlogPost[]) {
  const counter: Record<string, number> = { all: scoredPosts.length };

  for (const { post } of scoredPosts) {
    for (const tag of post.data.tags) {
      counter[tag] = (counter[tag] || 0) + 1;
    }
  }

  return Object.entries(counter)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export function filterScoredPostsByTag(
  scoredPosts: readonly ScoredBlogPost[],
  tag: string
): ScoredBlogPost[] {
  if (tag === 'all') return [...scoredPosts];
  return scoredPosts.filter(({ post }) => post.data.tags.includes(tag));
}
