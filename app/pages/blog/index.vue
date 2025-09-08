<template>
  <div class="blog-index">
    <!-- Header content -->
    <ContentRenderer v-if="blogTextContent" :value="blogTextContent" />
    
    <!-- Sorting controls -->
    <div class="controls">
      <div class="slider-flexbox">
        <SliderControl
          v-model="weights.popularity"
          label="log(popularity)"
          :min="-10"
          :max="10"
        />
        <SliderControl
          v-model="weights.mentions"
          label="sqrt(mentions)"
          :min="-5"
          :max="5"
        />
        <SliderControl
          v-model="weights.age"
          label="log(age)"
          :min="-20"
          :max="20"
        />
        <SliderControl
          v-model="weights.bias"
          label="author's bias"
          :min="-5"
          :max="5"
        />
      </div>
      
      <!-- Tag filter -->
      <div class="tag-filter">
        <button
          v-for="tag in tagCounts"
          :key="tag.name"
          class="tag"
          :class="{ selected: tag.name === selectedTag }"
          @click="selectTag(tag.name)"
        >
          [{{ tag.name }}] <span class="count">({{ tag.count }})</span>
        </button>
      </div>
    </div>
    
    <!-- Blog posts list -->
    <ContentErrorBoundary
      :data="blogPosts"
      :pending="pending"
      :error="error"
      error-title="Failed to Load Blog Posts"
      @retry="refresh"
    >
      <template #default>
        <TransitionGroup 
          name="list" 
          tag="div" 
          class="post-list"
        >
          <article
            v-for="post in filteredAndSortedPosts"
            :key="post._id"
            class="post"
          >
            <h2 class="title">
              <NuxtLink 
                v-if="!post.isExternal" 
                :to="post._path"
                prefetch
              >
                {{ post.title }}
              </NuxtLink>
              <a 
                v-else 
                :href="post.href"
                target="_blank"
                rel="noopener"
              >
                {{ post.title }}
                <span class="external-icon">↗</span>
              </a>
            </h2>
            
            <div class="post-meta">
              <time :datetime="post.date">
                {{ formatMonthYear(post.date) }}
              </time>
              
              <span v-if="post.isExternal" class="source">
                @ {{ post.source }}
              </span>
              
              <div class="tags">
                <button
                  v-for="tag in post.tags"
                  :key="tag"
                  class="tag-inline"
                  :class="{ selected: tag === selectedTag }"
                  @click.stop="selectTag(tag)"
                >
                  {{ tag }}
                </button>
              </div>
              
              <span v-if="hasHackerNews(post)" class="hn-badge">
                HN
              </span>
            </div>
            
            <p v-if="post.description" class="description">
              {{ post.description }}
            </p>
          </article>
        </TransitionGroup>
      </template>
    </ContentErrorBoundary>
  </div>
</template>

<script setup lang="ts">
import { useDateFormatting } from '~/composables/useDateFormatting'
import { useTypedBlogPosts } from '~/composables/useTypedContent'
import { useExternalArticles } from '~/composables/useData'
import type { BlogPost } from '~/schemas'

// Props for external articles
interface ExternalArticle {
  _id: string
  title: string
  href: string
  source: string
  date: string
  author: string
  description: string
  image: string
  tags: string[]
  mentions: Array<{ text: string; href: string }>
  views_k: number
  migdal_score: number
  isExternal: true
}

type Post = (BlogPost & { isExternal?: false }) | ExternalArticle

// Reactive weights for sorting
const weights = reactive({
  popularity: 4,
  mentions: 2,
  age: -8,
  bias: 2,
})

// Selected tag
const route = useRoute()
const router = useRouter()
const selectedTag = ref(route.query.tag as string || 'all')

// Watch for route changes
watch(() => route.query.tag, (newTag) => {
  selectedTag.value = (newTag as string) || 'all'
})

// Date formatting
const { formatMonthYear } = useDateFormatting()

// Fetch blog posts with error handling
const { data: blogPosts, pending, error, refresh } = await useTypedBlogPosts()

// Fetch external articles
const { data: externalArticlesRaw } = await useExternalArticles()
const externalArticles = computed(() => 
  externalArticlesRaw.value?.map((item: any) => ({
      _path: `/external/${item.title.toLowerCase().replace(/\s+/g, '-')}`,
      _id: `external-${item.href}`,
      _type: 'markdown' as const,
      _source: item.source,
      title: item.title,
      date: item.date,
      description: `Published on ${item.source}`,
      author: 'Piotr Migdał',
      tags: item.tags,
      image: 'https://p.migdal.pl/imgs/blog/pmigdal-2024-by-julia-migdal.webp',
      mentions: [],
      views_k: item.views_k ?? 0,
      migdal_score: item.migdal_score,
      body: null,
      href: item.href,
      source: item.source,
      isExternal: true as const,
    })) || []
)

