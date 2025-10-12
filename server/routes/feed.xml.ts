import type { BlogCollectionItem } from '@nuxt/content'
import { Feed } from 'feed'

import { AUTHOR, SITE_URL } from '~/constants'
import type { ExternalPost, BlogPost } from '~/scripts/postData'
import { getPostUrl, isExternalPost } from '~/scripts/postData'

export default defineEventHandler(async (event) => {
  const feed = new Feed({
    title: `${AUTHOR}'s Blog`,
    description: `Read blog posts by ${AUTHOR}.`,
    id: `${SITE_URL}/`,
    link: `${SITE_URL}/`,
    language: 'en',
    image: `${SITE_URL}/favicon.png`,
    favicon: `${SITE_URL}/favicon.png`,
    copyright: `All rights reserved 2024, ${AUTHOR}`,
    author: {
      name: AUTHOR,
      email: 'pmigdal@gmail.com',
      link: `${SITE_URL}/`,
    },
  })

  // Use Nitro storage to fetch parsed content data
  const storage = useStorage('content:source')
  const blogPrefix = 'content:blog:'
  const keys = await storage.getKeys(blogPrefix)

  const postsDataPromises = keys
    .filter((key) => key.startsWith(blogPrefix) && key.endsWith('.md'))
    .map(async (key): Promise<BlogCollectionItem | null> => {
      const item = await storage.getItem(key)

      if (
        typeof item !== 'object' ||
        item === null ||
        !('_path' in item) ||
        !('title' in item)
      ) {
        console.warn(`[Feed] Skipping invalid content item for key: ${key}`)
        return null
      }

      return item as BlogCollectionItem
    })

  const postsDataResults = await Promise.all(postsDataPromises)
  const internalPosts = postsDataResults.filter(
    (post): post is BlogCollectionItem => post !== null,
  )

  const externalPosts = (await import('~/content/data/external-articles.json'))
    .default.items as ExternalPost[]

  const allPosts: BlogPost[] = [...internalPosts, ...externalPosts]

  // Sort by date
  allPosts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  )

  for (const post of allPosts) {
    const url = getPostUrl(post)
    const fullUrl = isExternalPost(post) ? url : `${SITE_URL}${url}`

    feed.addItem({
      title: post.title,
      id: fullUrl,
      link: fullUrl,
      description: post.description,
      content: post.description,
      author: [
        {
          name: AUTHOR,
          email: 'pmigdal@gmail.com',
          link: `${SITE_URL}/`,
        },
      ],
      date: new Date(post.date),
      image: post.image && post.image.startsWith('http') ? post.image : undefined,
    })
  }

  const feedString = feed.rss2()

  event.node.res.setHeader('content-type', 'text/xml')
  event.node.res.end(feedString)
})