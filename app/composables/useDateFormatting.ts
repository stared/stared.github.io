/**
 * Unified date formatting utilities
 * Provides consistent date formatting across the application
 */

export interface DateFormatOptions {
  locale?: string;
  timezone?: string;
}

const DEFAULT_LOCALE = 'en-US';

export const useDateFormatting = (options: DateFormatOptions = {}) => {
  const locale = options.locale || DEFAULT_LOCALE;

  /**
   * Parse and validate a date string
   * Returns null if invalid
   */
  const parseDate = (date: string | null | undefined): Date | null => {
    if (!date) return null;
    
    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) {
      console.error(`Invalid date format: ${date}`);
      return null;
    }
    
    return parsed;
  };

  /**
   * Format date as "Jan 6, 2017"
   */
  const formatFullDate = (date: string): string => {
    const parsed = parseDate(date);
    if (!parsed) return 'Invalid Date';
    
    return parsed.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  /**
   * Format date as "Jan 2017"
   */
  const formatMonthYear = (date: string): string => {
    const parsed = parseDate(date);
    if (!parsed) return 'Invalid Date';
    
    return parsed.toLocaleDateString(locale, {
      month: 'short',
      year: 'numeric',
    });
  };

  /**
   * Format date as "2017"
   */
  const formatYear = (date: string | null): string => {
    if (!date) return '';
    
    const parsed = parseDate(date);
    if (!parsed) return '';
    
    return parsed.getFullYear().toString();
  };

  /**
   * Format date as ISO string "2017-01-06"
   */
  const formatISO = (date: string): string => {
    const parsed = parseDate(date);
    if (!parsed) return '';
    
    return parsed.toISOString().split('T')[0] || '';
  };

  /**
   * Format relative time "2 days ago", "in 3 months"
   */
  const formatRelative = (date: string): string => {
    const parsed = parseDate(date);
    if (!parsed) return 'Invalid Date';
    
    const now = new Date();
    const diffMs = now.getTime() - parsed.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const absDiffDays = Math.abs(diffDays);
    
    if (absDiffDays === 0) return 'today';
    if (absDiffDays === 1) return diffDays > 0 ? 'yesterday' : 'tomorrow';
    
    if (absDiffDays < 7) {
      return diffDays > 0 
        ? `${absDiffDays} days ago`
        : `in ${absDiffDays} days`;
    }
    
    const weeks = Math.floor(absDiffDays / 7);
    if (weeks < 4) {
      return diffDays > 0
        ? `${weeks} week${weeks > 1 ? 's' : ''} ago`
        : `in ${weeks} week${weeks > 1 ? 's' : ''}`;
    }
    
    const months = Math.floor(absDiffDays / 30);
    if (months < 12) {
      return diffDays > 0
        ? `${months} month${months > 1 ? 's' : ''} ago`
        : `in ${months} month${months > 1 ? 's' : ''}`;
    }
    
    const years = Math.floor(absDiffDays / 365);
    return diffDays > 0
      ? `${years} year${years > 1 ? 's' : ''} ago`
      : `in ${years} year${years > 1 ? 's' : ''}`;
  };

  /**
   * Format date range "Jan 2017 - Mar 2018" or "Jan 2017 - Present"
   */
  const formatDateRange = (
    startDate: string,
    endDate: string | null,
    format: 'year' | 'month' = 'year'
  ): string => {
    const start = parseDate(startDate);
    if (!start) return 'Invalid Date Range';
    
    const startFormatted = format === 'year' 
      ? formatYear(startDate)
      : formatMonthYear(startDate);
    
    if (!endDate) {
      return `${startFormatted} - Present`;
    }
    
    const end = parseDate(endDate);
    if (!end) return `${startFormatted} - Invalid Date`;
    
    const endFormatted = format === 'year'
      ? formatYear(endDate)
      : formatMonthYear(endDate);
    
    return `${startFormatted} - ${endFormatted}`;
  };

  /**
   * Calculate age in years from a date
   */
  const calculateAge = (date: string): number => {
    const parsed = parseDate(date);
    if (!parsed) return 0;
    
    const now = new Date();
    const diffMs = now.getTime() - parsed.getTime();
    const years = diffMs / (1000 * 60 * 60 * 24 * 365.25);
    
    return Math.max(0, years);
  };

  /**
   * Check if date is in the past
   */
  const isPast = (date: string): boolean => {
    const parsed = parseDate(date);
    if (!parsed) return false;
    
    return parsed < new Date();
  };

  /**
   * Check if date is in the future
   */
  const isFuture = (date: string): boolean => {
    const parsed = parseDate(date);
    if (!parsed) return false;
    
    return parsed > new Date();
  };

  /**
   * Sort dates in ascending order
   */
  const sortDatesAscending = (dates: string[]): string[] => {
    return [...dates].sort((a, b) => {
      const dateA = parseDate(a);
      const dateB = parseDate(b);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    });
  };

  /**
   * Sort dates in descending order
   */
  const sortDatesDescending = (dates: string[]): string[] => {
    return [...dates].sort((a, b) => {
      const dateA = parseDate(a);
      const dateB = parseDate(b);
      if (!dateA || !dateB) return 0;
      return dateB.getTime() - dateA.getTime();
    });
  };

  return {
    parseDate,
    formatFullDate,
    formatMonthYear,
    formatYear,
    formatISO,
    formatRelative,
    formatDateRange,
    calculateAge,
    isPast,
    isFuture,
    sortDatesAscending,
    sortDatesDescending,
  };
};