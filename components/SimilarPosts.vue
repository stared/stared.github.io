<template>
  <div v-if="similarPosts && similarPosts.length > 0" class="similar-posts">
    <h2>Similar posts</h2>
    <ul>
      <li v-for="post in similarPosts" :key="post.path">
        <span class="similarity-score">{{ post.similarity }}</span>
        <NuxtLink :to="post.path">{{ post.title }}</NuxtLink>
      </li>
    </ul>

    <div
      v-if="leastSimilarPosts && leastSimilarPosts.length > 0"
      class="least-similar-posts"
    >
      <p>And, as an experiment, here are my least similar posts:</p>
      <ul>
        <li v-for="post in leastSimilarPosts" :key="post.path">
          <span class="similarity-score">{{ post.similarity }}</span>
          <NuxtLink :to="post.path">{{ post.title }}</NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps({
  similarPosts: {
    type: Array as () => Array<{
      path: string;
      similarity: string;
      title: string;
    }>,
    default: () => [],
  },
  leastSimilarPosts: {
    type: Array as () => Array<{
      path: string;
      similarity: string;
      title: string;
    }>,
    default: () => [],
  },
});
</script>

<style scoped>
.similar-posts {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.similar-posts ul {
  list-style-type: none;
  padding-left: 0;
}

.similar-posts li {
  margin-bottom: 0.5rem;
}

.similarity-score {
  font-family: monospace;
  margin-right: 0.5rem;
  color: #666;
}

.least-similar-posts {
  margin-top: 1.5rem;
  font-size: 0.9em;
}
</style>
