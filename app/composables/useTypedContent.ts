import type { BlogPost, Similarity } from '~/schemas/content'

/**
 * Fetch blog posts with proper typing
 * Uses shallowRef for performance (Nuxt 4 default)
 */
export const useTypedBlogPosts = () => {
  return useLazyFetch('/api/_content/query', {
    params: {
      _collection: 'blog',
      _sort: 'date:desc',
    },
    transform: (data: unknown) => {
      if (!Array.isArray(data)) return []
      // Trust that content.config.ts validation ensures correct shape
      return data as BlogPost[]
    },
    deep: false,
    onResponseError({ response }) {
      console.error('Failed to fetch blog posts:', response._data)
    },
  })
}

/**
 * Fetch a single blog post by slug
 */
export const useTypedBlogPost = (slug: string) => {
  return useLazyFetch(`/api/_content/query`, {
    params: {
      _collection: 'blog',
      _path: `/blog/${slug}`,
      _limit: 1,
    },
    transform: (data: unknown) => {
      const post = Array.isArray(data) ? data[0] : data
      if (!post) return null
      // Trust that content.config.ts validation ensures correct shape
      return post as BlogPost
    },
    deep: false,
  })
}

/**
 * Fetch similar posts for a given slug
 */
export const useTypedSimilarPosts = (slug: string) => {
  const cleanSlug = slug.replace(/\//g, '_').replace(/_+$/, '')
  
  return useLazyFetch(`/api/_content/query`, {
    params: {
      _collection: 'similarities',
      _path: `/similarities/${cleanSlug}`,
      _limit: 1,
    },
    transform: (data: unknown) => {
      const item = Array.isArray(data) ? data[0] : data
      if (!item) return null
      // Trust that content.config.ts validation ensures correct shape
      return {
        stem: `similarities/${cleanSlug}`,
        most_similar: item.most_similar || [],
      } as Similarity & { stem: string }
    },
    deep: false,
  })
}