// src/utils/htmlValidator.ts

import createDOMPurify from 'dompurify';

export const INVALID_HTML_SNIPPETS = [
  '<p><br/></p>',
  'No details available yet.',
  'Details coming soon.',
] as const;

/**
 * Checks if a string contains any of the known invalid/placeholder snippets.
 */
export function containsInvalidSnippet(content: string): boolean {
  return INVALID_HTML_SNIPPETS.some(
    (snippet) => content === snippet || content.includes(snippet),
  );
}

/**
 * Checks if the provided HTML content is valid for display.
 * It will return false if the content is empty or if it contains any
 * unwanted placeholders like '<p><br/></p>', 'No details available yet.', or 'Details coming soon.'.
 *
 * @param html The HTML content to validate.
 * @returns {boolean} True if the content is valid, false otherwise.
 */
export function isValidHTMLContent(html: string): boolean {
  const trimmedHTML = html.trim();

  if (!trimmedHTML) return false;

  return !containsInvalidSnippet(trimmedHTML);
}

/**
 * Sanitizes HTML content and removes unwanted attributes like data-external-decorated.
 * @param html The HTML content to sanitize and clean.
 * @param config Optional DOMPurify config.
 * @returns The cleaned HTML string.
 */
export function sanitizeAndCleanHTML(html: string, config?: any): string {
  if (!html) return '';

  // When running on the server (no window), do a minimal, safe cleanup
  // to avoid referencing the browser-only DOMPurify API during SSR.
  if (typeof window === 'undefined') {
    // Remove script tags
    let cleaned = html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
    // Remove inline event handlers like onclick="..."
    cleaned = cleaned
      .replace(/\son\w+=\"[^\"]*\"/gi, '')
      .replace(/\son\w+='[^']*'/gi, '');
    // Remove javascript: URIs in href/src
    cleaned = cleaned.replace(
      /(href|src)=\"\s*javascript:[^\"]*\"/gi,
      '$1="#"',
    );
    // Remove data-external-decorated attribute to avoid React warnings
    cleaned = cleaned.replace(/data-external-decorated="[^"]*"/g, '');
    return cleaned;
  }

  // Client-side: initialize DOMPurify with the browser window
  const DOMPurify = createDOMPurify(window as any);
  const sanitized = DOMPurify.sanitize(html, config) as unknown as string;
  // Remove data-external-decorated attribute to avoid React warnings
  return sanitized.replace(/data-external-decorated="[^"]*"/g, '');
}
