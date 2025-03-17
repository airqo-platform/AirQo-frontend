import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html';

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
 * Converts a Quill Delta (JSON string, Delta object) to HTML or returns the HTML string if already provided.
 * Includes inline styles and supports full Quill formatting.
 * @param {string | object} deltaInput - The Delta object, JSON string, or HTML string.
 * @returns {string} The HTML string.
 */
export const convertDeltaToHtml = (deltaInput: string | object): string => {
  // Return the input directly if it's already a valid HTML string
  if (typeof deltaInput === 'string' && isHtml(deltaInput)) {
    return deltaInput;
  }

  let delta: any;

  // If the input is a string, try to parse it as JSON
  if (typeof deltaInput === 'string') {
    try {
      delta = JSON.parse(deltaInput);
    } catch (error) {
      console.error('Failed to parse JSON string:', error);
      return ''; // Return an empty string if the input is not valid JSON
    }
  } else if (typeof deltaInput === 'object') {
    delta = deltaInput; // If the input is already an object, use it directly
  } else {
    return ''; // Return an empty string if the input is neither a string nor an object
  }

  // Ensure the delta object contains an 'ops' array
  if (!delta || !delta.ops) {
    console.error('Invalid Delta object: Missing "ops" array.');
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
    console.error('Error converting Delta to HTML:', error);
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
