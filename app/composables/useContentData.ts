/**
 * Type-safe content fetching composables
 * Provides consistent data fetching with validation
 */

import type {
  BlogPostContent,
  ExternalArticlesData,
  ProjectsData,
  PublicationsData,
  SimilarityData,
  TextComponent,
} from '~/types/content';

import {
  validateBlogPost,
  validateExternalArticle,
} from '~/types/content';

export interface ContentError {
  message: string;
  code: 'FETCH_ERROR' | 'VALIDATION_ERROR' | 'NOT_FOUND';
  details?: unknown;
}

export interface ContentResult<T> {
  data: Ref<T | null>;
  error: Ref<ContentError | null>;
  pending: Ref<boolean>;
  refresh: () => Promise<void>;
}

/**
 * Fetch and validate a text component
 */
export const useTextComponent = async (
  componentPath: string
): Promise<ContentResult<TextComponent>> => {
  const key = `text-component-${componentPath}`;
  
  const result = await useAsyncData<TextComponent>(
    key,
    async () => {
      try {
        const data = await queryCollection('textComponents')
          .path(componentPath)
          .first();
        
        if (!data) {
          throw new Error(`Text component not found: ${componentPath}`);
        }
        
        return data;
      } catch (error) {
        console.error(`Failed to fetch text component: ${componentPath}`, error);
        throw error;
      }
    }
  );

  return {
    data: result.data as Ref<TextComponent | null>,
    error: computed(() => 
      result.error.value 
        ? { 
            message: result.error.value.message,
            code: 'FETCH_ERROR' as const,
            details: result.error.value
          }
        : null
    ),
    pending: result.pending,
    refresh: result.refresh,
  };
};

/**
 * Fetch all blog posts with validation
 */
export const useBlogPosts = async (): Promise<ContentResult<BlogPostContent[]>> => {
  const result = await useAsyncData<BlogPostContent[]>(
    'blog-posts-all',
    async () => {
      try {
        const posts = await queryCollection('blog').all();
        
        // Validate each post
        const validated: BlogPostContent[] = [];
        for (const post of posts) {
          try {
            validateBlogPost(post);
            validated.push(post as BlogPostContent);
          } catch (error) {
            console.error(`Invalid blog post: ${post._path}`, error);
            // Continue with valid posts
          }
        }
        
        return validated;
      } catch (error) {
        console.error('Failed to fetch blog posts', error);
        throw error;
      }
    }
  );

  return {
    data: result.data as Ref<BlogPostContent[] | null>,
    error: computed(() => 
      result.error.value 
        ? { 
            message: result.error.value.message,
            code: 'FETCH_ERROR' as const,
            details: result.error.value
          }
        : null
    ),
    pending: result.pending,
    refresh: result.refresh,
  };
};

/**
 * Fetch a single blog post by path
 */
export const useBlogPost = async (
  path: string
): Promise<ContentResult<BlogPostContent>> => {
  const result = await useAsyncData<BlogPostContent>(
    `blog-post-${path}`,
    async () => {
      try {
        const post = await queryCollection('blog').path(path).first();
        
        if (!post) {
          throw new Error(`Blog post not found: ${path}`);
        }
        
        // Validate the post
        validateBlogPost(post);
        
        return post as BlogPostContent;
      } catch (error) {
        console.error(`Failed to fetch blog post: ${path}`, error);
        throw error;
      }
    }
  );

  return {
    data: result.data as Ref<BlogPostContent | null>,
    error: computed(() => 
      result.error.value 
        ? { 
            message: result.error.value.message,
            code: result.error.value.message.includes('not found') 
              ? 'NOT_FOUND' as const 
              : 'FETCH_ERROR' as const,
            details: result.error.value
          }
        : null
    ),
    pending: result.pending,
    refresh: result.refresh,
  };
};

/**
 * Load and validate external articles from JSON
 */
export const useExternalArticles = async (): Promise<ContentResult<ExternalArticlesData>> => {
  const result = await useAsyncData<ExternalArticlesData>(
    'external-articles',
    async () => {
      try {
        const data = await import('../../content/data/external-articles.json');
        
        if (!data.default || !Array.isArray(data.default.items)) {
          throw new Error('Invalid external articles data structure');
        }
        
        // Validate each article
        const validated = data.default.items.map(article => {
          try {
            return validateExternalArticle(article);
          } catch (error) {
            console.error(`Invalid external article: ${article.title}`, error);
            // Return article with defaults for missing fields
            return {
              ...article,
              author: article.author || 'Piotr Migdał',
              description: article.description || '',
              image: article.image || null,
              tags: article.tags || [],
              mentions: article.mentions || [],
              views_k: article.views_k ?? 0,
              migdal_score: article.migdal_score ?? 0,
            };
          }
        });
        
        return { items: validated };
      } catch (error) {
        console.error('Failed to load external articles', error);
        throw error;
      }
    }
  );

  return {
    data: result.data as Ref<ExternalArticlesData | null>,
    error: computed(() => 
      result.error.value 
        ? { 
            message: result.error.value.message,
            code: 'FETCH_ERROR' as const,
            details: result.error.value
          }
        : null
    ),
    pending: result.pending,
    refresh: result.refresh,
  };
};

