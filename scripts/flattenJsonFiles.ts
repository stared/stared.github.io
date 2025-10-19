import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'src', 'data');

const filesToFlatten = [
  'projects.json',
  'publications.json',
  'experiences.json',
  'external-articles.json',
  'media-mentions.json',
];

for (const filename of filesToFlatten) {
  const filepath = path.join(dataDir, filename);

  if (!fs.existsSync(filepath)) {
    console.log(`Skipping ${filename} - file not found`);
    continue;
  }

  const content = fs.readFileSync(filepath, 'utf-8');
  const data = JSON.parse(content);

  if (data.items && Array.isArray(data.items)) {
    // Add id to each item and flatten
    const flattened = data.items.map((item: any, index: number) => ({
      id: String(index),
      ...item,
    }));

    fs.writeFileSync(filepath, JSON.stringify(flattened, null, 2));
    console.log(`✅ Flattened ${filename} - ${flattened.length} items`);
  } else {
    console.log(`⚠️  ${filename} doesn't have items array - skipping`);
  }
}

console.log('\n✨ Done flattening JSON files!');
