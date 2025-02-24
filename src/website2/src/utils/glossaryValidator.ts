// src/utils/glossaryValidator.ts

/**
 * Checks if the provided glossary HTML content is valid for display.
 * It removes any empty paragraphs (e.g., <p><br/></p>) and then checks
 * if the cleaned content contains any invalid snippets.
 *
 * @param html The HTML content to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
export function isValidGlossaryContent(html: string): boolean {
  if (!html) return false;

  // Remove empty paragraphs. This regex will remove <p><br/></p> or similar variants.
  const cleanedHTML = html.replace(/<p>\s*<br\s*\/?>\s*<\/p>/gi, '').trim();

  const invalidSnippets = [
    '<p><br/></p>',
    'No details available yet.',
    'Details coming soon.',
  ];

  // Check if the cleaned HTML contains any of the invalid snippets.
  for (const snippet of invalidSnippets) {
    if (cleanedHTML === snippet || cleanedHTML.includes(snippet)) {
      return false;
    }
  }

  return cleanedHTML.length > 0;
}
