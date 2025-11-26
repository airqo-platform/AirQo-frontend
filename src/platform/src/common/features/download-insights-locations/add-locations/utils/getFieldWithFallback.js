/**
 * Returns the first truthy field from a list of field names.
 * @param {Object} item
 * @param {string[]} fields
 * @returns {string}
 */
export const getFieldWithFallback = (item, fields) => {
  for (const field of fields) {
    const val = item?.[field];
    if (val && typeof val === 'string') {
      const lower = val.trim().toLowerCase();
      if (lower && lower !== 'n/a' && lower !== 'na' && lower !== 'unknown') {
        return val;
      }
    } else if (val != null && val !== '') {
      return val;
    }
  }
  return '--';
};
