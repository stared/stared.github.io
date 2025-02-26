<template>
  <div v-if="allPosts && allPosts.length > 0" class="similar-posts-visualizer">
    <h2>{{ title }}</h2>

    <!-- Note about the visualizer -->
    <div class="visualizer-note">
      <p>
        This interactive visualizer was created for Piotr, who appreciates good
        data visualizations as much as I do!
      </p>
    </div>

    <!-- Visualization selector -->
    <div class="visualization-controls">
      <label for="visualization-type">Visualization: </label>
      <select id="visualization-type" v-model="visualizationType">
        <option value="list">List</option>
        <option value="grid">Grid</option>
        <option value="scatter">Scatter Plot</option>
      </select>

      <label for="post-count" class="ml-4">Posts: </label>
      <input
        type="range"
        id="post-count"
        v-model.number="displayCount"
        :min="minCount"
        :max="maxCount"
        step="1"
      />
      <span>{{ displayCount }}</span>
    </div>

    <!-- List visualization -->
    <div v-if="visualizationType === 'list'" class="list-visualization">
      <ul>
        <li v-for="post in displayedPosts" :key="post.path">
          <span class="similarity-score">{{
            formatSimilarity(post.similarity)
          }}</span>
          <NuxtLink :to="post.path">{{ post.title }}</NuxtLink>
        </li>
      </ul>
    </div>

    <!-- Grid visualization -->
    <div v-if="visualizationType === 'grid'" class="grid-visualization">
      <div class="post-grid">
        <div
          v-for="post in displayedPosts"
          :key="post.path"
          class="post-card"
          :style="{ opacity: 0.3 + post.similarity * 0.7 }"
        >
          <div class="post-card-title">
            <NuxtLink :to="post.path">{{ post.title }}</NuxtLink>
          </div>
          <div class="post-card-similarity">
            {{ formatSimilarity(post.similarity) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Scatter Plot visualization (placeholder) -->
    <div v-if="visualizationType === 'scatter'" class="scatter-visualization">
      <p class="text-center">Scatter plot visualization coming soon!</p>
      <div class="scatter-container">
        <div
          v-for="post in displayedPosts"
          :key="post.path"
          class="scatter-point"
          :style="{
            left: `${50 + (Math.random() * 2 - 1) * 40}%`,
            top: `${50 + (Math.random() * 2 - 1) * 40}%`,
            opacity: 0.3 + post.similarity * 0.7,
            width: `${10 + post.similarity * 20}px`,
            height: `${10 + post.similarity * 20}px`,
          }"
          :title="post.title"
        >
          <NuxtLink :to="post.path" class="scatter-link">
            <span class="scatter-tooltip">
              {{ post.title }} ({{ formatSimilarity(post.similarity) }})
            </span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Toggle for least similar posts -->
    <div v-if="showLeastSimilarToggle" class="least-similar-toggle">
      <label>
        <input type="checkbox" v-model="showLeastSimilar" />
        Show least similar posts
      </label>

      <div
        v-if="showLeastSimilar && leastSimilarPosts.length > 0"
        class="least-similar-posts"
      >
        <h3>Least similar posts</h3>
        <ul>
          <li v-for="post in leastSimilarPosts" :key="post.path">
            <span class="similarity-score">{{
              formatSimilarity(post.similarity)
            }}</span>
            <NuxtLink :to="post.path">{{ post.title }}</NuxtLink>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";

const props = defineProps({
  allPosts: {
    type: Array as () => Array<{
      path: string;
      similarity: number;
      title: string;
    }>,
    default: () => [],
  },
  title: {
    type: String,
    default: "Similar posts",
  },
  defaultCount: {
    type: Number,
    default: 5,
  },
  minCount: {
    type: Number,
    default: 3,
  },
  maxCount: {
    type: Number,
    default: 20,
  },
  leastSimilarCount: {
    type: Number,
    default: 3,
  },
  showLeastSimilarToggle: {
    type: Boolean,
    default: true,
  },
});

// State
const visualizationType = ref("list");
const displayCount = ref(props.defaultCount);
const showLeastSimilar = ref(false);

// Computed properties
const displayedPosts = computed(() => {
  // Posts are already sorted by similarity in descending order
  return props.allPosts.slice(0, displayCount.value);
});

const leastSimilarPosts = computed(() => {
  // Get the least similar posts by taking from the end of the array
  return [...props.allPosts]
    .sort((a, b) => a.similarity - b.similarity)
    .slice(0, props.leastSimilarCount);
});

// Helper functions
const formatSimilarity = (value: number): string => {
  return value.toFixed(3);
};
</script>

<style scoped>
.similar-posts-visualizer {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.visualizer-note {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-left: 3px solid #6c757d;
  font-style: italic;
  font-size: 0.9rem;
}

.visualization-controls {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.ml-4 {
  margin-left: 1rem;
}

/* List visualization */
.list-visualization ul {
  list-style-type: none;
  padding-left: 0;
}

.list-visualization li {
  margin-bottom: 0.5rem;
}

.similarity-score {
  font-family: monospace;
  margin-right: 0.5rem;
  color: #666;
}

/* Grid visualization */
.post-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.post-card {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 0.75rem;
  transition: all 0.2s ease;
}

.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.post-card-title {
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.post-card-similarity {
  font-size: 0.8rem;
  color: #666;
}

/* Scatter visualization */
.scatter-container {
  position: relative;
  height: 300px;
  border: 1px solid #eee;
  margin-top: 1rem;
  border-radius: 4px;
}

.scatter-point {
  position: absolute;
  background-color: #3498db;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  cursor: pointer;
  transition: all 0.2s ease;
}

.scatter-point:hover {
  z-index: 10;
  transform: translate(-50%, -50%) scale(1.2);
}

.scatter-link {
  display: block;
  width: 100%;
  height: 100%;
  position: relative;
}

.scatter-tooltip {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.scatter-point:hover .scatter-tooltip {
  opacity: 1;
}

/* Least similar posts */
.least-similar-toggle {
  margin-top: 2rem;
}

.least-similar-posts {
  margin-top: 1rem;
  font-size: 0.9em;
}

.least-similar-posts h3 {
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}
</style>
