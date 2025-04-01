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
}

export interface BlogPostMetadata extends BasePost {
  slug?: string;
  author?: string;
  description?: string;
  image?: string;
  _path?: string;
  path?: string;
}

type ExternalPostSource = {
  isExternal: true;
  href: string;
  source: string;
};

type InternalPostSource = {
  isExternal: false;
  _path: string;
};

type PostSource = ExternalPostSource | InternalPostSource;

export class BlogPostLabel {
  title: string;
  date: string;
  tags: string[];
  mentions: Mention[];
  views_k?: number;
  migdal_score: number;
  description: string;
  image: string;
  postSource: PostSource;
  author: string;

  constructor(post: any, isExternal: boolean = false) {
    this.title = post.title;
    this.date = post.date;
    this.tags = post.tags || [];
    this.mentions = post.mentions || [];
    this.views_k = post.views_k;
    this.migdal_score = post.migdal_score || 0;
    this.description = post.description || "";
    this.image = post.image || "";

    if (isExternal) {
      this.postSource = {
        isExternal: true,
        href: post.href,
        source: post.source,
      };
    } else {
      // Handle Content v3 path property
      const contentPath = post._path || post.path;
      this.postSource = {
        isExternal: false,
        _path: contentPath,
      };
    }
    this.author = post.author || "Piotr Migdał";
  }

  static fromQueryContent(post: BlogPostMetadata): BlogPostLabel {
    return new BlogPostLabel(post);
  }

  static fromExternalPost(post: ExternalPost): BlogPostLabel {
    return new BlogPostLabel(post, true);
  }

  get hn(): boolean {
    return this.mentions.some((mention: Mention) =>
      mention.href.includes("news.ycombinator")
    );
  }

  get displayDate(): string {
    return new Date(this.date).toLocaleDateString("en-us", {
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

  addExternal(posts: any[]): BlogPostLabels {
    this.items.push(...posts.map(BlogPostLabel.fromExternalPost));
    return this;
  }

  addInternal(posts: any[]): BlogPostLabels {
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
        if (tag in counter) {
          counter[tag] += 1;
        } else {
          counter[tag] = 1;
        }
      })
    );
    counter["all"] = this.items.length;
    return Object.entries(counter)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }
}
