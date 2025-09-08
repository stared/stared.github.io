import type { BlogPost, ExternalArticle, Mention } from '~/schemas'
import { validateBlogPost, validateExternalArticle } from '~/schemas'

// Internal processing type - ALL FIELDS ARE REQUIRED
export interface ProcessedBlogPost {
  // Core content fields
  title: string
  date: string
  description: string
  author: string
  tags: string[]
  image: string
  mentions: Mention[]
  views_k: number
  migdal_score: number
  
  // Computed display fields
  displayDate: string
  popularity: number
  age: number
  mentionCount: number
  weight: number
  
  // Nuxt Content fields (always have values, even for external)
  _path: string
  _id: string
  _type: 'markdown'
  _source: string
  body: any
  excerpt: any
  
  // External tracking
  isExternal: boolean
  href: string
  source: string
}

export class BlogPostProcessor {
  private readonly post: ProcessedBlogPost;

  private constructor(post: ProcessedBlogPost) {
    this.post = post;
  }

  static fromBlogContent(content: BlogPost): BlogPostProcessor {
    const validated = validateBlogPost(content);
    
    const path = content._path || '/blog/' + content.title.toLowerCase().replace(/\s+/g, '-');
    return new BlogPostProcessor({
      title: validated.title,
      date: validated.date,
      displayDate: BlogPostProcessor.formatDisplayDate(validated.date),
      tags: validated.tags,
      mentions: validated.mentions,
      views_k: validated.views_k,
      migdal_score: validated.migdal_score,
      description: validated.description,
      image: validated.image,
      author: validated.author,
      popularity: BlogPostProcessor.calculatePopularity(validated.views_k),
      age: BlogPostProcessor.calculateAge(validated.date),
      mentionCount: BlogPostProcessor.countImportantMentions(validated.mentions),
      weight: 0,
      _path: path,
      _id: content._id || path,
      _type: 'markdown' as const,
      _source: content._source || '',
      body: content.body || null,
      excerpt: content.excerpt || null,
      isExternal: false,
      href: path,
      source: 'internal',
    });
  }

  static fromExternalArticle(article: ExternalArticle): BlogPostProcessor {
    const validated = validateExternalArticle(article);
    
    return new BlogPostProcessor({
      title: validated.title,
      date: validated.date,
      displayDate: BlogPostProcessor.formatDisplayDate(validated.date),
      tags: validated.tags,
      mentions: validated.mentions,
      views_k: validated.views_k,
      migdal_score: validated.migdal_score,
      description: validated.description,
      image: validated.image,
      author: validated.author,
      popularity: BlogPostProcessor.calculatePopularity(validated.views_k),
      age: BlogPostProcessor.calculateAge(validated.date),
      mentionCount: BlogPostProcessor.countImportantMentions(validated.mentions),
      weight: 0,
      _path: `/external/${validated.title.toLowerCase().replace(/\s+/g, '-')}`,
      _id: `external-${validated.href}`,
      _type: 'markdown' as const,
      _source: validated.source,
      body: null,
      excerpt: null,
      isExternal: true,
      href: validated.href,
      source: validated.source,
    });
  }

  private static formatDisplayDate(date: string): string {
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.error(`Invalid date format: ${date}`);
      return 'Invalid Date';
    }
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  }

  private static calculatePopularity(views_k: number): number {
    return views_k > 0 ? Math.log2(views_k) : 0;
  }

  private static calculateAge(date: string): number {
    const now = new Date();
    const postDate = new Date(date);
    const yearsSince = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    return Math.max(0, yearsSince);
  }

  private static countImportantMentions(mentions: Mention[]): number {
    return mentions.filter(
      mention => !mention.href.includes('medium.com')
    ).length;
  }

  get data(): ProcessedBlogPost {
    return { ...this.post };
  }

  get hasHackerNews(): boolean {
    return this.post.mentions.some(
      (mention: Mention) => mention.href.includes('news.ycombinator')
    );
  }

  calculateWeight(
    weightPopularity: number,
    weightMentions: number,
    weightAge: number,
    weightBias: number
  ): number {
    const ageScore = this.post.age > 0 ? Math.log2(this.post.age) : 0;
    const mentionScore = Math.sqrt(this.post.mentionCount);
    
    return (
      weightPopularity * this.post.popularity +
      weightMentions * mentionScore +
      weightAge * ageScore +
      weightBias * this.post.migdal_score
    );
  }

  withWeight(
    weightPopularity: number,
    weightMentions: number,
    weightAge: number,
    weightBias: number
  ): BlogPostProcessor {
    return new BlogPostProcessor({
      ...this.post,
      weight: this.calculateWeight(weightPopularity, weightMentions, weightAge, weightBias),
    });
  }
}

export class BlogPostCollection {
  private readonly posts: BlogPostProcessor[];

  constructor(posts: BlogPostProcessor[] = []) {
    this.posts = posts;
  }

  static create(): BlogPostCollection {
    return new BlogPostCollection([]);
  }

  addBlogContent(contents: BlogPost[]): BlogPostCollection {
    const newPosts = contents.map(content => BlogPostProcessor.fromBlogContent(content));
    return new BlogPostCollection([...this.posts, ...newPosts]);
  }

  addExternalArticles(articles: ExternalArticle[]): BlogPostCollection {
    const newPosts = articles.map(article => BlogPostProcessor.fromExternalArticle(article));
    return new BlogPostCollection([...this.posts, ...newPosts]);
  }

  filterByTag(tag: string): BlogPostCollection {
    if (tag === 'all') {
      return new BlogPostCollection([...this.posts]);
    }
    
    const filtered = this.posts.filter(
      post => post.data.tags.includes(tag)
    );
    return new BlogPostCollection(filtered);
  }

  sortByWeight(
    weightPopularity: number,
    weightMentions: number,
    weightAge: number,
    weightBias: number
  ): BlogPostCollection {
    const weighted = this.posts.map(post =>
      post.withWeight(weightPopularity, weightMentions, weightAge, weightBias)
    );
    
    const sorted = [...weighted].sort(
      (a, b) => b.data.weight - a.data.weight
    );
    
    return new BlogPostCollection(sorted);
  }

  getTagCounts(): Map<string, number> {
    const counts = new Map<string, number>();
    counts.set('all', this.posts.length);
    
    for (const post of this.posts) {
      for (const tag of post.data.tags) {
        counts.set(tag, (counts.get(tag) || 0) + 1);
      }
    }
    
    return counts;
  }

  getTagCountsSorted(): Array<{ name: string; count: number }> {
    const counts = this.getTagCounts();
    return Array.from(counts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => {
        // 'all' tag always first
        if (a.name === 'all') return -1;
        if (b.name === 'all') return 1;
        // Then sort by count descending
        return b.count - a.count;
      });
  }

  get items(): ProcessedBlogPost[] {
    return this.posts.map(post => post.data);
  }

  get length(): number {
    return this.posts.length;
  }
}

// Re-export types for backward compatibility
export type { BlogPost, ExternalArticle, Mention } from '~/schemas'