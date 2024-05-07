<script setup lang="ts">
import { ref, computed } from 'vue';
import { HeaderData } from "@/pages/utils";
import VueSlider from 'vue-slider-component/dist-css/vue-slider-component.umd.min.js';
import 'vue-slider-component/dist-css/vue-slider-component.css';
import 'vue-slider-component/theme/default.css';

interface BasePost {
  title: string;
  date: string;
  tags: string[];
  mentions?: Mention[];
  views_k?: number;
  migdal_score?: number;
}

interface ExternalPost extends BasePost {
  source: string;
  href: string;
  old_title?: string;
}

const externalPosts: ExternalPost[] = (await import('@/content/data/external-articles.json')).default.items;

interface BlogPostMetadata extends BasePost {
  slug?: string;
  author?: string;
  description?: string;
  image?: string;
  medium_url?: string;
}

HeaderData.default()
  .setTitle("Blog")
  .setDescription("Read blog posts by Piotr Migdał.")
  .useHead();


const { data: blogPosts } = await useAsyncData('blogPosts', () => queryContent('/blog').find());

interface Mention {
  title: string;
  href: string;
}

class BlogPostLabel {
  title: string;
  date: string;
  tags: string[];
  mentions: Mention[];
  views_k?: number;
  migdal_score?: number;
  isExternal: boolean;
  href?: string; // if external
  source?: string; // if external
  _path?: string; // if internal
  hn: boolean;
  displayDate: string;

  constructor(post: any, isExternal: boolean = false) {
    this.title = post.title;
    this.date = post.date;
    this.tags = post.tags || [];
    this.mentions = post.mentions || [];
    this.views_k = post.views_k;
    this.migdal_score = post.migdal_score;
    this.isExternal = isExternal;
    this.href = post.href;
    this.source = post.source;
    this._path = post._path;
    this.hn = this.mentions.some((mention: Mention) => mention.href.includes("news.ycombinator"));
    this.displayDate = new Date(post.date).toLocaleDateString('en-us', { year: "numeric", month: "short" });
  }

  static fromQueryContent(post: BlogPostMetadata): BlogPostLabel {
    return new BlogPostLabel(post);
  }

  static fromExternalPost(post: ExternalPost): BlogPostLabel {
    return new BlogPostLabel(post, true);
  }

  toScores(): { popularity: number; mentions: number; age: number; migdalBias: number } {
    const popularity = this.views_k ? Math.log2(this.views_k) : 0;
    const mentionsCount = Math.sqrt(this.mentions.length);
    const now = new Date();
    const postDate = new Date(this.date);
    const yearsSince = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    const age = Math.log2(yearsSince);
    const migdalBias = this.migdal_score ? this.migdal_score : 0;
    return { popularity, mentions: mentionsCount, age, migdalBias };
  }

  toWeight(weightPopularity: number, weightMentions: number, weightAge: number, migdalweight: number): number {
    const { popularity, mentions, age, migdalBias } = this.toScores();
    return weightPopularity * popularity + weightMentions * mentions + weightAge * age + migdalweight * migdalBias;
  }
}


class BlogPostLabels {
    items: BlogPostLabel[]

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
        if (tag === 'all') {
            return new BlogPostLabels([...this.items]);
        }
        return new BlogPostLabels(this.items.filter((post) => post.tags && post.tags.includes(tag)));
    }

    /** Sort as a copy */
    sortByWeights(weightPopularity: number, weightMentions: number, weightAge: number, migdalWeight: number): BlogPostLabels {
        const sortedItems = [...this.items].sort((a, b) => b.toWeight(weightPopularity, weightMentions, weightAge, migdalWeight) - a.toWeight(weightPopularity, weightMentions, weightAge, migdalWeight));
        return new BlogPostLabels(sortedItems);
    }

    allTagsCounted(): { name: string, count: number }[] {
        const counter: Record<string, number> = {};
        this.items.forEach((post) => post.tags.forEach((tag: string) => {
            if (tag in counter) {
                counter[tag] += 1;
            } else {
                counter[tag] = 1;
            }
        }));
        counter['all'] = this.items.length;
        return Object.entries(counter).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
    }
}

