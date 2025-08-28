<template>
  <div>
    <ContentRenderer v-if="resumeIntroContent" :value="resumeIntroContent" />

    <h2>Recent experience</h2>
    <ul class="experiences">
      <li v-for="exp in experiences.items" :key="exp.period">
        <span class="period">{{ exp.period }}</span>
        <span class="position">{{ exp.position }}</span>
        <a :href="exp.href" class="company">{{ exp.company }}</a>
        <br >
        <span class="description">{{ exp.description }}</span>
        <br >
        <span v-if="exp.mentions" class="mentions">
          <span v-for="mention in exp.mentions" :key="mention.href">
            • <a :href="mention.href">{{ mention.text }}</a>
          </span>
          &nbsp;•
          <br >
        </span>
        <span class="stack">{{ exp.stack }}</span>
      </li>
    </ul>

    <ContentRenderer
      v-if="resumeHighlightsContent"
      :value="resumeHighlightsContent"
    />
  </div>
</template>

<script setup lang="ts">
import { HeaderData } from "@/scripts/utils";
import { queryCollection } from "#imports";
import experiences from "@/content/data/experiences.json";

// Fetch the resume intro content
const { data: resumeIntroContent } = await useAsyncData(
  "resume-intro-content",
  () =>
    queryCollection("textComponents")
      .path("/text-components/resume-intro")
      .first()
);

// Fetch the resume highlights content
const { data: resumeHighlightsContent } = await useAsyncData(
  "resume-highlights-content",
  () =>
    queryCollection("textComponents")
      .path("/text-components/resume-highlights")
      .first()
);

HeaderData.default()
  .setTitle("Resume")
  .setDescription("Piotr Migdał's career and availability.")
  .useHead();
</script>

<style scoped>
.experiences li {
  list-style: none;
  padding-bottom: 1rem;
}

.experiences .period {
  margin-right: 2rem;
}

.experiences .position {
  margin-right: 1rem;
}

.experiences .description {
  color: #828282;
}

.experiences .mentions {
  color: #828282;
  font-size: 0.8rem;
}

.experiences .stack {
  color: #828282;
  font-size: 0.8rem;
}
</style>
