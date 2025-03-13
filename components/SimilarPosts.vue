<template>
  <section v-if="similarPosts?.length" class="similar-posts">
    <h2>See also cosine-similar posts</h2>
    <ul>
      <li v-for="post in similarPosts" :key="post.slug">
        <code>{{ post.similarity.toFixed(3) }}</code>
        <NuxtLink :to="`${post.path}`">{{ post.title }}</NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { useAsyncData } from "#imports";

interface SimilarityData {
  slug: string;
  similarity: number;
  title: string;
  path: string;
}

// Update interface for the JSON structure
interface SimilarityFile {
  most_similar: SimilarityData[];
  _path: string;
  _id: string;
}

const props = defineProps<{ slug: string }>();

const slugCleaned = props.slug.replace(/\//g, "_").replace(/_+$/, "");

const { data: similarPosts } = await useAsyncData(
  `similar-posts-${slugCleaned}`,
  async () => {
    try {
      // Use direct fetch API for Content v3
      const similarityData = await $fetch<SimilarityFile>(
        "/api/_content/query",
        {
          method: "GET",
          params: {
            _path: `/similarities/${slugCleaned}`,
            _extension: "json",
            first: true,
          },
        }
      );

      if (
        !similarityData?.most_similar ||
        !Array.isArray(similarityData.most_similar)
      ) {
        console.warn(`No valid similarities found for ${slugCleaned}`);
        return [];
      }

      return similarityData.most_similar;
    } catch (error) {
      console.error(`Error loading similarities for ${slugCleaned}:`, error);
      return [];
    }
  },
  { server: true }
);
</script>

<style>
.similar-posts {
  margin-top: 2.5em;
  padding: 1.25em 1.75em;
  background-color: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #eaecef;
}

.similar-posts h2 {
  margin-top: 0;
  margin-bottom: 0.75em;
  font-size: 1.1em;
  color: #444;
}

.similar-posts ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.similar-posts li {
  margin: 0.5em 0;
  line-height: 1.3;
}

.similar-posts code {
  margin-right: 0.75em;
  color: #666;
  font-size: 0.9em;
  background-color: #fff;
  padding: 0.15em 0.4em;
  border-radius: 4px;
  border: 1px solid #eaecef;
}

.similar-posts a {
  color: #0366d6;
  text-decoration: none;
}

.similar-posts a:hover {
  text-decoration: underline;
}
</style>
