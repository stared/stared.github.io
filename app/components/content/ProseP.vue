<script setup>
const slots = useSlots();

// Hacky check for an image to not wrap in a <p> tag
// Before we were getting hydration errors
// https://github.com/nuxt/content/issues/1537
const isImage = computed(() => {
  return slots.default()[0].type.tag === "img";
});
</script>

<template>
  <div v-if="isImage" class="prose-image"><slot /></div>
  <p v-else><slot /></p>
</template>
