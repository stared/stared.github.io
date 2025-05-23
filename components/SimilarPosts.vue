<template>
  <section v-if="similarPosts?.length" class="similar-posts">
    <h2>See also cosine-similar posts</h2>
    <ul>
      <li v-for="post in similarPosts" :key="post.slug">
        <code>{{ formatSimilarityScore(post.similarity) }}</code>
        <NuxtLink :to="`${post.path}`">{{ post.title }}</NuxtLink>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import { useAsyncData, queryCollection } from "#imports";
import { cleanSlugForSimilarity } from "@/utils/formatters";

interface SimilarPost {
  slug: string;
  similarity: number;
  title: string;
  path: string;
}

const props = defineProps<{ slug: string }>();

const slugCleaned = cleanSlugForSimilarity(props.slug);
const expectedStem = `similarities/${slugCleaned}`;

const formatSimilarityScore = (similarity: number): string => {
  return similarity.toFixed(3);
};

const { data: similarPosts } = await useAsyncData(
  `similar-posts-${slugCleaned}`,
  async (): Promise<SimilarPost[]> => {
    try {
      const allSimilarities = await queryCollection("similarities").all();

      if (!Array.isArray(allSimilarities)) {
        console.error(
          "[SimilarPosts] Fetched data is not an array:",
          allSimilarities
        );
        return [];
      }

      const targetData = allSimilarities.find(
        (item) => item.stem === expectedStem
      );

      if (targetData?.most_similar) {
        return targetData.most_similar;
      } else {
        console.log(
          `[SimilarPosts] No matching similarity data found for slug: ${slugCleaned} (stem: '${expectedStem}') after filtering ${allSimilarities.length} items.`
        );
        return [];
      }
    } catch (error) {
      console.error(
        `[SimilarPosts] Error fetching posts for ${slugCleaned}:`,
        error
      );
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
