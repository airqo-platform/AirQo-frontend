'use client';

import { useState, useEffect } from 'react';
import { getEnvironmentAwareUrl } from '@/shared/utils/url';

/**
 * Returns the environment-aware URL but defers the rewrite until after mount
 * to avoid SSR/client hydration mismatches. During SSR and the initial client
 * render the raw `baseUrl` is returned; once mounted the staging/localhost
 * variant is swapped in.
 */
export function useEnvironmentAwareUrl(baseUrl: string): string {
  const [url, setUrl] = useState(baseUrl);

  useEffect(() => {
    setUrl(getEnvironmentAwareUrl(baseUrl));
  }, [baseUrl]);

  return url;
}