/**
 * Load projects from JSON with type safety
 */
export const useProjects = async (): Promise<ContentResult<ProjectsData>> => {
  const result = await useAsyncData<ProjectsData>(
    'projects',
    async () => {
      try {
        const data = await import('../../content/data/projects.json');
        
        if (!data.default || !Array.isArray(data.default.items)) {
          throw new Error('Invalid projects data structure');
        }
        
        // Add default values for missing fields
        const validated = data.default.items.map(project => ({
          ...project,
          dateEnd: project.dateEnd || null,
          status: project.status || 'completed',
          tags: project.tags || [],
          mentions: project.mentions || [],
          role: project.role || 'Developer',
          technologies: project.technologies || [],
        }));
        
        return { items: validated };
      } catch (error) {
        console.error('Failed to load projects', error);
        throw error;
      }
    }
  );

  return {
    data: result.data as Ref<ProjectsData | null>,
    error: computed(() => 
      result.error.value 
        ? { 
            message: result.error.value.message,
            code: 'FETCH_ERROR' as const,
            details: result.error.value
          }
        : null
    ),
    pending: result.pending,
    refresh: result.refresh,
  };
};

/**
 * Load publications from JSON with type safety
 */
export const usePublications = async (): Promise<ContentResult<PublicationsData>> => {
  const result = await useAsyncData<PublicationsData>(
    'publications',
    async () => {
      try {
        const data = await import('../../content/data/publications.json');
        
        if (!data.default || !Array.isArray(data.default.items)) {
          throw new Error('Invalid publications data structure');
        }
        
        // Add default values for missing fields
        const validated = data.default.items.map(pub => ({
          ...pub,
          year: Number(pub.year) || new Date().getFullYear(),
          volume: pub.volume || null,
          pages: pub.pages || null,
          doi: pub.doi || null,
          arxiv: pub.arxiv || null,
          pmid: pub.pmid || null,
          abstract: pub.abstract || '',
          keywords: pub.keywords || [],
          citations: pub.citations ?? 0,
        }));
        
        return { items: validated };
      } catch (error) {
        console.error('Failed to load publications', error);
        throw error;
      }
    }
  );

  return {
    data: result.data as Ref<PublicationsData | null>,
    error: computed(() => 
      result.error.value 
        ? { 
            message: result.error.value.message,
            code: 'FETCH_ERROR' as const,
            details: result.error.value
          }
        : null
    ),
    pending: result.pending,
    refresh: result.refresh,
  };
};

/**
 * Fetch similar posts for a given slug
 */
export const useSimilarPosts = async (
  slug: string
): Promise<ContentResult<SimilarityData | null>> => {
  const slugCleaned = slug.replace(/\//g, '_').replace(/_+$/, '');
  const expectedStem = `similarities/${slugCleaned}`;
  
  const result = await useAsyncData<SimilarityData | null>(
    `similar-posts-${slugCleaned}`,
    async () => {
      try {
        const allSimilarities = await queryCollection('similarities').all();
        
        if (!Array.isArray(allSimilarities)) {
          console.error('Similarities data is not an array');
          return null;
        }
        
        const targetData = allSimilarities.find(
          (item: unknown) => {
            const obj = item as Record<string, unknown>;
            return obj.stem === expectedStem;
          }
        );
        
        if (!targetData || !targetData.most_similar) {
          return null;
        }
        
        return {
          stem: targetData.stem,
          most_similar: targetData.most_similar,
        };
      } catch (error) {
        console.error(`Failed to fetch similar posts for ${slug}`, error);
        return null;
      }
    }
  );

  return {
    data: result.data as Ref<SimilarityData | null>,
    error: computed(() => 
      result.error.value 
        ? { 
            message: result.error.value.message,
            code: 'FETCH_ERROR' as const,
            details: result.error.value
          }
        : null
    ),
    pending: result.pending,
    refresh: result.refresh,
  };
};