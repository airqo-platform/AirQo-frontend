'use client';

import { useSyncExternalStore } from 'react';

const subscribe = (onStoreChange: () => void) => {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  window.addEventListener('online', onStoreChange);
  window.addEventListener('offline', onStoreChange);

  return () => {
    window.removeEventListener('online', onStoreChange);
    window.removeEventListener('offline', onStoreChange);
  };
};

const getSnapshot = () => {
  if (typeof navigator === 'undefined') {
    return true;
  }

  return navigator.onLine;
};

const getServerSnapshot = () => true;

export const useNetworkStatus = () => {
  const isOnline = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  return {
    isOnline,
    isOffline: !isOnline,
    status: isOnline ? 'online' : 'offline',
  };
};
