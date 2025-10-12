<script setup lang="ts">
import { ref, computed } from 'vue';
import VueSlider from 'vue-slider-component/dist-css/vue-slider-component.umd.min.js';
import 'vue-slider-component/dist-css/vue-slider-component.css';
import { BlogPostCollection } from '@/lib/postData';
import type { BlogPost } from '@/lib/postData';
import { getPostUrl, isExternalPost, hasHackerNews, formatPostDate } from '@/lib/postData';

interface Props {
  posts: BlogPost[];
}

const props = defineProps<Props>();

const tagSelected = ref('all');
const weightPopularity = ref(4);
const weightMentions = ref(2);
const weightAge = ref(-8);
const migdalweight = ref(2);

const sliderLine = (dotPos: number[]) => [
  [50, dotPos[0], { backgroundColor: dotPos[0] < 50 ? 'pink' : '' }],
];

const collection = new BlogPostCollection(props.posts);
const allTagsCounted = collection.getAllTagsWithCounts();

const filteredPosts = computed(() =>
  collection
    .filterByTag(tagSelected.value)
    .sortByWeights(
      weightPopularity.value,
      weightMentions.value,
      weightAge.value,
      migdalweight.value
    ).posts
);

function selectTag(tag: string) {
  tagSelected.value = tag;
}
</script>

<template>
  <div>
    <div class="slider-flexbox">
      <div class="slider">
        <span class="slider-label">log(popularity)</span>
        <VueSlider
          v-model="weightPopularity"
          :min="-10"
          :max="10"
          width="150px"
          :process="sliderLine"
        />
      </div>
      <div class="slider">
        <span class="slider-label">sqrt(mentions)</span>
        <VueSlider
          v-model="weightMentions"
          :min="-5"
          :max="5"
          width="150px"
          :process="sliderLine"
        />
      </div>
      <div class="slider">
        <span class="slider-label">log(age)</span>
        <VueSlider
          v-model="weightAge"
          :min="-20"
          :max="20"
          width="150px"
          :process="sliderLine"
        />
      </div>
      <div class="slider">
        <span class="slider-label">author's bias</span>
        <VueSlider
          v-model="migdalweight"
          :min="-5"
          :max="5"
          width="150px"
          :process="sliderLine"
        />
      </div>
    </div>

    <p>
      <span
        v-for="tag in allTagsCounted"
        :key="tag.name"
        class="tag"
        :class="{ selected: tag.name === tagSelected }"
        @click="selectTag(tag.name)"
      >
        [{{ tag.name }}]
      </span>
    </p>

    <div class="post-list">
      <div v-for="(post, index) in filteredPosts" :key="index" class="post">
        <span v-if="!isExternalPost(post)" class="title">
          <a :href="getPostUrl(post)">{{ 'data' in post ? post.data.title : post.title }}</a>
        </span>
        <span v-else class="title">
          <a :href="getPostUrl(post)">{{ post.title }}</a>
        </span>
        <span
          v-for="tagName in ('data' in post ? post.data.tags : post.tags)"
          :key="tagName"
          class="tag"
          :class="{ selected: tagName === tagSelected }"
          @click="selectTag(tagName)"
        >
          [{{ tagName }}]
        </span>
        <span v-if="hasHackerNews(post)" class="hn">[HN]</span>
        <span class="date">{{ formatPostDate(post) }}</span>
        <span v-if="isExternalPost(post)" class="source">@ {{ post.source }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tag {
  opacity: 0.5;
  font-size: 0.8rem;
  cursor: pointer;
  display: inline-block;
  padding: 0 0.2em;
}

.post {
  padding-bottom: 0.7em;
}

.post-list .date {
  opacity: 0.5;
  font-size: 0.8rem;
  padding: 0 0.2em;
}

.post-list .source {
  opacity: 0.5;
  font-size: 0.8rem;
  padding: 0 0.2em;
}

.post-list .hn {
  font-size: 0.8em;
  color: #ff6600;
  padding: 0 0.2em;
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
