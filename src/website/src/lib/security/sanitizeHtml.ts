import DOMPurify from 'dompurify';

if (typeof window !== 'undefined') {
  (window as any).DOMPurify = DOMPurify;
}

export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    return dirty;
  }
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b',
      'i',
      'em',
      'strong',
      'a',
      'p',
      'br',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'h4',
      'h5',
      'h6',
      'blockquote',
      'code',
      'pre',
      'div',
      'span',
      'img',
      'table',
      'thead',
      'tbody',
      'tr',
      'th',
      'td',
      'sub',
      'sup',
      'hr',
      'dl',
      'dt',
      'dd',
    ],
    ALLOWED_ATTR: [
      'href',
      'target',
      'rel',
      'src',
      'alt',
      'width',
      'height',
      'class',
      'id',
      'style',
      'title',
      'aria-hidden',
      'role',
    ],
    ALLOW_DATA_ATTR: false,
  });
}

export function sanitizeText(dirty: string): string {
  if (typeof window === 'undefined') {
    return dirty;
  }
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
}
