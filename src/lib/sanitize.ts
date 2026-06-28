// src/lib/sanitize.ts
// Input sanitization utilities for user-generated content
import DOMPurify from 'dompurify';

/**
 * Sanitizes HTML content to prevent XSS attacks
 * Use this for any user-generated content that will be displayed as HTML
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
}

/**
 * Sanitizes plain text content
 * Removes HTML tags and escapes special characters
 */
export function sanitizeText(text: string): string {
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] });
}

/**
 * Sanitizes user input for display in forms
 * Preserves basic formatting but removes dangerous content
 */
export function sanitizeInput(input: string): string {
  return sanitizeText(input).trim();
}
