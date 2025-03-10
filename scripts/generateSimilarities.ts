import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const EMBEDDINGS_DIR = path.join(__dirname, "../public/embeddings");
const SIMILARITIES_DIR = path.join(__dirname, "../content/similarities");

interface EmbeddingData {
  slug: string;
  embedding: number[];
}

interface SimilarityData {
  slug: string;
  similarity: number;
}

interface SimilarityOutput {
  most_similar: SimilarityData[];
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, ai, i) => sum + ai * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, ai) => sum + ai * ai, 0));
  const normB = Math.sqrt(b.reduce((sum, bi) => sum + bi * bi, 0));
  return dot / (normA * normB);
}

function generateSimilarities() {
  if (!fs.existsSync(SIMILARITIES_DIR)) {
    fs.mkdirSync(SIMILARITIES_DIR, { recursive: true });
  }

  const embeddings: EmbeddingData[] = fs
    .readdirSync(EMBEDDINGS_DIR)
    .filter((file) => file.endsWith(".json"))
    .map((file) => {
      const data = JSON.parse(
        fs.readFileSync(path.join(EMBEDDINGS_DIR, file), "utf-8")
      );
      return { slug: data.slug, embedding: data.embedding };
    });

  console.log(`Processing similarities for ${embeddings.length} posts...`);

  embeddings.forEach(({ slug, embedding }) => {
    const similarities: SimilarityData[] = embeddings
      .filter((e) => e.slug !== slug)
      .map((e) => ({
        slug: e.slug,
        similarity: cosineSimilarity(embedding, e.embedding),
      }))
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5); // top 5 similar posts

    const output: SimilarityOutput = {
      most_similar: similarities,
    };

    const outputPath = path.join(SIMILARITIES_DIR, `${slug}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
    console.log(`Generated similarities for ${slug}`);
  });
}

generateSimilarities();
