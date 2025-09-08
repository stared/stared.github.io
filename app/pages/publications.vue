<template>
  <div>
    <ContentRenderer v-if="publicationsContent" :value="publicationsContent" />

    <ul class="publications">
      <li
        v-for="(publication, index) in publications"
        :key="index"
        class="publication"
      >
        <span class="authors">{{ publication.authors }}</span
        >,
        <br >
        <a class="title" :href="publicationHref(publication)">{{
          publication.title
        }}</a
        >,
        <span class="journal">{{ publication.journal }}</span>
        <span class="year">({{ publication.year }})</span>
        <span v-if="publication.arxiv" class="arxiv">
          <a :href="`https://arxiv.org/abs/${publication.arxiv}`"
            >arXiv:{{ publication.arxiv }}</a
          >
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { HeaderData } from "~/utils/utils";
import { queryCollection } from "#imports";
import { usePublications } from "~/composables/useData";

// Fetch data
const { data: publications } = await usePublications();
const { data: publicationsContent } = await useAsyncData(
  "publications-content",
  () =>
    queryCollection("textComponents")
      .path("/text-components/publications")
      .first()
);

useHead({
  title: "Publications",
  meta: [
    {
      name: "description",
      content: `Dr. Piotr Migdał wrote ${publications.value?.length || 0} publications.`,
    },
  ],
});

function publicationHref(publication: { doi?: string | null; arxiv?: string | null; link?: string }) {
  if (publication.doi) {
    return `https://doi.org/${publication.doi}`;
  } else if (publication.arxiv) {
    return `https://arxiv.org/abs/${publication.arxiv}`;
  } else {
    return publication.link || '#';
  }
}

HeaderData.default()
  .setTitle("Publications")
  .setDescription(
    `Dr. Piotr Migdał wrote ${publications.value?.length || 0} publications.`
  )
  .useHead();
</script>

<style scoped>
li.publication {
  color: #828282;
  font-size: 0.9rem;
  list-style: none;
  padding-bottom: 1rem;
}

.journal,
.year {
  margin-right: 0.3rem;
}
</style>
