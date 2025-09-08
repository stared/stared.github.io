// Single source for all data access
// Using absolute imports from content directory

import externalArticlesData from '@/content/data/external-articles.json'
import projectsData from '@/content/data/projects.json'
import publicationsData from '@/content/data/publications.json'
import experiencesData from '@/content/data/experiences.json'

// All data access through composables
export const useExternalArticles = () => {
  return useLazyAsyncData('external-articles', () => Promise.resolve(externalArticlesData.items))
}

export const useProjects = () => {
  return useLazyAsyncData('projects', () => Promise.resolve(projectsData.items))
}

export const usePublications = () => {
  return useLazyAsyncData('publications', () => Promise.resolve(publicationsData.items))
}

export const useExperiences = () => {
  return useLazyAsyncData('experiences', () => Promise.resolve(experiencesData.items))
}