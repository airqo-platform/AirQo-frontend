export const stripTrailingSlash = (url) => {
  const cleanedUrl = url.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  return cleanedUrl.replace(/\/$/, '');
};
