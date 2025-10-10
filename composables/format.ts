/**
 * Format date for blog posts (e.g., "Jan 6, 2025")
 */
export const formatBlogDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("en-UK", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

/**
 * Format date to year only (e.g., "2025")
 */
export const formatYear = (dateString: string | null): string => {
  if (!dateString) return "";
  return new Date(dateString).getFullYear().toString();
};
