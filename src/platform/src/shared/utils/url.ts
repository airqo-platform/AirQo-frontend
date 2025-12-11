export const getEnvironmentAwareUrl = (baseUrl: string): string => {
  const appEnv = process.env.NEXT_PUBLIC_ALLOW_DEV_TOOLS;
  if (appEnv === 'staging') {
    try {
      const url = new URL(baseUrl);
      url.hostname = `staging-${url.hostname}`;
      return url.toString();
    } catch {
      return baseUrl;
    }
  }
  return baseUrl;
};
