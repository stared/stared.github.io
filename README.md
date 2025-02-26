# Piotr Migdał - blog and website

For previous versions of the website, see:

- [stared/jekyll-blog-pre-2022](https://github.com/stared/jekyll-blog-pre-2022)
- [stared/old-blog-gridsome-pre-2024](https://github.com/stared/old-blog-gridsome-pre-2024)

I migrated to Nuxt 3 Content for a few reasons

- Gridsome is no longer maintained (and uses old Vue 2)
- I wanted to use Vue 3 + TypeScript
- Nuxt 3 Content makes using a combination of Vue and Markdown-based posts really easy (for my use case, much GraphMQ-based approach of Gridsome and React-based GatsbyJS)

## License

I share all code on this repository under the MIT license. Feel invited to use these pieces in your projects.

I share all content (blog posts, images, etc.) under the Creative Commons Attribution-ShareAlike Non-Commercial 4.0 International license. If you want to use any material on a different license, please let me know - in most cases, I would be more than happy to be permissive.

## Similar Posts Feature

The blog includes a "Similar Posts" feature that uses cosine similarity to recommend related content. For each blog post, the system:

- Generates embeddings for all blog posts
- Calculates cosine similarity between posts
- Creates `similarPosts.json` files with ranked recommendations

This feature was implemented with assistance from Claude 3.7 Sonnet, which helped develop the embedding and similarity calculation scripts.

## Setup

Look at the [Nuxt 3 Content documentation](https://content.nuxt.com/) to learn more.

If you want to run it locally:

```bash
yarn install
yarn dev
```

To create a static version, see how I do it in GitHub Actions, `.github/workflows/build-and-deploy.yml`; in general, you need to run:

```bash
yarn generate
```
