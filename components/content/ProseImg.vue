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

const resolvedSrc = computed(() => {
  // If it's an absolute URL, data URL, or starts with /, use as-is
  if (
    props.src.startsWith("http") ||
    props.src.startsWith("data:") ||
    props.src.startsWith("/")
  ) {
    return props.src;
  }

  // For relative paths (like ./image.jpg or image.jpg), resolve relative to current route
  // Remove leading ./ if present
  const imagePath = props.src.replace(/^\.\//, "");

  // Ensure there's a slash between route path and image path
  const basePath = route.path.endsWith("/") ? route.path : route.path + "/";
  return basePath + imagePath;
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
