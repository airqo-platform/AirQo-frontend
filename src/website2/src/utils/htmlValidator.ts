// src/utils/htmlValidator.ts

/**
 * Checks if the provided HTML content is valid for display.
 * It will return false if the content is empty or if it contains any
 * unwanted placeholders like '<p><br/></p>', 'No details available yet.', or 'Details coming soon.'.
 *
 * @param html The HTML content to validate.
 * @returns {boolean} True if the content is valid, false otherwise.
 */
export function isValidHTMLContent(html: string): boolean {
  const invalidSnippets = [
    '<p><br/></p>',
    'No details available yet.',
    'Details coming soon.',
  ];

  // Trim the HTML to ensure we don't have just whitespace.
  const trimmedHTML = html.trim();

  if (!trimmedHTML) return false;

  // Check if any invalid snippet exists in the HTML.
  for (const snippet of invalidSnippets) {
    if (trimmedHTML.includes(snippet)) {
      return false;
    }
  }
  return true;
}
