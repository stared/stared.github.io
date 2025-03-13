<template>
  <div>
    <div class="flex">
      <div class="flex-column text">
        <ContentRenderer v-if="aboutContent" :value="aboutContent" />
      </div>
      <div class="flex-column image">
        <img
          class="main-img"
          alt="A photo of Piotr Migdał"
          src="~/assets/imgs/piotr-migdal-direct-smiling-2022-by-cytacka-600px.jpg"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HeaderData } from "@/scripts/utils";

// Fetch the about me content
const { data: aboutContent } = await useAsyncData("about-content", async () => {
  return await $fetch("/api/_content/query", {
    method: "GET",
    params: {
      _path: "/text-components/me",
      first: true,
    },
  });
});

HeaderData.default().setTitle("Homepage").useHead();
</script>

<style>
.flex {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.flex-column {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 300px;
}

.main-img {
  max-width: 100%;
}
</style>
