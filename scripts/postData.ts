export interface Mention {
  title: string;
  href: string;
}

export interface BasePost {
  title: string;
  date: string;
  tags: string[];
  mentions?: Mention[];
  views_k?: number;
  migdal_score?: number;
}

export interface ExternalPost extends BasePost {
  source: string;
  href: string;
  description?: string;
  image?: string;
  author?: string;
}

export interface BlogPostMetadata extends BasePost {
  slug?: string;
  author?: string;
  description?: string;
  image?: string;
  _path?: string;
  path: string;
}

type ExternalPostSource = {
  isExternal: true;
  href: string;
  source: string;
};

type InternalPostSource = {
  isExternal: false;
  path: string;
};

type PostSource = ExternalPostSource | InternalPostSource;

export class BlogPostLabel {
  title: string;
  date: string;
  tags: string[];
  mentions: Mention[];
  views_k: number;
  migdal_score: number;
  description: string;
  image: string;
  postSource: PostSource;
  author: string;

  private constructor(
    title: string,
    date: string,
    tags: string[],
    mentions: Mention[],
    views_k: number,
    migdal_score: number,
    description: string,
    image: string,
    author: string,
    postSource: PostSource
  ) {
    this.title = title;
    this.date = date;
    this.tags = tags;
    this.mentions = mentions;
    this.views_k = views_k;
    this.migdal_score = migdal_score;
    this.description = description;
    this.image = image;
    this.author = author;
    this.postSource = postSource;
  }

  static fromQueryContent(post: BlogPostMetadata): BlogPostLabel {
    return new BlogPostLabel(
      post.title,
      post.date,
      post.tags || [],
      post.mentions || [],
      post.views_k || 0,
      post.migdal_score || 0,
      post.description || "",
      post.image || "",
      post.author || "Piotr Migdał",
      {
        isExternal: false,
        path: post.path,
      }
    );
  }

  static fromExternalPost(post: ExternalPost): BlogPostLabel {
    return new BlogPostLabel(
      post.title,
      post.date,
      post.tags || [],
      post.mentions || [],
      post.views_k || 0,
      post.migdal_score || 0,
      post.description || "",
      post.image || "",
      post.author || "Piotr Migdał",
      {
        isExternal: true,
        href: post.href,
        source: post.source,
      }
    );
  }

  get hn(): boolean {
    return (
      this.mentions &&
      Array.isArray(this.mentions) &&
      this.mentions.some((mention: Mention) =>
        mention.href.includes("news.ycombinator")
      )
    );
  }

  get displayDate(): string {
    const dateObj = new Date(this.date);
    if (isNaN(dateObj.getTime())) {
      throw new Error(`Invalid date format: ${this.date}`);
    }
    return dateObj.toLocaleDateString("en-us", {
      year: "numeric",
      month: "short",
    });
  }

  get importantMentionCount(): number {
    return this.mentions.filter(
      (mention) => !mention.href.includes("medium.com")
    ).length;
  }

  toScores(): {
    popularity: number;
    mentions: number;
    age: number;
    migdalBias: number;
  } {
    const popularity = this.views_k ? Math.log2(this.views_k) : 0;
    const mentionsCount = Math.sqrt(this.importantMentionCount);
    const now = new Date();
    const postDate = new Date(this.date);
    const yearsSince =
      (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const age = Math.log2(yearsSince);

    return {
      popularity,
      mentions: mentionsCount,
      age,
      migdalBias: this.migdal_score,
    };
  }

  toWeight(
    weightPopularity: number,
    weightMentions: number,
    weightAge: number,
    migdalweight: number
  ): number {
    const { popularity, mentions, age, migdalBias } = this.toScores();
    return (
      weightPopularity * popularity +
      weightMentions * mentions +
      weightAge * age +
      migdalweight * migdalBias
    );
  }
}

export class BlogPostLabels {
  items: BlogPostLabel[];

  constructor(items: BlogPostLabel[]) {
    this.items = items;
  }

  static new(): BlogPostLabels {
    return new BlogPostLabels([]);
  }

  addExternal(posts: ExternalPost[]): BlogPostLabels {
    this.items.push(...posts.map(BlogPostLabel.fromExternalPost));
    return this;
  }

  addInternal(posts: BlogPostMetadata[]): BlogPostLabels {
    this.items.push(...posts.map(BlogPostLabel.fromQueryContent));
    return this;
  }

  /** Filter as a copy, unless 'all' is selected */
  filterByTag(tag: string): BlogPostLabels {
    if (tag === "all") {
      return new BlogPostLabels([...this.items]);
    }
    return new BlogPostLabels(
      this.items.filter((post) => post.tags && post.tags.includes(tag))
    );
  }

  /** Sort as a copy */
  sortByWeights(
    weightPopularity: number,
    weightMentions: number,
    weightAge: number,
    migdalWeight: number
  ): BlogPostLabels {
    const sortedItems = [...this.items].sort(
      (a, b) =>
        b.toWeight(weightPopularity, weightMentions, weightAge, migdalWeight) -
        a.toWeight(weightPopularity, weightMentions, weightAge, migdalWeight)
    );
    return new BlogPostLabels(sortedItems);
  }

  allTagsCounted(): { name: string; count: number }[] {
    const counter: Record<string, number> = {};
    this.items.forEach((post) =>
      post.tags.forEach((tag: string) => {
        counter[tag] = (counter[tag] || 0) + 1;
      })
    );
    counter["all"] = this.items.length;
    return Object.entries(counter)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }
}
