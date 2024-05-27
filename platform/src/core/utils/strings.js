export const stripTrailingSlash = (url) => url.trim().replace(/\/$/, '');

export const capitalizeText = (text) => {
  if (!text) {
    return '';
  }
  return text.charAt(0)?.toUpperCase() + text.slice(1)?.toLowerCase();
};
