import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { AUTHOR, SITE_URL, SITE_DESCRIPTION } from '@/lib/constants';
import type { ExternalPost } from '@/lib/postData';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const blogPosts = await getCollection('blog');
  const externalArticlesEntries = await getCollection('externalArticles');
  const externalPosts = externalArticlesEntries.map((entry) => entry.data) as ExternalPost[];

  const allPosts = [
    ...blogPosts.map(post => ({
      title: post.data.title,
      pubDate: new Date(post.data.date),
      description: post.data.description,
      link: `${SITE_URL}/blog/${post.slug}`,
      author: post.data.author || AUTHOR,
    })),
    ...externalPosts.map(post => ({
      title: post.title,
      pubDate: new Date(post.date),
      description: post.description,
      link: post.href,
      author: post.author || AUTHOR,
    })),
  ];

  allPosts.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());

  return rss({
    title: `${AUTHOR}'s Blog`,
    description: SITE_DESCRIPTION,
    site: context.site || SITE_URL,
    items: allPosts,
    customData: `<language>en-us</language>`,
  });
}
