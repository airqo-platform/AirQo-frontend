import axios from 'axios';

// Cache for storing GET request responses
const cache: Map<string, any> = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Function to handle API errors
export const handleApiError = (error: any) => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      console.error(
        `API Error: ${error.response.status} - ${error.response.statusText}`,
        error.response.data,
      );
    } else if (error.request) {
      console.error('API Error: No response received', error.request);
    } else {
      console.error('API Error:', error.message);
    }
  } else {
    console.error('Unexpected Error:', error);
  }
};

// Function to handle caching
export const getCachedData = (key: string) => {
  const cached = cache.get(key);
  if (cached) {
    const isExpired = Date.now() - cached.timestamp > CACHE_DURATION;
    if (!isExpired) {
      return cached.data;
    }
    cache.delete(key);
  }
  return null;
};

// Set cache data
export const setCachedData = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() });
};
