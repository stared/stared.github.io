<template>
  <div class="video-container" :style="containerStyle">
    <iframe
      :src="iframeSrc"
      :title="title"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      :allowfullscreen="allowFullScreen"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  videoId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    default: "YouTube video player",
  },
  width: {
    type: String,
    default: "100%",
  },
  height: {
    type: String,
    default: "100%",
  },
  allowFullScreen: {
    type: Boolean,
    default: true,
  },
  start: {
    type: Number,
    default: 0,
  },
  end: {
    type: Number,
    default: null,
  },
  autoplay: {
    type: Boolean,
    default: false,
  },
});

const queryParams = computed(() => {
  const params = new URLSearchParams();
  if (props.start) params.set("start", props.start.toString());
  if (props.end) params.set("end", props.end.toString());
  if (props.autoplay) params.set("autoplay", "1");
  return params.toString();
});

const iframeSrc = computed(() => {
  let src = `https://www.youtube.com/embed/${props.videoId}`;
  if (queryParams.value) src += `?${queryParams.value}`;
  return src;
});

const containerStyle = computed(() => ({
  position: "relative",
  paddingBottom: "56.25%" /* 16:9 aspect ratio */,
  height: 0,
  overflow: "hidden",
  maxWidth: "100%",
}));
</script>

<style scoped>
.video-container iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: var(--video-width, 100%);
  height: var(--video-height, 100%);
}
</style>
