<template>
  <main>
    <article v-if="blogPost">
      <div class="markdown-header">
        <h1>{{ blogPost.title }}</h1>
        <p class="header-information">
          {{ formatDate(blogPost.date) }} | by
          {{ blogPost.author || "Piotr Migdał" }}
        </p>
        <ul
          v-if="blogPost.mentions && blogPost.mentions.length > 0"
          class="header-mentions"
        >
          <li v-for="mention in blogPost.mentions" :key="mention.href">
            <a :href="mention.href">{{ mention.text }}</a>
          </li>
        </ul>
      </div>
      <ContentRenderer :value="blogPost" />
      <SimilarPosts :slug="path.split('/').slice(2).join('_')" />
    </article>
    <footer v-if="footerContent">
      <ContentRenderer :value="footerContent" />
    </footer>
  </main>
</template>

<script setup lang="ts">
import { HeaderData } from "@/scripts/utils";
import { formatDate } from "@/utils/formatters";
import { queryCollection } from "#imports";

// Define types for our content
interface BlogPost {
  title: string;
  description?: string;
  date: string;
  author?: string;
  mentions?: { href: string; text: string }[];
  image?: string;
  [key: string]: any;
}

interface FooterContent {
  [key: string]: any;
}

const { path } = useRoute();

// Get blog post content using queryCollection
const { data: blogPost } = await useAsyncData(`content-${path}`, () =>
  queryCollection("blog").path(path).first()
);

// Get footer content
const { data: footerContent } = await useAsyncData("footer-content", () =>
  queryCollection("textComponents").path("/text-components/footer").first()
);

// Add type guard for null/undefined
if (blogPost.value) {
  HeaderData.default()
    .setTitle(blogPost.value.title)
    .setDescription(blogPost.value.description || "")
    .setImage(blogPost.value.image || "")
    .useHead();
}
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
</style>
