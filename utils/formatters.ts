/**
 * Format date for display in blog posts
 */
export const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-UK", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Format date to year only (for projects)
 */
export const formatDateToYear = (date: string | null): string => {
  if (!date) return "";

  const dateObj = new Date(date);
  return dateObj.getFullYear().toString();
};

/**
 * Format date for display name (short month and year)
 */
export const formatDisplayDate = (date: string): string => {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) {
    throw new Error(`Invalid date format: ${date}`);
  }
  return dateObj.toLocaleDateString("en-us", {
    year: "numeric",
    month: "short",
  });
};

/**
 * Convert slug to clean format for similarity matching
 */
export const cleanSlugForSimilarity = (slug: string): string => {
  return slug.replace(/\//g, "_").replace(/_+$/, "");
};
