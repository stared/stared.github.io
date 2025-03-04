<template>
  <section v-if="similarPosts?.length" class="similar-posts">
    <h2>Similar posts</h2>
    <ul>
      <li v-for="post in similarPosts" :key="post.slug">
        <code>{{ post.similarity.toFixed(3) }}</code>
        <NuxtLink :to="post.path">{{ post.title }}</NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { queryContent, useRuntimeConfig, useAsyncData } from "#imports";

interface SimilarityData {
  slug: string;
  similarity: number;
}

interface SimilarPost {
  slug: string;
  path: string;
  title: string;
  similarity: number;
}

const props = defineProps<{ slug: string }>();
const slugCleaned = props.slug.replace(/\_$/, "");

const runtimeConfig = useRuntimeConfig();
const assetsBase = runtimeConfig.public.assetsBase;

const { data: similarPosts } = await useAsyncData(
  `similar-posts-${slugCleaned}`,
  async () => {
    const url = `${assetsBase}/similarities/${slugCleaned}.json`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`No similarities found for ${slugCleaned} at ${url}`);
      return [];
    }

    const similarities: SimilarityData[] = await response.json();

    return await Promise.all(
      similarities.map(async ({ slug, similarity }) => {
        const path = `/blog/${slug.replace(/_/g, "/")}`;
        const post = await queryContent(path).findOne();
        return {
          slug,
          path,
          title: post?.title || slug,
          similarity,
        };
      })
    );
  }
);
</script>

<style>
.similar-posts {
  margin-top: 2em;
  padding-top: 1em;
  border-top: 1px solid #eee;
}

.similar-posts ul {
  list-style: none;
  padding: 0;
}

.similar-posts li {
  margin: 0.5em 0;
}

.similar-posts code {
  margin-right: 0.5em;
  color: #666;
}
</style>
