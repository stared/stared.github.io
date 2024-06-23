<template>
  <figure class="gallery">
    <div class="image-container" :style="containerStyle">
      <ContentSlot :use="$slots.default" unwrap="p" />
    </div>
    <figcaption v-if="$slots.caption">
      <ContentSlot :use="$slots.caption" unwrap="p" />
    </figcaption>
  </figure>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  width: {
    type: Number,
    default: 2,
  },
});

const containerStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.width}, 1fr)`,
}));
</script>

<style scoped>
.gallery {
  margin: 1rem 0;
}

.image-container {
  display: grid;
  gap: 1rem;
}

.image-container :deep(img) {
  width: 100%;
  height: auto;
  object-fit: cover;
}

figcaption {
  margin-top: 0.5rem;
  text-align: center;
  font-style: italic;
}

@media (max-width: 640px) {
  .image-container {
    grid-template-columns: 1fr !important;
  }
}
</style>
