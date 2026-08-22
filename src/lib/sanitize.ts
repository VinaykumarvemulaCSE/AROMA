// Isomorphic input sanitization for user-generated content.
// Intentionally does NOT import DOMPurify at module scope — that package
// expects a browser DOM and breaks Node SSR / Vercel serverless cold starts.

/**
 * Strips all HTML tags from a string (isomorphic — works on server + client).
 */
function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Uses tag-stripping (safe for text-only contexts on both server and client).
 */
export function sanitizeHtml(html: string): string {
  return stripHtmlTags(html);
}

/**
 * Sanitizes plain text content (isomorphic — no DOM needed).
 */
export function sanitizeText(text: string): string {
  return stripHtmlTags(text);
}

/**
 * Sanitizes user input for forms / emails (plain text).
 */
export function sanitizeInput(input: string): string {
  return sanitizeText(input).trim();
}
