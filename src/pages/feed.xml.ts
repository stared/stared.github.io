import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { AUTHOR, SITE_URL, SITE_DESCRIPTION } from '@/lib/constants';
import { normalizePost, getPostUrl } from '@/lib/postData';
import type { RawExternalPost } from '@/lib/postData';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blogPosts = await getCollection('blog');
  const externalArticlesEntries = await getCollection('externalArticles');
  const externalPosts = externalArticlesEntries.map((entry) => entry.data) as RawExternalPost[];

  // Normalize all posts using the unified system
  const allUnified = [
    ...blogPosts.map(normalizePost),
    ...externalPosts.map(normalizePost),
  ];

  // Transform to RSS items using unified data access
  const allPosts = allUnified.map(post => ({
    title: post.data.title,
    pubDate: new Date(post.data.date),
    description: post.data.description,
    link: post.type === 'external' ? post.data.href : `${SITE_URL}${getPostUrl(post)}`,
    author: post.data.author,
  }));

  allPosts.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: `${AUTHOR}'s Blog`,
    description: SITE_DESCRIPTION,
    site: context.site || SITE_URL,
    items: allPosts,
    customData: `<language>en-us</language>`,
  });
}