const blogPostLabels = BlogPostLabels.new().addInternal(blogPosts.value || []).addExternal(externalPosts);


const tagSelected = ref('all');
const weightPopularity = ref(4);
const weightMentions = ref(2);
const weightAge = ref(-8);
const migdalweight = ref(2);
const sliderLine = (dotPos: number[]) => [[50, dotPos[0], { backgroundColor: dotPos[0] < 50 ? 'pink' : '' }]];


const filteredPosts = computed(() => blogPostLabels.filterByTag(tagSelected.value).sortByWeights(weightPopularity.value, weightMentions.value, weightAge.value, migdalweight.value).items);

const allTagsCounted = blogPostLabels.allTagsCounted();


function selectTag(tag: string) {
  tagSelected.value = tag;
}
</script>

<template>
  <div>
    <ContentDoc path="/text-components/blog" />

    <p>
      <div class="slider-flexbox">
        <div class="slider">
          <span class="slider-label">log(popularity)</span>
          <VueSlider v-model="weightPopularity" :min="-10" :max="10" width="150px" :process="sliderLine" />
        </div>
        <div class="slider">
          <span class="slider-label">sqrt(mentions)</span>
          <VueSlider v-model="weightMentions" :min="-5" :max="5" width="150px" :process="sliderLine" />
        </div>
        <div class="slider">
          <span class="slider-label">log(age)</span>
          <VueSlider v-model="weightAge" :min="-20" :max="20" width="150px" :process="sliderLine" />
        </div>
        <div class="slider">
          <span class="slider-label">author's bias</span>
          <VueSlider v-model="migdalweight" :min="-5" :max="5" width="150px" :process="sliderLine" />
        </div>
      </div>
    </p>

    <p>
      <span v-for="tag in allTagsCounted" :key="tag.name" @click="selectTag(tag.name)" class="tag"
        :class="{ selected: tag.name === tagSelected }">[{{ tag.name }}]</span>
    </p>

    <div class="post-list">
      <div v-for="(post, index) in filteredPosts" :key="index" class="post">
        <span v-if="!post.isExternal" class="title">
          <NuxtLink :to="post._path">{{ post.title }}</NuxtLink>
        </span>
        <span v-else class="title">
          <a :href="post.href">{{ post.title }}</a>
        </span>
        <span v-for="tagName in post.tags" :key="tagName" @click="selectTag(tagName)" class="tag"
          :class="{ selected: tagName === tagSelected }">[{{ tagName }}]</span>
        <span v-if="post.hn" class="hn">[HN]</span>
        <span class="date">{{ post.displayDate }}</span>
        <span v-if="post.isExternal" class="source">@ {{ post.source }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-links a {
  margin-right: 1rem;
}

.tag {
  opacity: 0.5;
  font-size: 0.8rem;
  cursor: pointer;
  display: inline-block;
  padding-left: 0.2em;
  padding-right: 0.2em;
}

.post {
  padding-bottom: 0.7em;
}

.post-list .date {
  opacity: 0.5;
  font-size: 0.8rem;
  padding-left: 0.2em;
  padding-right: 0.2em;
}

.post-list .source {
    opacity: 0.5;
  font-size: 0.8rem;
  padding-left: 0.2em;
  padding-right: 0.2em;
}

.post-list .hn {
  font-size: 0.8em;
  color: #ff6600;
  padding-left: 0.2em;
  padding-right: 0.2em;
}

.tag:hover {
  opacity: 1;
}

.tag.selected {
  opacity: 0.9;
}

.slider-flexbox {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
}

.slider {
  flex-shrink: 1;
}

.slider-label {
  font-size: 0.8em;
}
</style>


