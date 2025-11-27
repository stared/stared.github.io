<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import RangeSlider from '@/components/RangeSlider.vue';
import {
  DEFAULT_WEIGHTS,
  sortScoredPosts,
  getAllTagsWithCounts,
  filterScoredPostsByTag,
  getPostUrl,
  isExternalPost,
  hasHackerNews,
  formatPostDate,
} from '@/lib/postData';
import type { ScoredBlogPost, BlogPost } from '@/lib/postData';

interface Props {
  scoredPosts: ScoredBlogPost[];
}

const props = defineProps<Props>();

const tagSelected = ref('all');
const weightPopularity = ref(DEFAULT_WEIGHTS.popularity);
const weightMentions = ref(DEFAULT_WEIGHTS.mentions);
const weightAge = ref(DEFAULT_WEIGHTS.age);
const migdalweight = ref(DEFAULT_WEIGHTS.migdalScore);

// Track if user has modified weights - prevents re-sorting during initial hydration
const hasUserInteracted = ref(false);

// Watch for any weight changes to set the flag
watch([weightPopularity, weightMentions, weightAge, migdalweight], () => {
  hasUserInteracted.value = true;
});

const allTagsCounted = computed(() => getAllTagsWithCounts(props.scoredPosts));

const filteredPosts = computed(() => {
  const filtered = filterScoredPostsByTag(props.scoredPosts, tagSelected.value);

  // Initial render - use build-time order (initialOrder) to match SSR exactly
  if (!hasUserInteracted.value) {
    return [...filtered].sort((a, b) => a.initialOrder - b.initialOrder);
  }

  // User has interacted - re-sort using pre-computed scores
  return sortScoredPosts(filtered, {
    popularity: weightPopularity.value,
    mentions: weightMentions.value,
    age: weightAge.value,
    migdalScore: migdalweight.value,
  });
});

function selectTag(tag: string) {
  tagSelected.value = tag;
}

// Helper to get the BlogPost from ScoredBlogPost for template helpers
function getPost(sp: ScoredBlogPost): BlogPost {
  return sp.post;
}

// Helper to get post data (handles both internal and external posts)
function getPostDataField(sp: ScoredBlogPost) {
  return 'data' in sp.post ? sp.post.data : sp.post;
}
</script>

<template>
  <div>
    <div class="slider-flexbox">
      <div class="slider">
        <span class="slider-label">log(popularity)</span>
        <RangeSlider
          v-model="weightPopularity"
          :min="-10"
          :max="10"
          width="150px"
        />
      </div>
      <div class="slider">
        <span class="slider-label">sqrt(mentions)</span>
        <RangeSlider
          v-model="weightMentions"
          :min="-5"
          :max="5"
          width="150px"
        />
      </div>
      <div class="slider">
        <span class="slider-label">log(age)</span>
        <RangeSlider
          v-model="weightAge"
          :min="-20"
          :max="20"
          width="150px"
        />
      </div>
      <div class="slider">
        <span class="slider-label">author's bias</span>
        <RangeSlider
          v-model="migdalweight"
          :min="-5"
          :max="5"
          width="150px"
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
      <div v-for="sp in filteredPosts" :key="getPostUrl(getPost(sp))" class="post">
        <span v-if="!isExternalPost(getPost(sp))" class="title">
          <a :href="getPostUrl(getPost(sp))">{{ getPostDataField(sp).title }}</a>
        </span>
        <span v-else class="title">
          <a :href="getPostUrl(getPost(sp))">{{ getPostDataField(sp).title }}</a>
        </span>
        <span
          v-for="tagName in getPostDataField(sp).tags"
          :key="tagName"
          class="tag"
          :class="{ selected: tagName === tagSelected }"
          @click="selectTag(tagName)"
        >
          [{{ tagName }}]
        </span>
        <span v-if="hasHackerNews(getPost(sp))" class="hn">[HN]</span>
        <span class="date">{{ formatPostDate(getPost(sp)) }}</span>
        <span v-if="isExternalPost(getPost(sp))" class="source">@ {{ getPostDataField(sp).source }}</span>
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
