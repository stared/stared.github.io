/**
 * Runtime validation utilities for external data
 * Ensures data integrity when loading from JSON or APIs
 */

import type {
  ExternalArticle,
  Project,
  Publication,
  Mention,
} from '~/types/content';

import { DEFAULT_VALUES } from '~/types/content';

export class ValidationError extends Error {
  constructor(
    public field: string,
    public value: unknown,
    public expectedType: string
  ) {
    super(`Validation failed for field "${field}": expected ${expectedType}, got ${typeof value}`);
    this.name = 'ValidationError';
  }
}

export class DataIntegrityError extends Error {
  constructor(
    public errors: ValidationError[],
    public dataPath: string
  ) {
    super(`Data integrity check failed at ${dataPath}: ${errors.length} validation errors`);
    this.name = 'DataIntegrityError';
  }
}

/**
 * Validate and normalize a string field
 */
function validateString(value: unknown, fieldName: string, defaultValue: string = ''): string {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  if (typeof value !== 'string') {
    throw new ValidationError(fieldName, value, 'string');
  }
  return value.trim();
}

/**
 * Validate and normalize a number field
 */
function validateNumber(value: unknown, fieldName: string, defaultValue: number = 0): number {
  if (value === null || value === undefined) {
    return defaultValue;
  }
  const num = Number(value);
  if (isNaN(num)) {
    throw new ValidationError(fieldName, value, 'number');
  }
  return num;
}

/**
 * Validate and normalize an array field
 */
function validateArray<T>(
  value: unknown,
  fieldName: string,
  itemValidator?: (item: unknown, index: number) => T
): T[] {
  if (value === null || value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new ValidationError(fieldName, value, 'array');
  }
  if (itemValidator) {
    return value.map((item, index) => itemValidator(item, index));
  }
  return value as T[];
}

/**
 * Validate and normalize a date string
 */
function validateDate(value: unknown, fieldName: string): string {
  const dateStr = validateString(value, fieldName);
  if (!dateStr) {
    throw new ValidationError(fieldName, value, 'valid date string');
  }
  const parsed = Date.parse(dateStr);
  if (isNaN(parsed)) {
    throw new ValidationError(fieldName, value, 'valid ISO date');
  }
  return new Date(parsed).toISOString();
}

/**
 * Validate an optional date (can be null for ongoing)
 */
function validateOptionalDate(value: unknown, fieldName: string): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return validateDate(value, fieldName);
}

/**
 * Validate a Mention object
 */
function validateMention(value: unknown, index: number): Mention {
  if (typeof value !== 'object' || value === null) {
    throw new ValidationError(`mentions[${index}]`, value, 'object');
  }
  const obj = value as Record<string, unknown>;
  return {
    text: validateString(obj.text, `mentions[${index}].text`),
    href: validateString(obj.href, `mentions[${index}].href`),
  };
}

/**
 * Validate and normalize an ExternalArticle
 */
export function validateExternalArticleData(data: unknown): ExternalArticle {
  if (typeof data !== 'object' || data === null) {
    throw new ValidationError('article', data, 'object');
  }
  
  const obj = data as Record<string, unknown>;
  const errors: ValidationError[] = [];
  
  const result: Partial<ExternalArticle> = {};
  
  // Required fields
  try {
    result.title = validateString(obj.title, 'title');
    if (!result.title) errors.push(new ValidationError('title', obj.title, 'non-empty string'));
  } catch (e) {
    if (e instanceof ValidationError) errors.push(e);
  }
  
  try {
    result.source = validateString(obj.source, 'source');
    if (!result.source) errors.push(new ValidationError('source', obj.source, 'non-empty string'));
  } catch (e) {
    if (e instanceof ValidationError) errors.push(e);
  }
  
  try {
    result.href = validateString(obj.href, 'href');
    if (!result.href) errors.push(new ValidationError('href', obj.href, 'non-empty string'));
  } catch (e) {
    if (e instanceof ValidationError) errors.push(e);
  }
  
  try {
    result.date = validateDate(obj.date, 'date');
  } catch (e) {
    if (e instanceof ValidationError) errors.push(e);
  }
  
  // Optional fields with defaults
  result.author = validateString(obj.author, 'author', DEFAULT_VALUES.author);
  result.description = validateString(obj.description, 'description', DEFAULT_VALUES.description);
  result.image = obj.image === null ? null : validateString(obj.image, 'image', '');
  result.tags = validateArray<string>(obj.tags, 'tags');
  result.mentions = validateArray<Mention>(obj.mentions, 'mentions', validateMention);
  result.views_k = validateNumber(obj.views_k, 'views_k', DEFAULT_VALUES.views_k);
  result.migdal_score = validateNumber(obj.migdal_score, 'migdal_score', DEFAULT_VALUES.migdal_score);
  
  if (errors.length > 0) {
    throw new DataIntegrityError(errors, 'ExternalArticle');
  }
  
  return result as ExternalArticle;
}

/**
 * Validate and normalize a Project
 */
