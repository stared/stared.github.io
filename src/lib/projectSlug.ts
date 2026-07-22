// Shared between the projects page and scripts/captureProjectScreenshots.ts
// so screenshot filenames stay in sync with how the page looks them up.
export function projectSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ł/g, 'l')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Cache-busting aliases: when a tile's subject changes completely, a new
// filename guarantees no browser, dev server, or CDN can serve the old image.
const IMAGE_ALIASES: Record<string, string> = {
  'interactive-machine-learning-list': 'interactive-machine-learning-list-cards',
};

export function projectImageFile(title: string): string {
  const slug = projectSlug(title);
  return `${IMAGE_ALIASES[slug] ?? slug}.png`;
}
