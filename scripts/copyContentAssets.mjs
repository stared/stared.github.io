import fs from 'fs';
import path from 'path';

const contentDir = path.resolve(process.cwd(), 'content');
const publicDir = path.resolve(process.cwd(), 'public');
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

function copyAssetsRecursive(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    console.warn(`Source directory ${sourceDir} does not exist. Skipping asset copy for this path.`);
    return;
  }

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      // Recursively copy subdirectories
      copyAssetsRecursive(sourcePath, targetPath);
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (imageExtensions.includes(ext)) {
        // Ensure the target directory exists
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        // Copy the image file
        fs.copyFileSync(sourcePath, targetPath);
        console.log(`Copied asset: ${path.relative(process.cwd(), sourcePath)} -> ${path.relative(process.cwd(), targetPath)}`);
      }
    }
  }
}

console.log('Starting asset copy from content/ to public/...');

// Calculate the relative path structure within public that mirrors content
// e.g., content/blog/* -> public/blog/*
const contentSubDirs = fs.readdirSync(contentDir, { withFileTypes: true })
  .filter(dirent => dirent.isDirectory())
  .map(dirent => dirent.name);

for (const subDir of contentSubDirs) {
    const sourceSubDir = path.join(contentDir, subDir);
    const targetSubDir = path.join(publicDir, subDir);
    // Ensure the base target subdirectory exists (e.g., public/blog)
    fs.mkdirSync(targetSubDir, { recursive: true });
    // Clean the target directory before copying to avoid stale files (optional but recommended)
    // Be careful with this in development if public/blog also contains manually placed files
    // For simplicity here, we'll just copy over. Consider a more robust clean step if needed.
    // fs.rmSync(targetSubDir, { recursive: true, force: true });
    // fs.mkdirSync(targetSubDir, { recursive: true });

    copyAssetsRecursive(sourceSubDir, targetSubDir);
}

console.log('Asset copy finished.'); 