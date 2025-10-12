import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import vue from '@astrojs/vue';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

// https://astro.build/config
export default defineConfig({
  site: 'https://p.migdal.pl',
  integrations: [
    mdx(),
    sitemap(),
    vue(),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeKatex],
    shikiConfig: {
      theme: 'github-light',
      wrap: true,
    },
  },
  redirects: {
    '/2017/01/06/king-man-woman-queen-why.html': '/blog/2017/01/king-man-woman-queen-why',
    '/2017/04/30/teaching-deep-learning.html': '/blog/2017/04/teaching-deep-learning',
    '/2016/08/15/quantum-mechanics-for-high-school-students.html': '/blog/2016/08/quantum-mechanics-for-high-school-students',
    '/2015/12/14/sci-to-data-sci.html': '/blog/2015/12/sci-to-data-sci',
    '/2016/03/15/data-science-intro-for-math-phys-background.html': '/blog/2016/03/data-science-intro-for-math-phys-background',
    '/2017/09/30/dating-for-nerds-gender-differences.html': '/blog/2017/09/dating-for-nerds-gender-differences',
    '/2017/07/23/dating-for-nerds.html': '/blog/2017/07/dating-for-nerds',
    '/2018/09/15/simple-diagrams-deep-learning.html': '/blog/2018/09/simple-diagrams-deep-learning',
    '/2017/08/14/bangbangcon.html': '/blog/2017/08/bangbangcon',
  },
  vite: {
    ssr: {
      noExternal: ['vue-slider-component'],
    },
  },
});
