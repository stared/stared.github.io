<template>
  <section v-if="similarPosts?.length" class="similar-posts">
    <h2>Similar posts</h2>
    <ul>
      <li v-for="post in similarPosts" :key="post.slug">
        <code>{{ post.similarity.toFixed(3) }}</code>
        <NuxtLink :to="`/blog/${post.slug}`">{{ post.title }}</NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { queryContent, useAsyncData } from "#imports";

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
      const similarityData = await queryContent<SimilarityFile>(
        `/similarities/${slugCleaned}`
      )
        .where({ _extension: "json" })
        .findOne();

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
