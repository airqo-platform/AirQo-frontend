export const capitalizeAllText = (text) => {
  if (!text) {
    return '';
  }
  const words = text?.split(' ');
  const capitalizedWords = words?.map((word) => {
    const firstLetter = word?.charAt(0)?.toUpperCase();
    const restOfWord = word?.slice(1)?.toLowerCase();
    return firstLetter + restOfWord;
  });
  return capitalizedWords?.join(' ');
};

/**
 * Removes spaces and converts text to lowercase
 * @param {string} text - The text to process
 * @returns {string} - Text with spaces removed and converted to lowercase
 */
export const removeSpacesAndLowerCase = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  return text.replace(/\s+/g, '').toLowerCase();
};
