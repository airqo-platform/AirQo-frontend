/**
 * Returns the first truthy field from a list of field names.
 * @param {Object} item
 * @param {string[]} fields
 * @returns {string}
 */
export const getFieldWithFallback = (item, fields) => {
  for (const field of fields) {
    if (item[field]) return item[field];
  }
  return 'N/A';
};
