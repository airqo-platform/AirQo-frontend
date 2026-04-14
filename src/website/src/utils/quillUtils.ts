import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';

import logger from './logger';

/**
 * Checks if a string is valid HTML.
 * @param {string} str - The string to check.
 * @returns {boolean} True if the string looks like HTML, false otherwise.
 */
const isHtml = (str: string): boolean => {
  const trimmedStr = str.trim();
  return (
    trimmedStr.startsWith('<') &&
    trimmedStr.endsWith('>') &&
    /<\/?[a-z][\s\S]*>/i.test(trimmedStr)
  );
};

/**
 * Helper to escape HTML entities
 */
const escapeHtml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Converts a Quill Delta (JSON string, Delta object) to HTML or returns the HTML string if already provided.
 * Includes inline styles and supports full Quill formatting.
 * @param {string | object} deltaInput - The Delta object, JSON string, or HTML string.
 * @returns {string} The HTML string.
 */
export const convertDeltaToHtml = (deltaInput: string | object): string => {
  // Handle null, undefined, or empty inputs
  if (!deltaInput) {
    return '';
  }

  // Return the input directly if it's already a valid HTML string
  if (typeof deltaInput === 'string' && isHtml(deltaInput)) {
    return deltaInput;
  }

  let delta: any;

  // If the input is a string, try to parse it as JSON
  if (typeof deltaInput === 'string') {
    const trimmedInput = deltaInput.trim();

    // Handle empty strings
    if (!trimmedInput) {
      return '';
    }

    // If it doesn't look like JSON, treat as plain text
    if (!trimmedInput.startsWith('{') && !trimmedInput.startsWith('[')) {
      return `<p>${escapeHtml(trimmedInput).replace(/\n/g, '<br>')}</p>`;
    }

    try {
      delta = JSON.parse(trimmedInput);
    } catch (error) {
      logger.error(
        'Failed to parse JSON string in convertDeltaToHtml',
        error as Error,
        {
          deltaInput: trimmedInput,
          inputType: typeof deltaInput,
          inputLength: trimmedInput.length,
        },
      );
      // If JSON parse fails, treat as plain text
      return `<p>${escapeHtml(trimmedInput).replace(/\n/g, '<br>')}</p>`;
    }
  } else if (typeof deltaInput === 'object') {
    delta = deltaInput; // If the input is already an object, use it directly
  } else {
    logger.warn('Invalid input type for convertDeltaToHtml', {
      inputType: typeof deltaInput,
      deltaInput,
    });
    return ''; // Return an empty string if the input is neither a string nor an object
  }

  // Ensure the delta object contains an 'ops' array
  if (!delta || !delta.ops) {
    logger.warn(
      'Invalid Delta object: Missing "ops" array in convertDeltaToHtml',
      {
        delta,
        hasOps: !!delta?.ops,
      },
    );
    return ''; // Return an empty string if 'ops' is missing
  }

  // Convert the Delta object to HTML using QuillDeltaToHtmlConverter
  try {
    const converter = new QuillDeltaToHtmlConverter(delta.ops, {
      inlineStyles: true, // Enable inline styles for styling (bold, italic, etc.)
      multiLineBlockquote: true, // Ensure multi-line blockquotes are supported
      multiLineHeader: false, // Headings stay on a single line
      listItemTag: 'li', // Ensure lists are rendered as proper <li> tags
    });

    return converter.convert();
  } catch (error) {
    logger.error(
      'Error converting Delta to HTML in convertDeltaToHtml',
      error as Error,
      {
        delta,
        opsLength: delta.ops?.length,
      },
    );
    return ''; // Return an empty string if conversion fails
  }
};

/**
 * Renders the content as HTML or converts it from a Quill Delta.
 * @param {string | object} content - The content to render, either as HTML or Delta.
 * @returns {string} The resulting HTML string.
 */
export const renderContent = (content: string | object): string => {
  return convertDeltaToHtml(content);
};