export function validateProjectData(data: unknown): Project {
  if (typeof data !== 'object' || data === null) {
    throw new ValidationError('project', data, 'object');
  }
  
  const obj = data as Record<string, unknown>;
  const errors: ValidationError[] = [];
  
  const result: Partial<Project> = {};
  
  // Required fields
  try {
    result.title = validateString(obj.title, 'title');
    if (!result.title) errors.push(new ValidationError('title', obj.title, 'non-empty string'));
  } catch (e) {
    if (e instanceof ValidationError) errors.push(e);
  }
  
  try {
    result.desc = validateString(obj.desc, 'desc');
    if (!result.desc) errors.push(new ValidationError('desc', obj.desc, 'non-empty string'));
  } catch (e) {
    if (e instanceof ValidationError) errors.push(e);
  }
  
  try {
    result.href = validateString(obj.href, 'href');
    if (!result.href) errors.push(new ValidationError('href', obj.href, 'non-empty string'));
  } catch (e) {
    if (e instanceof ValidationError) errors.push(e);
  }
  
  try {
    result.dateStart = validateDate(obj.dateStart, 'dateStart');
  } catch (e) {
    if (e instanceof ValidationError) errors.push(e);
  }
  
  // Optional fields
  result.dateEnd = validateOptionalDate(obj.dateEnd, 'dateEnd');
  
  const statusValue = validateString(obj.status, 'status', 'completed');
  if (!['active', 'completed', 'archived', 'on-hold'].includes(statusValue)) {
    result.status = 'completed';
  } else {
    result.status = statusValue as Project['status'];
  }
  
  result.tags = validateArray<string>(obj.tags, 'tags');
  result.mentions = validateArray<Mention>(obj.mentions, 'mentions', validateMention);
  result.role = validateString(obj.role, 'role', 'Developer');
  result.technologies = validateArray<string>(obj.technologies, 'technologies');
  
  if (errors.length > 0) {
    throw new DataIntegrityError(errors, 'Project');
  }
  
  return result as Project;
}

/**
 * Validate and normalize a Publication
 */
export function validatePublicationData(data: unknown): Publication {
  if (typeof data !== 'object' || data === null) {
    throw new ValidationError('publication', data, 'object');
  }
  
  const obj = data as Record<string, unknown>;
  const errors: ValidationError[] = [];
  
  const result: Partial<Publication> = {};
  
  // Required fields
  try {
    result.authors = validateString(obj.authors, 'authors');
    if (!result.authors) errors.push(new ValidationError('authors', obj.authors, 'non-empty string'));
  } catch (e) {
    if (e instanceof ValidationError) errors.push(e);
  }
  
  try {
    result.title = validateString(obj.title, 'title');
    if (!result.title) errors.push(new ValidationError('title', obj.title, 'non-empty string'));
  } catch (e) {
    if (e instanceof ValidationError) errors.push(e);
  }
  
  try {
    result.journal = validateString(obj.journal, 'journal');
    if (!result.journal) errors.push(new ValidationError('journal', obj.journal, 'non-empty string'));
  } catch (e) {
    if (e instanceof ValidationError) errors.push(e);
  }
  
  result.year = validateNumber(obj.year, 'year', new Date().getFullYear());
  
  // Optional fields
  result.volume = obj.volume === null ? null : validateString(obj.volume, 'volume', '');
  result.pages = obj.pages === null ? null : validateString(obj.pages, 'pages', '');
  result.doi = obj.doi === null ? null : validateString(obj.doi, 'doi', '');
  result.arxiv = obj.arxiv === null ? null : validateString(obj.arxiv, 'arxiv', '');
  result.pmid = obj.pmid === null ? null : validateString(obj.pmid, 'pmid', '');
  result.abstract = validateString(obj.abstract, 'abstract', '');
  result.keywords = validateArray<string>(obj.keywords, 'keywords');
  result.citations = validateNumber(obj.citations, 'citations', 0);
  
  if (errors.length > 0) {
    throw new DataIntegrityError(errors, 'Publication');
  }
  
  return result as Publication;
}

/**
 * Batch validate an array of items
 */
export function validateBatch<T>(
  items: unknown[],
  validator: (item: unknown) => T,
  itemName: string
): { valid: T[]; errors: Array<{ index: number; error: Error }> } {
  const valid: T[] = [];
  const errors: Array<{ index: number; error: Error }> = [];
  
  items.forEach((item, index) => {
    try {
      valid.push(validator(item));
    } catch (error) {
      console.error(`Validation failed for ${itemName}[${index}]:`, error);
      errors.push({ 
        index, 
        error: error instanceof Error ? error : new Error(String(error))
      });
    }
  });
  
  return { valid, errors };
}

/**
 * Create a safe loader for JSON data with validation
 */
export function createSafeJsonLoader<T>(
  validator: (item: unknown) => T,
  itemName: string
) {
  return async (path: string): Promise<{ items: T[]; errors: Array<{ index: number; error: Error }> }> => {
    try {
      const module = await import(path);
      const data = module.default || module;
      
      if (!data || typeof data !== 'object' || !('items' in data) || !Array.isArray(data.items)) {
        throw new Error(`Invalid data structure in ${path}: expected { items: Array }`);
      }
      
      const result = validateBatch(data.items, validator, itemName);
      
      if (result.errors.length > 0) {
        console.warn(`${result.errors.length} validation errors in ${path}`);
      }
      
      return {
        items: result.valid,
        errors: result.errors,
      };
    } catch (error) {
      console.error(`Failed to load and validate ${path}:`, error);
      throw error;
    }
  };
}