import { stripTrailingSlash } from './utils';

export const getApiBaseUrl = (): string => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_API_URL environment variable is not defined');
  }
  return stripTrailingSlash(apiUrl);
};

export const getEnvConfig = () => {
  return {
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    environment: process.env.NEXT_PUBLIC_ENV || 'development',
  };
};