/**
 * Markdown Utilities
 * Convert markdown content to HTML for display
 */

import { marked } from "marked";

/**
 * Convert markdown string to HTML
 * Used for content feedback display
 */
export function markdownToHtml(markdown: string): string {
  if (!markdown) {
    return "";
  }

  try {
    // Configure marked options
    marked.setOptions({
      gfm: true, // GitHub Flavored Markdown
      breaks: true, // Convert \n to <br>
    });

    // Convert and return HTML
    return marked(markdown) as string;
  } catch (error) {
    console.error("Error converting markdown to HTML:", error);
    return markdown; // Return original markdown if conversion fails
  }
}

/**
 * Sanitize HTML to prevent XSS attacks
 * Basic sanitization - for production use a library like DOMPurify
 */
export function sanitizeHtml(html: string): string {
  // This is a basic implementation
  // For production, consider using DOMPurify or similar library
  const div = document.createElement("div");
  div.textContent = html;
  return div.innerHTML;
}
