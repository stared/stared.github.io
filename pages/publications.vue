<template>
  <div>
    <ContentDoc path="/.text-components/publications" />

    <ul class="publications">
      <li
        v-for="(publication, index) in publications"
        :key="index"
        class="publication"
      >
        <span class="authors">{{ publication.authors }}</span
        >,
        <br />
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
import { useHead } from "@vueuse/head";
import publications from "@/content/data/publications.json";

useHead({
  title: "Publications",
  meta: [
    {
      name: "description",
      content: `Dr. Piotr Migdał wrote ${publications.length} publications.`,
    },
  ],
});

function publicationHref(publication: any) {
  if (publication.doi) {
    return `https://doi.org/${publication.doi}`;
  } else {
    return `https://arxiv.org/abs/${publication.arxiv}`;
  }
}
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
