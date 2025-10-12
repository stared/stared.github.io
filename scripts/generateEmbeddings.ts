import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

import matter from 'gray-matter'
import OpenAI from 'openai'


const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OPENAI_API_KEY = process.env.OPENAI_API_KEY

if (!OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY environment variable is not set')
  process.exit(1)
}

const openai = new OpenAI({ apiKey: OPENAI_API_KEY })

const POSTS_DIR = path.join(__dirname, '../src/content/blog')
const EMBEDDINGS_DIR = path.join(__dirname, '../public/embeddings')

async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-large',
    input: text,
  })
  return response.data[0].embedding
}

async function generateEmbeddings() {
  if (!fs.existsSync(EMBEDDINGS_DIR)) {
    fs.mkdirSync(EMBEDDINGS_DIR, { recursive: true })
  }

  const files = getAllMarkdownFiles(POSTS_DIR)

  for (const file of files) {
    const relativePath = path.relative(POSTS_DIR, file)
    const slug = relativePath.replace(/\/index\.md$/, '').replace(/\//g, '_')
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
    const text = `${data.title}\n\n${truncatedContent}`

    console.log(`Generating embedding for ${slug}...`)
    try {
      const embedding = await getEmbedding(text)
      fs.writeFileSync(embeddingPath, JSON.stringify({ slug, embedding }))
      console.log(`Successfully generated embedding for ${slug}`)
    } catch (error) {
      console.error(`Error generating embedding for ${slug}:`, error)
    }
  }
}

function getAllMarkdownFiles(dir: string): string[] {
  const files: string[] = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...getAllMarkdownFiles(fullPath))
    } else if (item.endsWith('.md')) {
      files.push(fullPath)
    }
  }

  return files
}

generateEmbeddings().catch(console.error)
