declare module '@/content/data/external-articles.json' {
  import type { ExternalArticle } from '~/schemas'
  const data: { items: ExternalArticle[] }
  export default data
}

declare module '@/content/data/projects.json' {
  import type { Project } from '~/schemas'
  const data: { items: Project[] }
  export default data
}

declare module '@/content/data/publications.json' {
  import type { Publication } from '~/schemas'
  const data: { items: Publication[] }
  export default data
}

declare module '@/content/data/experiences.json' {
  import type { Experience } from '~/schemas'
  const data: { items: Experience[] }
  export default data
}