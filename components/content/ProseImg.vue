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
import { ref, onMounted, computed } from "vue";
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
const resolvedSrc = ref("");

// Function to check if a path is relative
const isRelativePath = (path: string) => {
  return !(
    path.startsWith("/") ||
    path.startsWith("http") ||
    path.startsWith("data:")
  );
};

// Resolve the image path
onMounted(() => {
  if (isRelativePath(props.src)) {
    // For relative paths like ./image.jpg or image.jpg
    // Extract the current route path
    const routePath = route.path;

    // Clean up the path by removing any ./ and handling directory navigation
    let imagePath = props.src.replace(/^\.\//, "");

    // If the path is a blog post
    if (routePath.startsWith("/blog/")) {
      // Remove any filename part from the route
      const pathParts = routePath.split("/");
      // Remove the last part if it's not empty (likely the filename)
      if (pathParts[pathParts.length - 1] !== "") {
        pathParts.pop();
      }
      const basePath = pathParts.join("/");

      // Now we have a clean base directory path, add the image
      resolvedSrc.value = `/content${basePath}/${imagePath}`;
    } else {
      // Default for other content types
      resolvedSrc.value = `/content${routePath}/${imagePath}`;
    }
  } else {
    // Absolute or external path
    resolvedSrc.value = props.src;
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