// Fetch blog text content
const { data: blogTextContent } = await useAsyncData(
  'blog-text-content',
  async () => {
    const { queryCollection } = await import('#imports')
    return queryCollection('textComponents').path('/text-components/blog').first()
  },
  { deep: false }
)

// Combine all posts - trust that data exists after successful fetch
const allPosts = computed<Post[]>(() => [
  ...(blogPosts.value ?? []).map(p => ({ ...p, isExternal: false as const })),
  ...(externalArticles.value ?? [])
])

// Calculate tag counts
const tagCounts = computed(() => {
  const counts = new Map<string, number>([['all', allPosts.value.length]])
  
  for (const post of allPosts.value) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1)
    }
  }
  
  return Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      if (a.name === 'all') return -1
      if (b.name === 'all') return 1
      return b.count - a.count
    })
})

// Calculate post weight for sorting
const calculateWeight = (post: Post): number => {
  const popularity = post.views_k > 0 ? Math.log2(post.views_k) : 0
  const mentions = Math.sqrt(
    post.mentions.filter(m => !m.href.includes('medium.com')).length
  )
  const ageYears = (Date.now() - new Date(post.date).getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  const age = ageYears > 0 ? Math.log2(ageYears) : 0
  
  return (
    weights.popularity * popularity +
    weights.mentions * mentions +
    weights.age * age +
    weights.bias * post.migdal_score
  )
}

// Filter and sort posts
const filteredAndSortedPosts = computed(() => {
  let filtered = allPosts.value
  
  if (selectedTag.value !== 'all') {
    filtered = filtered.filter(post => post.tags.includes(selectedTag.value))
  }
  
  return [...filtered].sort((a, b) => calculateWeight(b) - calculateWeight(a))
})

// Check if post has HackerNews mention
const hasHackerNews = (post: Post): boolean => {
  return post.mentions.some(m => m.href.includes('news.ycombinator'))
}

// Select tag
const selectTag = (tag: string) => {
  selectedTag.value = tag
  if (tag === 'all') {
    router.push({ query: {} })
  } else {
    router.push({ query: { tag } })
  }
}

// Set page metadata
useHead({
  title: 'Blog',
  meta: [
    { name: 'description', content: 'Read blog posts by Piotr Migdał.' },
  ],
})
</script>

<script lang="ts">
// Slider control component
export const SliderControl = defineComponent({
  props: {
    modelValue: { type: Number, required: true },
    label: { type: String, required: true },
    min: { type: Number, required: true },
    max: { type: Number, required: true },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const value = computed({
      get: () => props.modelValue,
      set: (val) => emit('update:modelValue', val),
    })
    
    return { value }
  },
  template: `
    <div class="slider">
      <label>{{ label }}</label>
      <input 
        type="range" 
        v-model.number="value"
        :min="min" 
        :max="max"
        step="1"
      />
      <span class="value">{{ value }}</span>
    </div>
  `,
})
</script>

<style scoped>
.blog-index {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}

.controls {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 0.5rem;
}

.slider-flexbox {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.slider {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.slider label {
  font-size: 0.875rem;
  color: #6b7280;
}

.slider input[type="range"] {
  width: 100%;
}

.slider .value {
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
}

.tag-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  padding: 0.25rem 0.75rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 0.875rem;
}

.tag:hover {
  background: #f3f4f6;
}

.tag.selected {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.tag .count {
  opacity: 0.7;
  font-size: 0.75rem;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.post {
  padding: 1.5rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  transition: all 0.2s;
}

.post:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.title {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  line-height: 1.3;
}

.title a {
  color: inherit;
  text-decoration: none;
}

.title a:hover {
  color: #3b82f6;
}

.external-icon {
  display: inline-block;
  margin-left: 0.25rem;
  font-size: 0.875em;
  opacity: 0.5;
}

.post-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.source {
  font-style: italic;
}

.tags {
  display: flex;
  gap: 0.25rem;
}

.tag-inline {
  padding: 0.125rem 0.5rem;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.tag-inline:hover {
  background: #e5e7eb;
}

.tag-inline.selected {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.hn-badge {
  padding: 0.125rem 0.5rem;
  background: #ff6600;
  color: white;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 600;
}

.description {
  margin: 0;
  color: #4b5563;
  line-height: 1.6;
}

/* Transitions */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>