<template>
  <div v-if="allPosts && allPosts.length > 0" class="similar-posts">
    <h2>Read also</h2>

    <div class="similar-posts-section">
      <p>
        Here are my most similar posts by cosine similarity used carelessly:
      </p>
      <ul>
        <li v-for="post in mostSimilar" :key="post.path">
          <NuxtLink :to="post.path">{{ post.title }}</NuxtLink>
          <span class="similarity-score"
            >({{ post.similarity.toFixed(3) }})</span
          >
        </li>
      </ul>
    </div>

    <div
      v-if="leastSimilar && leastSimilar.length > 0"
      class="similar-posts-section least-similar-posts"
    >
      <p>And for contrast, my least similar posts:</p>
      <ul>
        <li v-for="post in leastSimilar" :key="post.path">
          <NuxtLink :to="post.path">{{ post.title }}</NuxtLink>
          <span class="similarity-score"
            >({{ post.similarity.toFixed(3) }})</span
          >
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  allPosts: {
    type: Array as () => Array<{
      path: string;
      similarity: number;
      title: string;
    }>,
    default: () => [],
  },
  mostSimilarCount: {
    type: Number,
    default: 5,
  },
  leastSimilarCount: {
    type: Number,
    default: 3,
  },
});

// Compute the most similar posts
const mostSimilar = computed(() => {
  // Posts are already sorted by similarity in descending order
  return props.allPosts.slice(0, props.mostSimilarCount);
});

// Compute the least similar posts
const leastSimilar = computed(() => {
  // Get the least similar posts by taking from the end of the array
  return [...props.allPosts]
    .sort((a, b) => a.similarity - b.similarity)
    .slice(0, props.leastSimilarCount);
});
</script>

<style scoped>
.similar-posts {
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 5px;
}

.similar-posts h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.similar-posts-section {
  margin-bottom: 1rem;
}

.similar-posts-section p {
  margin-bottom: 0.75rem;
}

.similar-posts ul {
  list-style-type: none;
  padding-left: 0;
}

.similar-posts li {
  margin-bottom: 0.5rem;
}

.similarity-score {
  font-size: 0.8rem;
  color: #666;
  margin-left: 0.5rem;
}

.least-similar-posts {
  margin-top: 1.5rem;
}
</style>
