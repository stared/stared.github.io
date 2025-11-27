import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import matter from 'gray-matter'
import OpenAI from 'openai'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OPENAI_API_KEY = process.env['OPENAI_API_KEY']

if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is not set')
  process.exit(1)
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

const POSTS_DIR = path.join(__dirname, '../src/content/blog')
const EXTERNAL_CONTENT_DIR = path.join(__dirname, '../src/data/external-content')
const EMBEDDINGS_DIR = path.join(__dirname, '../public/embeddings')

interface ContentSource {
  file: string
  slug: string
  type: 'blog' | 'external'
}

async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: text,
  })
  const embedding = response.data[0]?.embedding
  if (!embedding) {
    throw new Error('No embedding returned from OpenAI')
  }
  return embedding
}

function getAllMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    return []
  }

  const files: string[] = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath))
    } else if (item.endsWith('.md') || item.endsWith('.mdx')) {
      files.push(fullPath)
    }
  }

  return files
}

function getBlogSlug(file: string): string {
  const relativePath = path.relative(POSTS_DIR, file)
  return relativePath.replace(/\/index\.mdx?$/, '').replace(/\//g, '_')
}

function getExternalSlug(file: string): string {
  const basename = path.basename(file, path.extname(file))
  return `external_${basename}`
}

function getAllContentSources(): ContentSource[] {
  const sources: ContentSource[] = []

  // Blog posts
  const blogFiles = getAllMarkdownFiles(POSTS_DIR)
  for (const file of blogFiles) {
    sources.push({
      file,
      slug: getBlogSlug(file),
      type: 'blog',
    })
  }

  // External content
  const externalFiles = getAllMarkdownFiles(EXTERNAL_CONTENT_DIR)
  for (const file of externalFiles) {
    sources.push({
      file,
      slug: getExternalSlug(file),
      type: 'external',
    })
  }

  return sources
}

async function generateEmbeddings() {
  if (!fs.existsSync(EMBEDDINGS_DIR)) {
    fs.mkdirSync(EMBEDDINGS_DIR, { recursive: true })
  }

  const sources = getAllContentSources()
  console.log(`Found ${sources.length} content sources (blog + external)`)

  for (const { file, slug, type } of sources) {
    const embeddingPath = path.join(EMBEDDINGS_DIR, `${slug}.json`)

    if (fs.existsSync(embeddingPath)) {
      console.log(`Skipping ${slug} - embedding already exists`)
      continue
    }

    const content = fs.readFileSync(file, 'utf-8')
    const { data, content: markdownContent } = matter(content)

    // Take first 4000 words to stay well within the token limit
    const truncatedContent = markdownContent
      .split(' ')
      .slice(0, 4000)
      .join(' ')
    const text = `${data['title'] ?? ''}\n\n${truncatedContent}`

    console.log(`Generating embedding for ${slug} (${type})...`)
    try {
      const embedding = await getEmbedding(text)
      fs.writeFileSync(
        embeddingPath,
        JSON.stringify({ slug, type, embedding }, null, 2)
      )
      console.log(`Successfully generated embedding for ${slug}`)
    } catch (error) {
      console.error(`Error generating embedding for ${slug}:`, error)
    }
  }
}

generateEmbeddings().catch(console.error)
