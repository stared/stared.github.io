import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { AUTHOR, SITE_URL, SITE_DESCRIPTION } from '@/lib/constants';
import { createPosts } from '@/lib/postData';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blogEntries = await getCollection('blog');
  const externalEntries = await getCollection('externalArticles');
  const posts = createPosts(blogEntries, externalEntries.map(e => e.data));

  const items = posts.map(post => ({
    title: post.title,
    pubDate: post.date,
    description: post.description,
    link: post.isExternal ? post.url : `${SITE_URL}${post.url}`,
    author: post.author,
  }));

  items.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: `${AUTHOR}'s Blog`,
    description: SITE_DESCRIPTION,
    site: context.site || SITE_URL,
    items,
    customData: `<language>en-us</language>`,
  });
}
