<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import RangeSlider from '@/components/RangeSlider.vue';
import { DEFAULT_WEIGHTS, sortPosts, getTagCounts, filterByTag } from '@/lib/postData';
import type { Post } from '@/lib/postData';

const props = defineProps<{ posts: Post[] }>();

const tag = ref('all');
const weightPopularity = ref(DEFAULT_WEIGHTS.popularity);
const weightMentions = ref(DEFAULT_WEIGHTS.mentions);
const weightAge = ref(DEFAULT_WEIGHTS.age);
const weightMigdal = ref(DEFAULT_WEIGHTS.migdalScore);
const hasInteracted = ref(false);

watch([weightPopularity, weightMentions, weightAge, weightMigdal], () => {
  hasInteracted.value = true;
});

const tagCounts = computed(() => getTagCounts(props.posts));

const filtered = computed(() => {
  const byTag = filterByTag(props.posts, tag.value);
  if (!hasInteracted.value) {
    return [...byTag].sort((a, b) => a.initialOrder - b.initialOrder);
  }
  return sortPosts(byTag, {
    popularity: weightPopularity.value,
    mentions: weightMentions.value,
    age: weightAge.value,
    migdalScore: weightMigdal.value,
  });
});
</script>

<template>
  <div>
    <div class="slider-flexbox">
      <div class="slider">
        <span class="slider-label">log(popularity)</span>
        <RangeSlider v-model="weightPopularity" :min="-10" :max="10" width="150px" />
      </div>
      <div class="slider">
        <span class="slider-label">sqrt(mentions)</span>
        <RangeSlider v-model="weightMentions" :min="-5" :max="5" width="150px" />
      </div>
      <div class="slider">
        <span class="slider-label">log(age)</span>
        <RangeSlider v-model="weightAge" :min="-20" :max="20" width="150px" />
      </div>
      <div class="slider">
        <span class="slider-label">author's bias</span>
        <RangeSlider v-model="weightMigdal" :min="-5" :max="5" width="150px" />
      </div>
    </div>

    <p>
      <span
        v-for="t in tagCounts"
        :key="t.name"
        class="tag"
        :class="{ selected: t.name === tag }"
        @click="tag = t.name"
      >[{{ t.name }}]</span>
    </p>

    <div class="post-list">
      <div v-for="post in filtered" :key="post.url" class="post">
        <span class="title"><a :href="post.url">{{ post.title }}</a></span>
        <span
          v-for="t in post.tags"
          :key="t"
          class="tag"
          :class="{ selected: t === tag }"
          @click="tag = t"
        >[{{ t }}]</span>
        <span v-if="post.hasHN" class="hn">[HN]</span>
        <span class="date">{{ post.formattedDate }}</span>
        <span v-if="post.source" class="source">@ {{ post.source }}</span>
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
