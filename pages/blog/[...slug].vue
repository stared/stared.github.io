<template>
  <main>
    <ContentDoc v-slot="{ doc }">
      <article>
        <div class="markdown-header">
          <h1>{{ doc.title }}</h1>
          <p class="header-information">
            {{ formatDate(doc.date) }} | by {{ doc.author || "Piotr Migdał" }}
          </p>
          <ul
            v-if="doc.mentions && doc.mentions.length > 0"
            class="header-mentions"
          >
            <li v-for="mention in doc.mentions" :key="mention.href">
              <a :href="mention.href">{{ mention.text }}</a>
            </li>
          </ul>
        </div>
        <ContentRenderer :value="doc" />
      </article>
    </ContentDoc>
    <footer>
      <ContentDoc path="/text-components/footer" :head="false" />
    </footer>
  </main>
</template>

<script setup lang="ts">
import { HeaderData } from "@/scripts/utils";

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-UK", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const { path } = useRoute();
const { data } = await useAsyncData(`content-${path}`, () =>
  queryContent().where({ _path: path }).findOne()
);

HeaderData.default()
  .setTitle(data.value?.title)
  .setDescription(data.value?.description)
  .setImage(data.value?.image)
  .useHead();
</script>

<style>
.markdown-header .header-mentions {
  font-size: 0.8em;
}

blockquote {
  font-style: italic;
}

img {
  max-width: 100%;
  margin: auto;
  display: block;
}

img.width-max-half {
  max-width: 380px;
}

img.width-max-two-thirds {
  max-width: 506px;
}

figure.width-max-half img {
  max-width: 380px;
}

/* Center display equations */
p:has(> mjx-container:only-child) {
  text-align: center;
}

mjx-container {
  margin: 1em auto;
}

/* Keep inline equations as normal text */
p:not(:has(> mjx-container:only-child)) mjx-container {
  display: inline-block;
  margin: 0;
}

footer {
  margin-top: 2em;
  margin-bottom: 2em;
}
</style>
