const DEFAULT_API_VERSION_FALLBACK = 'v2';

const resolveDefaultApiVersion = (): string => {
  return DEFAULT_API_VERSION_FALLBACK;
};

const resolveServiceVersionMap = (): Record<string, string> => {
  return {};
};

const stripApiSuffix = (baseUrl: string): string => {
  const trimmedBaseUrl = baseUrl.trim().replace(/\/+$/, '');

  if (/\/api\/v\d+\/[^/]+$/i.test(trimmedBaseUrl)) {
    return trimmedBaseUrl.replace(/\/api\/v\d+\/[^/]+$/i, '');
  }

  if (/\/api\/v\d+$/i.test(trimmedBaseUrl)) {
    return trimmedBaseUrl.replace(/\/api\/v\d+$/i, '');
  }

  if (/\/api$/i.test(trimmedBaseUrl)) {
    return trimmedBaseUrl.replace(/\/api$/i, '');
  }

  return trimmedBaseUrl;
};

const splitPathAndQuery = (value: string): { path: string; query: string } => {
  const queryStartIndex = value.indexOf('?');
  if (queryStartIndex === -1) {
    return { path: value, query: '' };
  }

  return {
    path: value.slice(0, queryStartIndex),
    query: value.slice(queryStartIndex),
  };
};

const isAbsoluteUrl = (value: string): boolean => {
  return /^https?:\/\//i.test(value);
};

const ensureLeadingSlash = (value: string): string => {
  return value.startsWith('/') ? value : `/${value}`;
};

const isAlreadyVersionedPath = (value: string): boolean => {
  return /^\/?api\/v\d+\//i.test(value) || /^\/?api\/v\d+$/i.test(value);
};

export const resolveApiOrigin = (): string => {
  const configuredBaseUrl =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    '';

  const normalizedOrigin = stripApiSuffix(configuredBaseUrl);
  if (!normalizedOrigin) {
    throw new Error(
      'API base URL is not defined. Set API_BASE_URL or NEXT_PUBLIC_API_BASE_URL in environment variables.'
    );
  }

  return normalizedOrigin;
};

export const resolveVersionedApiPath = (inputPath: string): string => {
  const trimmedInput = (inputPath || '').trim();
  if (!trimmedInput) {
    return `/api/${resolveDefaultApiVersion()}`;
  }

  if (isAbsoluteUrl(trimmedInput)) {
    return trimmedInput;
  }

  const { path, query } = splitPathAndQuery(trimmedInput);
  const normalizedPath = ensureLeadingSlash(path.trim());

  if (isAlreadyVersionedPath(normalizedPath)) {
    return `${normalizedPath}${query}`;
  }

  const noLeadingSlashPath = normalizedPath.replace(/^\/+/, '');
  if (
    /^v\d+\//i.test(noLeadingSlashPath) ||
    /^v\d+$/i.test(noLeadingSlashPath)
  ) {
    return `/api/${noLeadingSlashPath}${query}`;
  }

  const segments = noLeadingSlashPath.split('/').filter(Boolean);
  if (segments.length === 0) {
    return `/api/${resolveDefaultApiVersion()}${query}`;
  }

  const service = segments[0].toLowerCase();
  const serviceVersionMap = resolveServiceVersionMap();
  const apiVersion = serviceVersionMap[service] || resolveDefaultApiVersion();

  return `/api/${apiVersion}/${segments.join('/')}${query}`;
};

export const buildServerApiUrl = (inputPath: string): string => {
  const versionedPath = resolveVersionedApiPath(inputPath);
  if (isAbsoluteUrl(versionedPath)) {
    return versionedPath;
  }

  return `${resolveApiOrigin()}${versionedPath}`;
};

export const buildBrowserApiUrl = (inputPath: string): string => {
  const versionedPath = resolveVersionedApiPath(inputPath);
  if (isAbsoluteUrl(versionedPath)) {
    return versionedPath;
  }

  return versionedPath;
};
