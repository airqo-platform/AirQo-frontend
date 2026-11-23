/**
 * Strip trailing slashes; keep localhost/private-network URLs on HTTP and force remote URLs to HTTPS.
 */
export const enforceHttpsForRemote = (url) => {
  const normalizedUrl = url?.replace(/\/$/, '') || '';
  if (!normalizedUrl) return '';

  try {
    const parsed = new URL(normalizedUrl);
    const host = parsed.hostname;
    const isPrivateNetworkHost =
      host === 'localhost' ||
      host === '::1' ||
      host.startsWith('127.') ||
      host.startsWith('192.168.') ||
      host.startsWith('169.254.') ||
      host.startsWith('10.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);

    if (parsed.protocol === 'http:' && !isPrivateNetworkHost) {
      parsed.protocol = 'https:';
      return parsed.toString().replace(/\/$/, '');
    }

    return normalizedUrl;
  } catch {
    if (
      normalizedUrl.startsWith('http://') &&
      !normalizedUrl.includes('localhost') &&
      !normalizedUrl.includes('::1') &&
      !normalizedUrl.includes('//127.') &&
      !normalizedUrl.includes('192.168.') &&
      !normalizedUrl.includes('169.254.') &&
      !normalizedUrl.includes('10.')
    ) {
      return normalizedUrl.replace('http://', 'https://');
    }

    return normalizedUrl;
  }
};
