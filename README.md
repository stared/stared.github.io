# Piotr Migdał - blog and website

For previous versions of the website, see:

- [stared/jekyll-blog-pre-2022](https://github.com/stared/jekyll-blog-pre-2022) - Jekyll static site
- [stared/old-blog-gridsome-pre-2024](https://github.com/stared/old-blog-gridsome-pre-2024) - Gridsome (Vue 2)
- Nuxt 3 Content (2024-2025) - Vue 3 + TypeScript

I migrated to Astro for a few reasons:

- Better performance with static site generation and modern optimizations
- Excellent content collections with built-in type safety via Zod schemas
- Great support for MDX, Vue components (when needed), and modern web standards
- Active maintenance and vibrant ecosystem

## License

I share all code on this repository under the MIT license. Feel invited to use these pieces in your projects.

I share all content (blog posts, images, etc.) under the Creative Commons Attribution-ShareAlike Non-Commercial 4.0 International license. If you want to use any material on a different license, please let me know - in most cases, I would be more than happy to be permissive.

## Setup

Look at the [Astro documentation](https://docs.astro.build/) to learn more.

If you want to run it locally:

```bash
pnpm install
pnpm dev
```

To create a static build, see how I do it in GitHub Actions, `.github/workflows/build-and-deploy.yml`; in general, you need to run:

```bash
pnpm build
```
