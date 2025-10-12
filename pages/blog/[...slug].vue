<template>
  <main>
    <article v-if="blogPost">
      <div class="markdown-header">
        <h1>{{ blogPost.title }}</h1>
        <p class="header-information">
          {{ new Date(blogPost.date).toLocaleDateString("en-UK", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }) }} | by
          {{ blogPost.author || AUTHOR }}
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
import { AUTHOR } from '~/constants'

const { path } = useRoute()

const { data: blogPost } = await useAsyncData(`content-${path}`, () =>
  queryCollection('blog').path(path).first(),
)

const { data: footerContent } = await useAsyncData('footer-content', () =>
  queryCollection('textComponents').path('/text-components/footer').first(),
)

if (blogPost.value) {
  seo({
    title: blogPost.value.title,
    description: blogPost.value.description || '',
    image: blogPost.value.image || '',
  })
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
