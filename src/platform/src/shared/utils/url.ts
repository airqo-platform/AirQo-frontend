export const getEnvironmentAwareUrl = (baseUrl: string): string => {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) return baseUrl;
  try {
    const url = new URL(baseUrl);
    url.hostname = `staging-${url.hostname}`;
    return url.toString();
  } catch {
    return baseUrl;
  }
};
