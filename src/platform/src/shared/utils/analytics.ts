/**
 * Simple FNV-1a hash function for client-side anonymization
 * We use this instead of crypto.subtle to keep it synchronous and fast
 */
export const hashId = (str: string): string => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16);
};

/**
 * Anonymizes site data for analytics
 */
export const anonymizeSiteData = (siteId: string) => {
  return {
    site_id_hashed: hashId(siteId),
    // We don't include the name at all
  };
};
