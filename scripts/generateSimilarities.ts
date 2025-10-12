import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import matter from 'gray-matter'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const EMBEDDINGS_DIR = path.join(__dirname, '../public/embeddings')
const SIMILARITIES_DIR = path.join(__dirname, '../src/content/similarities')
const CONTENT_DIR = path.join(__dirname, '../src/content')

interface EmbeddingData {
  slug: string;
  embedding: number[];
}

interface SimilarityData {
  slug: string;
  similarity: number;
  title: string;
  path: string;
}

interface SimilarityOutput {
  most_similar: SimilarityData[];
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0)
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0))
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0))
  return dot / (normA * normB)
}

function getPostTitle(slug: string): string {
  const parts = slug.split('_')
  const year = parts[0]
  const month = parts[1]
  const rest = parts.slice(2).join('_')
  const mdPath = path.join(CONTENT_DIR, 'blog', year, month, rest, 'index.md')

  try {
    const fileContent = fs.readFileSync(mdPath, 'utf-8')
    const { data } = matter(fileContent)
    if (!data.title) {
      console.warn(`No title found in frontmatter for ${slug}`)
      return slug.replace(/_/g, '/')
    }
    return data.title
  } catch {
    console.warn(`Could not read title for ${slug}, using fallback`)
    return slug.replace(/_/g, '/')
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
      return { slug: data.slug, embedding: data.embedding }
    })

  console.log(`Processing similarities for ${embeddings.length} posts...`)

  embeddings.forEach(({ slug, embedding }) => {
    const similarities: SimilarityData[] = embeddings
      .filter((e) => e.slug !== slug)
      .map((e) => ({
        slug: e.slug,
        similarity: cosineSimilarity(embedding, e.embedding),
        title: getPostTitle(e.slug),
        path: `/blog/${e.slug.replace(/_/g, '/')}`,
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5)

    const output: SimilarityOutput = {
      most_similar: similarities,
    }

    const outputPath = path.join(SIMILARITIES_DIR, `${slug}.json`)
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2))
    console.log(`Generated similarities for ${slug}`)
  })
}

generateSimilarities()
