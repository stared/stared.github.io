import type { BlogCollectionItem } from '@nuxt/content'
import { ref, computed, type Ref } from 'vue'

import type { ExternalPost } from '@/scripts/postData'
import { BlogPostCollection } from '@/scripts/postData'

/**
 * Manage blog post filtering and sorting
 */
export const blogFilter = (
  blogPosts: Ref<BlogCollectionItem[] | null>,
  externalPosts: ExternalPost[],
) => {
  const tagSelected = ref('all')
  const weightPopularity = ref(4)
  const weightMentions = ref(2)
  const weightAge = ref(-8)
  const migdalweight = ref(2)

  const sliderLine = (dotPos: number[]) => [
    [50, dotPos[0], { backgroundColor: dotPos[0] < 50 ? 'pink' : '' }],
  ]

  // Create collection with all posts
  const collection = new BlogPostCollection()
  if (blogPosts.value) {
    collection.addPosts(...blogPosts.value)
  }
  collection.addPosts(...externalPosts)

  const filteredPosts = computed(() =>
    collection
      .filterByTag(tagSelected.value)
      .sortByWeights(
        weightPopularity.value,
        weightMentions.value,
        weightAge.value,
        migdalweight.value,
      ).posts,
  )

  const allTagsCounted = collection.getAllTagsWithCounts()

  return {
    tagSelected,
    weightPopularity,
    weightMentions,
    weightAge,
    migdalweight,
    sliderLine,
    filteredPosts,
    allTagsCounted,
  }
}