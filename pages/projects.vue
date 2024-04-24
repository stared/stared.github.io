<template>
  <div>
    <ContentDoc path="/text-components/projects" />
    <ul class="projects">
      <li
        v-for="(project, index) in projects.items"
        :key="index"
        class="project"
      >
        <a class="title" :href="project.href">{{ project.title }}</a
        >&nbsp;
        <span class="status"
          >{{ formatDate(project.dateStart) }}-{{ formatDate(project.dateEnd) }}
        </span>
        <span class="status">({{ project.status }})</span>
        <br />
        <span class="description">{{ project.desc }}</span>
        <span v-if="project.mentions" class="mentions">
          <a
            v-for="mention in project.mentions"
            :href="mention.href"
            class="mention"
            >[{{ mention.text }}]</a
          >
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useHead } from "@vueuse/head";
import projects from "@/content/data/projects.json";

useHead({
  title: "Projects",
  meta: [
    {
      name: "description",
      content: "Numerous projects by Piotr Migdał.",
    },
  ],
});

function formatDate(x: string | null): string {
  if (x) {
    const date: Date = new Date(x);
    return date.getFullYear().toString();
  } else {
    return "";
  }
}
</script>

<style scoped>
/* Your styles here */
</style>
