<template>
  <ContentErrorBoundary
    :data="post"
    :pending="pending"
    :error="error"
    error-title="Blog Post Not Found"
    :error-message="`The blog post '${slug}' could not be found.`"
    @retry="refresh"
  >
    <template #default="{ data: blogPost }">
      <main>
        <article>
          <header class="markdown-header">
            <h1>{{ blogPost.title }}</h1>
            <p class="header-information">
              <time :datetime="blogPost.date">{{ formatFullDate(blogPost.date) }}</time>
              <span> | by {{ blogPost.author }}</span>
            </p>
            <ul v-if="blogPost.mentions.length > 0" class="header-mentions">
              <li v-for="mention in blogPost.mentions" :key="mention.href">
                <a :href="mention.href" target="_blank" rel="noopener">
                  {{ mention.text }}
                </a>
              </li>
            </ul>
          </header>
          
          <ContentRenderer :value="blogPost" />
          
          <Suspense>
            <SimilarPosts :slug="slug" />
            <template #fallback>
              <div class="loading-similar">Loading similar posts...</div>
            </template>
          </Suspense>
        </article>
        
        <footer v-if="footerData">
          <ContentRenderer :value="footerData" />
        </footer>
      </main>
    </template>
  </ContentErrorBoundary>
</template>

<script setup lang="ts">
import { useDateFormatting } from '~/composables/useDateFormatting'
import { useTypedBlogPost } from '~/composables/useTypedContent'

const route = useRoute()
const slug = computed(() => {
  const slugArray = Array.isArray(route.params.slug) 
    ? route.params.slug 
    : [route.params.slug]
  return slugArray.join('/')
})

// Fetch blog post - if it fails, the error boundary handles it
const { data: post, pending, error, refresh } = await useTypedBlogPost(slug.value)

// Date formatting - trust that data exists when rendered
const { formatFullDate } = useDateFormatting()

// Footer content - separate concern
const { data: footerData } = await useAsyncData(
  'footer-content',
  async () => {
    const { queryCollection } = await import('#imports')
    return queryCollection('textComponents').path('/text-components/footer').first()
  },
  { deep: false }
)

// Page metadata - only set when we have data
if (post.value) {
  useHead({
    title: post.value.title,
    meta: [
      { name: 'description', content: post.value.description },
      { name: 'author', content: post.value.author },
      { property: 'og:title', content: post.value.title },
      { property: 'og:description', content: post.value.description },
      { property: 'og:type', content: 'article' },
      { property: 'article:author', content: post.value.author },
      { property: 'article:published_time', content: post.value.date },
      ...post.value.tags.map(tag => ({
        property: 'article:tag',
        content: tag,
      })),
      { property: 'og:image', content: post.value.image },
      { name: 'twitter:image', content: post.value.image },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: post.value.title },
      { name: 'twitter:description', content: post.value.description },
    ]
  })
}
</script>

<style scoped>
.markdown-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.markdown-header h1 {
  margin-bottom: 0.5rem;
  font-size: 2.5rem;
  line-height: 1.2;
}

.header-information {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.header-mentions {
  font-size: 0.875rem;
  list-style: none;
  padding: 0;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.header-mentions a {
  color: #3b82f6;
  text-decoration: none;
}

.header-mentions a:hover {
  text-decoration: underline;
}

.loading-similar {
  margin-top: 2rem;
  padding: 1rem;
  text-align: center;
  color: #6b7280;
  background-color: #f9fafb;
  border-radius: 0.5rem;
}

:deep(blockquote) {
  font-style: italic;
  border-left: 4px solid #e5e7eb;
  padding-left: 1rem;
  margin-left: 0;
}

:deep(img) {
  max-width: 100%;
  height: auto;
  margin: 2rem auto;
  display: block;
  border-radius: 0.5rem;
}

:deep(img.width-max-half) {
  max-width: 380px;
}

:deep(img.width-max-two-thirds) {
  max-width: 506px;
}

:deep(figure.width-max-half img) {
  max-width: 380px;
}

:deep(p:has(> mjx-container:only-child)) {
  text-align: center;
}

:deep(mjx-container) {
  margin: 1em auto;
}

:deep(p:not(:has(> mjx-container:only-child)) mjx-container) {
  display: inline-block;
  margin: 0;
}

:deep(pre) {
  background-color: #1e293b;
  color: #e2e8f0;
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}

:deep(code) {
  background-color: #f3f4f6;
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
  font-size: 0.875em;
}

:deep(pre code) {
  background-color: transparent;
  padding: 0;
}
</style>