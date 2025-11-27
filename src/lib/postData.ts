import type { CollectionEntry } from 'astro:content';

interface Mention { text: string; href: string }

interface PostScores {
  popularity: number;
  mentions: number;
  age: number;
  migdalBias: number;
}

export interface Post {
  id: string;
  url: string;
  isExternal: boolean;
  source?: string;
  title: string;
  description: string;
  tags: string[];
  image: string;
  author: string;
  date: Date;
  formattedDate: string;
  mentions: Mention[];
  hasHN: boolean;
  views_k: number;
  migdal_score: number;
  scores: PostScores;
  initialOrder: number;
}

export const DEFAULT_WEIGHTS = { popularity: 4, mentions: 2, age: -8, migdalScore: 2 } as const;

type BlogEntry = CollectionEntry<'blog'>;
type ExternalEntry = CollectionEntry<'externalArticles'>['data'];

function computeScores(date: Date, views_k: number, mentions: Mention[], migdal_score: number, refDate: Date): PostScores {
  const popularity = views_k > 0 ? Math.log2(views_k) : 0;
  const importantMentions = mentions.filter(m => !m.href.includes('medium.com')).length;
  const mentionsScore = Math.sqrt(importantMentions);
  const years = (refDate.getTime() - date.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const age = Math.log2(Math.max(years, 0.01));
  return { popularity, mentions: mentionsScore, age, migdalBias: migdal_score };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-us', { year: 'numeric', month: 'short' });
}

function computeScore(scores: PostScores, weights: typeof DEFAULT_WEIGHTS): number {
  return weights.popularity * scores.popularity +
         weights.mentions * scores.mentions +
         weights.age * scores.age +
         weights.migdalScore * scores.migdalBias;
}

function fromBlogEntry(entry: BlogEntry, refDate: Date): Omit<Post, 'initialOrder'> {
  const d = entry.data;
  const date = d.date;
  return {
    id: entry.id,
    url: `/blog/${entry.id.replace(/\/index\.mdx?$/, '')}`,
    isExternal: false,
    title: d.title,
    description: d.description,
    tags: d.tags,
    image: d.image,
    author: d.author,
    date,
    formattedDate: formatDate(date),
    mentions: d.mentions,
    hasHN: d.mentions.some(m => m.href.includes('news.ycombinator')),
    views_k: d.views_k,
    migdal_score: d.migdal_score,
    scores: computeScores(date, d.views_k, d.mentions, d.migdal_score, refDate),
  };
}

function fromExternalEntry(entry: ExternalEntry, refDate: Date): Omit<Post, 'initialOrder'> {
  const date = new Date(entry.date);
  return {
    id: entry.href,
    url: entry.href,
    isExternal: true,
    source: entry.source,
    title: entry.title,
    description: entry.description,
    tags: entry.tags,
    image: entry.image,
    author: entry.author,
    date,
    formattedDate: formatDate(date),
    mentions: entry.mentions,
    hasHN: entry.mentions.some(m => m.href.includes('news.ycombinator')),
    views_k: entry.views_k,
    migdal_score: entry.migdal_score,
    scores: computeScores(date, entry.views_k, entry.mentions, entry.migdal_score, refDate),
  };
}

export function createPosts(
  blogEntries: BlogEntry[],
  externalEntries: ExternalEntry[],
  weights = DEFAULT_WEIGHTS
): Post[] {
  const refDate = new Date();

  const posts = [
    ...blogEntries.map(e => fromBlogEntry(e, refDate)),
    ...externalEntries.map(e => fromExternalEntry(e, refDate)),
  ];

  posts.sort((a, b) => computeScore(b.scores, weights) - computeScore(a.scores, weights));

  return posts.map((p, i) => ({ ...p, initialOrder: i }));
}

export function sortPosts(posts: Post[], weights: typeof DEFAULT_WEIGHTS): Post[] {
  return [...posts].sort((a, b) => computeScore(b.scores, weights) - computeScore(a.scores, weights));
}

export function getTagCounts(posts: Post[]): { name: string; count: number }[] {
  const counts: Record<string, number> = { all: posts.length };
  for (const p of posts) for (const t of p.tags) counts[t] = (counts[t] || 0) + 1;
  return Object.entries(counts).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
}

export function filterByTag(posts: Post[], tag: string): Post[] {
  return tag === 'all' ? posts : posts.filter(p => p.tags.includes(tag));
}
