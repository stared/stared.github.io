<template>
  <div>
    <ContentRenderer v-if="projectsContent" :value="projectsContent" />
    <ul class="projects">
      <li
        v-for="(project, index) in projects.items"
        :key="index"
        class="project"
      >
        <a class="title" :href="project.href">{{ project.title }}</a
        >&nbsp;
        <span class="status"
          >{{ formatYear(project.dateStart) }}-{{ formatYear(project.dateEnd) }}
        </span>
        &nbsp;
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
import projects from "@/content/data/projects.json";

const { data: projectsContent } = await contentPage("projects");

seo({
  title: "Projects",
  description: "Numerous projects by Piotr Migdał.",
});
</script>

<style scoped>
li.project {
  color: #828282;
  font-size: 0.9rem;
  list-style: none;
  padding-bottom: 1rem;
}

.post-meta {
  font-size: 14px;
  color: #828282;
}

a.mention {
  font-size: 0.8em;
  color: #ff6600;
  padding-left: 0.2em;
  padding-right: 0.2em;
}
</style>
