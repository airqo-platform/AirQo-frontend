const DEFAULT_API_VERSION_FALLBACK = 'v2';

const parseServiceVersionMap = (
  rawValue: string | undefined
): Record<string, string> => {
  if (!rawValue) {
    return {};
  }

  return rawValue
    .split(',')
    .map(entry => entry.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, entry) => {
      const [rawService, rawVersion] = entry
        .split(':')
        .map(part => part.trim());
      if (!rawService || !rawVersion) {
        return acc;
      }

      const service = rawService.toLowerCase();
      const normalizedVersion = normalizeApiVersion(rawVersion);
      if (!normalizedVersion) {
        return acc;
      }

      acc[service] = normalizedVersion;
      return acc;
    }, {});
};

const normalizeApiVersion = (value: string | undefined): string => {
  if (!value) {
    return '';
  }

  const trimmedValue = value.trim().toLowerCase();
  if (!trimmedValue) {
    return '';
  }

  if (/^v\d+$/.test(trimmedValue)) {
    return trimmedValue;
  }

  if (/^\d+$/.test(trimmedValue)) {
    return `v${trimmedValue}`;
  }

  return '';
};

const resolveDefaultApiVersion = (): string => {
  const configuredVersion = normalizeApiVersion(
    process.env.NEXT_PUBLIC_API_DEFAULT_VERSION ||
      process.env.API_DEFAULT_VERSION ||
      DEFAULT_API_VERSION_FALLBACK
  );

  return configuredVersion || DEFAULT_API_VERSION_FALLBACK;
};

const resolveServiceVersionMap = (): Record<string, string> => {
  const mergedMap: Record<string, string> = {};

  const envMap = parseServiceVersionMap(
    process.env.NEXT_PUBLIC_API_SERVICE_VERSIONS ||
      process.env.API_SERVICE_VERSIONS
  );

  Object.entries(envMap).forEach(([service, version]) => {
    mergedMap[service] = version;
  });

  const usersVersion = normalizeApiVersion(
    process.env.NEXT_PUBLIC_API_USERS_VERSION || process.env.API_USERS_VERSION
  );
  if (usersVersion) {
    mergedMap.users = usersVersion;
  }

  return mergedMap;
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
    process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';

  const normalizedOrigin = stripApiSuffix(configuredBaseUrl);
  if (!normalizedOrigin) {
    throw new Error('API_BASE_URL is not defined in environment variables');
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
