// src/lib/sanitize.ts
// Isomorphic input sanitization utilities for user-generated content.
// Works in both browser (SSR) and server (serverless functions) environments.
// DOMPurify is only loaded lazily on the client for full HTML sanitization.

/**
 * Strips all HTML tags from a string (isomorphic — works on server + client).
 * Sufficient for plain-text contexts where we just need to remove tags.
 */
function stripHtmlTags(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * On the client, uses DOMPurify for robust sanitization.
 * On the server, falls back to stripping all tags (safe for text-only contexts).
 */
export function sanitizeHtml(html: string): string {
  if (typeof window !== "undefined") {
    // Lazy-load DOMPurify only on the client
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const DOMPurify = require("dompurify") as typeof import("dompurify").default;
      return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ["b", "i", "em", "strong", "a", "p", "br", "ul", "ol", "li"],
        ALLOWED_ATTR: ["href", "target", "rel"],
      });
    } catch {
      // Fallback if DOMPurify can't load
      return stripHtmlTags(html);
    }
  }
  // Server: strip all tags
  return stripHtmlTags(html);
}

/**
 * Sanitizes plain text content.
 * Removes HTML tags (isomorphic — no DOM needed).
 */
export function sanitizeText(text: string): string {
  return stripHtmlTags(text);
}

/**
 * Sanitizes user input for display in forms.
 * Preserves basic formatting but removes dangerous content.
 */
export function sanitizeInput(input: string): string {
  return sanitizeText(input).trim();
}
