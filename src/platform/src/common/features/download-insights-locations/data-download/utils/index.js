// MIME type mapping with fallback
export const getMimeType = (fileType) => {
  const mimeTypes = {
    csv: 'text/csv;charset=utf-8;',
    pdf: 'application/pdf',
    json: 'application/json',
  };
  return mimeTypes[fileType] || 'application/octet-stream';
};
