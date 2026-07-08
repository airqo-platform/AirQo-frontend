import { getExternalLinkProps, isSafeExternalLink } from '../safeExternalLink';

describe('isSafeExternalLink', () => {
  it('should return true for allowed external hosts', () => {
    expect(isSafeExternalLink('https://platform.airqo.net/dashboard')).toBe(
      true,
    );
    expect(isSafeExternalLink('https://github.com/airqo')).toBe(true);
    expect(isSafeExternalLink('https://twitter.com/airqo')).toBe(true);
    expect(isSafeExternalLink('https://x.com/airqo')).toBe(true);
    expect(isSafeExternalLink('https://linkedin.com/company/airqo')).toBe(true);
    expect(isSafeExternalLink('https://facebook.com/airqo')).toBe(true);
    expect(isSafeExternalLink('https://instagram.com/airqo')).toBe(true);
    expect(isSafeExternalLink('https://youtube.com/airqo')).toBe(true);
  });

  it('should return true for subdomains of allowed hosts', () => {
    expect(isSafeExternalLink('https://docs.platform.airqo.net')).toBe(true);
    expect(isSafeExternalLink('https://api.platform.airqo.net')).toBe(true);
    expect(isSafeExternalLink('https://sub.github.com')).toBe(true);
  });

  it('should return true for mailto links', () => {
    expect(isSafeExternalLink('mailto:test@example.com')).toBe(true);
    expect(isSafeExternalLink('mailto:user@airqo.net')).toBe(true);
  });

  it('should return true for tel links', () => {
    expect(isSafeExternalLink('tel:+1234567890')).toBe(true);
    expect(isSafeExternalLink('tel:+256700123456')).toBe(true);
  });

  it('should return true for localhost', () => {
    expect(isSafeExternalLink('http://localhost:3000')).toBe(true);
    expect(isSafeExternalLink('https://localhost')).toBe(true);
  });

  it('should return true for 127.0.0.1', () => {
    expect(isSafeExternalLink('http://127.0.0.1:3000')).toBe(true);
    expect(isSafeExternalLink('https://127.0.0.1')).toBe(true);
  });

  it('should return false for unknown external hosts', () => {
    expect(isSafeExternalLink('https://evil.com/steal')).toBe(false);
    expect(isSafeExternalLink('https://malicious-site.org')).toBe(false);
    expect(isSafeExternalLink('https://phishing.com/login')).toBe(false);
  });

  it('should return false for invalid URLs', () => {
    expect(isSafeExternalLink('not-a-url')).toBe(false);
    expect(isSafeExternalLink('')).toBe(false);
    expect(isSafeExternalLink('://missing-protocol')).toBe(false);
  });

  it('should return true for makerere.ac.ug and mak.ac.ug', () => {
    expect(isSafeExternalLink('https://makerere.ac.ug')).toBe(true);
    expect(isSafeExternalLink('https://mak.ac.ug')).toBe(true);
    expect(isSafeExternalLink('https://cs.mak.ac.ug')).toBe(true);
  });

  it('should return true for who.int, worldbank.org, google.org, unea.org', () => {
    expect(isSafeExternalLink('https://who.int')).toBe(true);
    expect(isSafeExternalLink('https://worldbank.org')).toBe(true);
    expect(isSafeExternalLink('https://google.org')).toBe(true);
    expect(isSafeExternalLink('https://unea.org')).toBe(true);
  });

  it('should return true for beacon.airqo.net and vertex.airqo.net', () => {
    expect(isSafeExternalLink('https://beacon.airqo.net')).toBe(true);
    expect(isSafeExternalLink('https://vertex.airqo.net')).toBe(true);
  });

  it('should return false for http variant of disallowed host', () => {
    expect(isSafeExternalLink('http://evil.com')).toBe(false);
  });

  it('should return false for hostname that contains allowed host but is not a subdomain', () => {
    expect(isSafeExternalLink('https://notevilairqo.net')).toBe(false);
    expect(isSafeExternalLink('https://evilgithub.com')).toBe(false);
  });
});

describe('getExternalLinkProps', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://example.com'),
      writable: true,
      configurable: true,
    });
  });

  it('should return empty object for internal links (localhost)', () => {
    const props = getExternalLinkProps('http://localhost:3000/page');

    expect(props).toEqual({});
  });

  it('should return empty object for internal links (127.0.0.1)', () => {
    const props = getExternalLinkProps('http://127.0.0.1:3000/page');

    expect(props).toEqual({});
  });

  it('should return empty object for same-hostname links', () => {
    Object.defineProperty(window, 'location', {
      value: new URL('https://platform.airqo.net'),
      writable: true,
      configurable: true,
    });

    const props = getExternalLinkProps('https://platform.airqo.net/page');

    expect(props).toEqual({});
  });

  it('should return target=_blank and noopener noreferrer for safe external links', () => {
    const props = getExternalLinkProps('https://github.com/airqo');

    expect(props).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer',
    });
  });

  it('should return target=_blank and noopener noreferrer nofollow for unsafe external links', () => {
    const props = getExternalLinkProps('https://evil.com/malware');

    expect(props).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer nofollow',
    });
  });

  it('should return noopener noreferrer for twitter.com', () => {
    const props = getExternalLinkProps('https://twitter.com/airqo');

    expect(props).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer',
    });
  });

  it('should return noopener noreferrer for linkedin.com', () => {
    const props = getExternalLinkProps('https://linkedin.com/company/airqo');

    expect(props).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer',
    });
  });

  it('should return empty object for invalid URLs', () => {
    const props = getExternalLinkProps('not-a-valid-url');

    expect(props).toEqual({});
  });

  it('should return empty object for empty string', () => {
    const props = getExternalLinkProps('');

    expect(props).toEqual({});
  });

  it('should return noopener noreferrer for mailto links', () => {
    const props = getExternalLinkProps('mailto:test@example.com');

    expect(props).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer',
    });
  });

  it('should treat subdomains of localhost as internal', () => {
    const props = getExternalLinkProps('http://localhost:8080/api');

    expect(props).toEqual({});
  });

  it('should return noopener noreferrer for subdomains of allowed hosts', () => {
    const props = getExternalLinkProps('https://docs.platform.airqo.net');

    expect(props).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer',
    });
  });

  it('should return nofollow for unknown external hosts', () => {
    const props = getExternalLinkProps('https://random-site.com/page');

    expect(props).toEqual({
      target: '_blank',
      rel: 'noopener noreferrer nofollow',
    });
  });
});
