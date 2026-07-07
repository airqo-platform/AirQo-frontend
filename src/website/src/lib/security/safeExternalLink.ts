const ALLOWED_EXTERNAL_HOSTS = [
  'platform.airqo.net',
  'vertex.airqo.net',
  'beacon.airqo.net',
  'github.com',
  'twitter.com',
  'x.com',
  'linkedin.com',
  'facebook.com',
  'instagram.com',
  'youtube.com',
  'makerere.ac.ug',
  'mak.ac.ug',
  'who.int',
  'worldbank.org',
  'google.org',
  'unea.org',
];

export function isSafeExternalLink(href: string): boolean {
  try {
    const url = new URL(href);
    if (url.protocol === 'mailto:' || url.protocol === 'tel:') {
      return true;
    }
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
      return true;
    }
    return ALLOWED_EXTERNAL_HOSTS.some(
      (host) => url.hostname === host || url.hostname.endsWith(`.${host}`),
    );
  } catch {
    return false;
  }
}

export function getExternalLinkProps(href: string): {
  target?: string;
  rel?: string;
} {
  try {
    const url = new URL(href);
    const isInternal =
      url.hostname === 'localhost' ||
      url.hostname === '127.0.0.1' ||
      (typeof window !== 'undefined' &&
        url.hostname === window.location.hostname);

    if (isInternal) {
      return {};
    }

    if (isSafeExternalLink(href)) {
      return { target: '_blank', rel: 'noopener noreferrer' };
    }

    return { target: '_blank', rel: 'noopener noreferrer nofollow' };
  } catch {
    return {};
  }
}
