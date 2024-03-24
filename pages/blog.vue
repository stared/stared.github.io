<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHead } from '@vueuse/head';
import VueSlider from 'vue-slider-component/dist-css/vue-slider-component.umd.min.js'
import 'vue-slider-component/dist-css/vue-slider-component.css'
import 'vue-slider-component/theme/default.css'

import externalPosts from '@/content/data/external-articles.json';

const isHN = (mentions: any[]) => {
  return !!mentions && mentions.some((mention) => mention.href.includes("news.ycombinator"));
};

const postScores = (post: any) => {
  const popularity = post.views_k ? Math.log2(post.views_k) : 0;
  const mentions = Math.sqrt(post.mentions ? post.mentions?.length : 0);
  const now = new Date();
  const postDate = new Date(post.date);
  const yearsSince = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
  const age = Math.log2(yearsSince);
  const migdalBias = post.migdal_score ? post.migdal_score : 0;
  return { popularity, mentions, age, migdalBias };
};

const tagSelected = ref('all');
const weigthPopularity = ref(4);
const weigthMentions = ref(2);
const weigthAge = ref(-8);
const migdalWeigth = ref(2);
const sliderLine = (dotPos: number[]) => [[50, dotPos[0], { backgroundColor: dotPos[0] < 50 ? 'pink' : '' }]];

const { data: blogPosts } = await useAsyncData('blogPosts', () => queryContent('/blog').find());

const allPosts = computed(() => {
  const localPosts = blogPosts.value.map((post: any) => {
    const hn = isHN(post.mentions);
    return { ...post, hn, isExternal: false };
  });
  const externalPostsProcessed = externalPosts.map((post: any) => {
    const hn = isHN(post.mentions);
    const dateDisplay = new Date(post.date).toLocaleDateString('en-us', { year: "numeric", month: "short" });
    return { ...post, dateDisplay, hn, isExternal: true };
  });
  return [...localPosts, ...externalPostsProcessed];
});

const filteredPosts = computed(() => {
  const postValue = (post: any) => {
    const { popularity, mentions, age, migdalBias } = postScores(post);
    return weigthPopularity.value * popularity + weigthMentions.value * mentions + weigthAge.value * age + migdalWeigth.value * migdalBias;
  };

  const posts = [...allPosts.value].sort((a, b) => +(postValue(a) < postValue(b)) - 0.5);
  if (tagSelected.value === 'all') {
    return posts;
  } else {
    return posts.filter((post) => !!post.tags && post.tags.includes(tagSelected.value));
  }
});

const allTagsCounted = computed(() => {
  const counter: Record<string, number> = {};
  allPosts.value.forEach((post) => post.tags.forEach((tag: string) => {
    if (tag in counter) {
      counter[tag] += 1;
    } else {
      counter[tag] = 1;
    }
  }));
  counter['all'] = blogPosts.value.length;
  return Object.entries(counter).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count);
});

useHead({
  title: 'Blog',
  meta: [
    {
      name: 'description',
      content: 'Read blog posts by Piotr Migdał.',
    },
  ],
});

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
          <VueSlider v-model="weigthPopularity" :min="-10" :max="10" width="150px" :process="sliderLine" />
        </div>
        <div class="slider">
          <span class="slider-label">sqrt(mentions)</span>
          <VueSlider v-model="weigthMentions" :min="-5" :max="5" width="150px" :process="sliderLine" />
        </div>
        <div class="slider">
          <span class="slider-label">log(age)</span>
          <VueSlider v-model="weigthAge" :min="-20" :max="20" width="150px" :process="sliderLine" />
        </div>
        <div class="slider">
          <span class="slider-label">author's bias</span>
          <VueSlider v-model="migdalWeigth" :min="-5" :max="5" width="150px" :process="sliderLine" />
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
        <span class="date">{{ post.dateDisplay }}</span>
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

