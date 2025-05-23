<template>
  <img
    v-if="resolvedSrc"
    :src="resolvedSrc"
    :alt="alt"
    :width="width"
    :height="height"
    :class="{
      'width-max-half': modifiers.includes('width-max-half'),
      'width-max-two-thirds': modifiers.includes('width-max-two-thirds'),
    }"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";

const props = defineProps({
  src: {
    type: String,
    default: "",
  },
  alt: {
    type: String,
    default: "",
  },
  width: {
    type: [String, Number],
    default: undefined,
  },
  height: {
    type: [String, Number],
    default: undefined,
  },
  modifiers: {
    type: Array,
    default: () => [],
  },
});

const route = useRoute();

// Function to check if a path is relative
const isRelativePath = (path: string) => {
  return !(
    path.startsWith("/") ||
    path.startsWith("http") ||
    path.startsWith("data:")
  );
};

// Resolve the image path
const resolvedSrc = computed(() => {
  if (isRelativePath(props.src)) {
    // For relative paths like ./image.jpg or image.jpg
    // Extract the current route path
    const routePath = route.path;

    // Clean up the path by removing any ./ and handling directory navigation
    let imagePath = props.src.replace(/^\.\//, "");

    // If the path is a blog post
    if (routePath.startsWith("/blog/")) {
      // Check if we're in static generation (prerendering) mode
      // Only use static paths during actual prerendering, not during SSR in development
      const isStaticGeneration = process.prerender;

      if (isStaticGeneration) {
        // In static build, use the full route path as base since images are at the same level as index.html
        // Ensure no double slashes
        const cleanPath = `${routePath}/${imagePath}`.replace(/\/+/g, "/");
        return cleanPath;
      } else {
        // In development, use the content server route with parent directory
        // Remove any filename part from the route for development content server
        const pathParts = routePath.split("/");
        // Remove the last part if it's not empty (likely the filename)
        if (pathParts[pathParts.length - 1] !== "") {
          pathParts.pop();
        }
        const basePath = pathParts.join("/");
        // Ensure no double slashes
        const cleanPath = `/content${basePath}/${imagePath}`.replace(
          /\/+/g,
          "/"
        );
        return cleanPath;
      }
    } else {
      // Default for other content types
      const isStaticGeneration = process.prerender;

      if (isStaticGeneration) {
        // In static build, use the full route path
        // Ensure no double slashes
        const cleanPath = `${routePath}/${imagePath}`.replace(/\/+/g, "/");
        return cleanPath;
      } else {
        // In development
        // Ensure no double slashes
        const cleanPath = `/content${routePath}/${imagePath}`.replace(
          /\/+/g,
          "/"
        );
        return cleanPath;
      }
    }
  } else {
    // Absolute or external path
    return props.src;
  }
});
</script>

<style scoped>
img.width-max-half {
  max-width: 380px;
}

img.width-max-two-thirds {
  max-width: 506px;
}
</style>
