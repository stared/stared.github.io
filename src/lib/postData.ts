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

// Helper to get URL from a post
export function getPostUrl(post: BlogPost): string {
  return 'href' in post ? post.href : `/blog/${post.slug}`;
}

// Helper to check if post is external
export function isExternalPost(post: BlogPost): post is ExternalPost {
  return 'href' in post;
}

// Scoring utilities
export function calculatePostScores(post: BlogPost) {
  const data = 'data' in post ? post.data : post;
  const viewsK = data.views_k || ('view_k' in data ? data.view_k : 0) || 0;
  const popularity = viewsK > 0 ? Math.log2(viewsK) : 0;
  const postMentions = data.mentions || [];
  const importantMentions = postMentions.filter(
    (m: { href: string }) => !m.href.includes('medium.com')
  ).length;
  const mentions = Math.sqrt(importantMentions);
  const yearsSince =
    (Date.now() - new Date(data.date).getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const age = Math.log2(yearsSince);

  return { popularity, mentions, age, migdalBias: data.migdal_score };
}

export function calculatePostWeight(
  post: BlogPost,
  weightPopularity: number,
  weightMentions: number,
  weightAge: number,
  migdalweight: number
): number {
  const { popularity, mentions, age, migdalBias } = calculatePostScores(post);
  return (
    weightPopularity * popularity +
    weightMentions * mentions +
    weightAge * age +
    migdalweight * migdalBias
  );
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

// Manage collection of blog posts
export class BlogPostCollection {
  constructor(public posts: BlogPost[] = []) {}

  addPosts(...newPosts: BlogPost[]) {
    this.posts.push(...newPosts);
    return this;
  }

  filterByTag(tag: string) {
    const filtered =
      tag === 'all'
        ? [...this.posts]
        : this.posts.filter((post) => {
            const data = 'data' in post ? post.data : post;
            return (data.tags || []).includes(tag);
          });
    return new BlogPostCollection(filtered);
  }

  sortByWeights(
    weightPopularity: number,
    weightMentions: number,
    weightAge: number,
    migdalWeight: number
  ) {
    const sorted = [...this.posts].sort((a, b) => {
      const weightA = calculatePostWeight(
        a,
        weightPopularity,
        weightMentions,
        weightAge,
        migdalWeight
      );
      const weightB = calculatePostWeight(
        b,
        weightPopularity,
        weightMentions,
        weightAge,
        migdalWeight
      );
      return weightB - weightA;
    });
    return new BlogPostCollection(sorted);
  }

  getAllTagsWithCounts() {
    const counter: Record<string, number> = { all: this.posts.length };

    for (const post of this.posts) {
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
}
