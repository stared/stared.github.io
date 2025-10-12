import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '..')

const contentDir = path.join(projectRoot, 'content/blog')
const outputDir = path.join(projectRoot, '.output/public/blog')
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']

function copyAssetsRecursive(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    console.warn(`Source directory ${sourceDir} does not exist. Skipping.`)
    return 0
  }

  let copiedCount = 0
  const entries = fs.readdirSync(sourceDir, { withFileTypes: true })

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name)
    const targetPath = path.join(targetDir, entry.name)

    if (entry.isDirectory()) {
      copiedCount += copyAssetsRecursive(sourcePath, targetPath)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase()
      if (imageExtensions.includes(ext)) {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true })
        fs.copyFileSync(sourcePath, targetPath)
        copiedCount++
      }
    }
  }

  return copiedCount
}

console.log('[copy-assets] Copying blog images to .output/public/blog...')
const count = copyAssetsRecursive(contentDir, outputDir)
console.log(`[copy-assets] ✔ Copied ${count} image files`)
