import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EMBEDDINGS_DIR = path.join(__dirname, '../public/embeddings')
const SIMILARITIES_DIR = path.join(__dirname, '../src/content/similarities')
const BLOG_DIR = path.join(__dirname, '../src/content/blog')
const EXTERNAL_CONTENT_DIR = path.join(__dirname, '../src/data/external-content')

interface EmbeddingData {
  slug: string
  type?: 'blog' | 'external'
  embedding: number[]
}

interface SimilarityData {
  slug: string
  similarity: number
  title: string
  path: string
  isExternal: boolean
}

interface SimilarityOutput {
  most_similar: SimilarityData[]
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * (b[i] ?? 0), 0)
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0))
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0))
  return dot / (normA * normB)
}

function isExternalSlug(slug: string): boolean {
  return slug.startsWith('external_')
}

function getExternalFilename(slug: string): string {
  // external_2025_10_coding-is-starcraft-not-go -> 2025_10_coding-is-starcraft-not-go.md
  return slug.replace(/^external_/, '') + '.md'
}

function getBlogPath(slug: string): string {
  // 2025_01_dont-use-cosine-similarity -> 2025/01/dont-use-cosine-similarity/index.md
  const parts = slug.split('_')
  const year = parts[0] ?? ''
  const month = parts[1] ?? ''
  const rest = parts.slice(2).join('_')
  return path.join(BLOG_DIR, year, month, rest, 'index.md')
}

function getContentMetadata(slug: string): { title: string; path: string; isExternal: boolean } {
  const isExternal = isExternalSlug(slug)

  if (isExternal) {
    const filename = getExternalFilename(slug)
    const filePath = path.join(EXTERNAL_CONTENT_DIR, filename)

    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data } = matter(fileContent)
      return {
        title: data['title'] ?? slug,
        path: data['source'] ?? '#',
        isExternal: true,
      }
    } catch {
      console.warn(`Could not read external content for ${slug}`)
      return { title: slug, path: '#', isExternal: true }
    }
  }

  // Blog post
  const mdPath = getBlogPath(slug)
  const mdxPath = mdPath.replace(/\.md$/, '.mdx')

  for (const tryPath of [mdPath, mdxPath]) {
    try {
      const fileContent = fs.readFileSync(tryPath, 'utf-8')
      const { data } = matter(fileContent)
      return {
        title: data['title'] ?? slug.replace(/_/g, '/'),
        path: `/blog/${slug.replace(/_/g, '/')}`,
        isExternal: false,
      }
    } catch {
      // Try next path
    }
  }

  console.warn(`Could not read title for ${slug}, using fallback`)
  return {
    title: slug.replace(/_/g, '/'),
    path: `/blog/${slug.replace(/_/g, '/')}`,
    isExternal: false,
  }
}

function generateSimilarities() {
  if (!fs.existsSync(SIMILARITIES_DIR)) {
    fs.mkdirSync(SIMILARITIES_DIR, { recursive: true })
  }

  const embeddings: EmbeddingData[] = fs
    .readdirSync(EMBEDDINGS_DIR)
    .filter((file) => file.endsWith('.json'))
    .map((file) => {
      const data = JSON.parse(
        fs.readFileSync(path.join(EMBEDDINGS_DIR, file), 'utf-8'),
      )
      return {
        slug: data.slug,
        type: data.type ?? (data.slug.startsWith('external_') ? 'external' : 'blog'),
        embedding: data.embedding,
      }
    })

  const blogEmbeddings = embeddings.filter((e) => e.type === 'blog')
  const externalEmbeddings = embeddings.filter((e) => e.type === 'external')

  console.log(`Processing similarities for ${embeddings.length} items:`)
  console.log(`  - ${blogEmbeddings.length} blog posts`)
  console.log(`  - ${externalEmbeddings.length} external content`)

  // Generate similarities only for blog posts (they're what we display)
  // But include both blog and external content as potential similar items
  for (const { slug, embedding } of blogEmbeddings) {
    const similarities: SimilarityData[] = embeddings
      .filter((e) => e.slug !== slug)
      .map((e) => {
        const metadata = getContentMetadata(e.slug)
        return {
          slug: e.slug,
          similarity: cosineSimilarity(embedding, e.embedding),
          ...metadata,
        }
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)

    const output: SimilarityOutput = {
      most_similar: similarities,
    }

    const outputPath = path.join(SIMILARITIES_DIR, `${slug}.json`)
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))
    console.log(`Generated similarities for ${slug}`)
  }
}

generateSimilarities()
