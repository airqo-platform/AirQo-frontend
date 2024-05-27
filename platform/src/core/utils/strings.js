export const stripTrailingSlash = (url) => url.trim().replace(/\/$/, '');

export const capitalizeText = (text) => {
  if (!text) {
    return '';
  }
  const words = text.split(' ');
  const capitalizedWords = words.map((word) => {
    const firstLetter = word.charAt(0)?.toUpperCase();
    const restOfWord = word.slice(1)?.toLowerCase();
    return firstLetter + restOfWord;
  });
  return capitalizedWords.join(' ');
};
