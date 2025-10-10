<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import VueSlider from "vue-slider-component/dist-css/vue-slider-component.umd.min.js";
import "vue-slider-component/dist-css/vue-slider-component.css";
import "vue-slider-component/theme/default.css";
import type { ExternalPost } from "@/scripts/postData";
import { BlogPostLabels } from "@/scripts/postData";
import { useRoute, useRouter } from "vue-router";

const externalPosts: ExternalPost[] = (
  await import("@/content/data/external-articles.json")
).default.items;

seo({
  title: "Blog",
  description: "Read blog posts by Piotr Migdał.",
});

const { data: blogPosts } = await useAsyncData("blogPosts", async () => {
  return await queryCollection("blog").all();
});

const {
  tagSelected,
  weightPopularity,
  weightMentions,
  weightAge,
  migdalweight,
  sliderLine,
  filteredPosts,
  allTagsCounted,
} = blogFilter(blogPosts, externalPosts);

const route = useRoute();
onMounted(() => {
  const tagParam = route.query.tag as string;
  if (tagParam) {
    tagSelected.value = tagParam;
  }
});

watch(
  () => route.query.tag,
  (newTag) => {
    if (newTag) {
      tagSelected.value = newTag as string;
    } else {
      tagSelected.value = "all";
    }
  }
);

const router = useRouter();

function selectTag(tag: string) {
  tagSelected.value = tag;
  if (tag === "all") {
    router.push({ query: { tag: undefined } });
  } else {
    router.push({ query: { tag: tag } });
  }
}

const { data: blogTextContent } = await contentPage("blog");
</script>

<template>
  <div>
    <ContentRenderer v-if="blogTextContent" :value="blogTextContent" />
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
        @click="selectTag(tag.name)"
        class="tag"
        :class="{ selected: tag.name === tagSelected }"
        >[{{ tag.name }}]</span
      >
    </p>

    <div class="post-list">
      <div v-for="(post, index) in filteredPosts" :key="index" class="post">
        <span v-if="!post.postSource.isExternal" class="title">
          <NuxtLink :to="post.postSource.path">{{ post.title }}</NuxtLink>
        </span>
        <span v-else class="title">
          <a :href="post.postSource.href">{{ post.title }}</a>
        </span>
        <span
          v-for="tagName in post.tags"
          :key="tagName"
          @click="selectTag(tagName)"
          class="tag"
          :class="{ selected: tagName === tagSelected }"
          >[{{ tagName }}]</span
        >
        <span v-if="post.hn" class="hn">[HN]</span>
        <span class="date">{{ post.displayDate }}</span>
        <span v-if="post.postSource.isExternal" class="source"
          >@ {{ post.postSource.source }}</span
        >
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
