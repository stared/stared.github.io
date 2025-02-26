# Migdal Blog Nuxt

This is the repository for Piotr Migdał's personal blog, built with Nuxt 3 and Nuxt Content.

## Features

- Static site generation with Nuxt 3
- Blog posts written in Markdown
- Content management with Nuxt Content
- Similar posts recommendations based on cosine similarity

## Similar Posts Feature

The blog includes a feature to show similar posts based on content similarity. This is implemented using OpenAI embeddings and cosine similarity.

### How it works

1. The `yarn similarity` command generates embeddings for all blog posts using OpenAI's text-embedding-3-large model
2. Embeddings are stored as JSON files in the `content/data/embeddings` directory
3. The script calculates cosine similarity between posts and adds a "Similar posts" section to each blog post
4. The blog post template parses this section and displays it using the SimilarPosts component

### Usage

To generate or update similar posts:

1. Make sure you have an OpenAI API key set in your environment:

```bash
export OPENAI_API_KEY=your-api-key
```

2. Run the similarity script:

```bash
yarn similarity
```

This will:

- Generate embeddings for all blog posts
- Calculate similarity between posts
- Update each blog post with a "Similar posts" section

### Configuration

You can customize the number of similar and least similar posts shown by modifying the `generateSimilarPostsMarkdown` function in `scripts/findSimilarPosts.ts`.

## Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Generate static site
yarn generate

# Preview production build
yarn preview
```

## License

[MIT License](LICENSE)
