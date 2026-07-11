export const normalizeCallbackUrl = (
  callbackUrl: string | null | undefined
): string | null => {
  if (!callbackUrl) return null;

  const fallbackOrigin = 'http://localhost';
  const currentOrigin =
    typeof window !== 'undefined' ? window.location.origin : fallbackOrigin;

  try {
    const url = new URL(callbackUrl, currentOrigin);

    if (url.origin !== currentOrigin) {
      return null;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return callbackUrl.startsWith('/') ? callbackUrl : null;
  }
};

export const redirectWithReload = (targetUrl: string): void => {
  if (typeof window === 'undefined' || !targetUrl) {
    return;
  }

  window.location.replace(targetUrl);
};
