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
