'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { defaultInstalledAppIds } from '@airqo/app-store-modules';

const STORAGE_KEY = 'airqo-installed-apps';

const readInstalled = (): string[] => {
  if (typeof window === 'undefined') return [...defaultInstalledAppIds];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [...defaultInstalledAppIds];
  try {
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [...defaultInstalledAppIds];
  } catch {
    return [...defaultInstalledAppIds];
  }
};

const writeInstalled = (ids: string[]) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

export function useInstalledApps() {
  const [installedIds, setInstalledIds] = useState<string[]>([]);

  useEffect(() => {
    setInstalledIds(readInstalled());
  }, []);

  const install = useCallback((id: string) => {
    setInstalledIds(current => {
      if (current.includes(id)) return current;
      const next = [...current, id];
      writeInstalled(next);
      return next;
    });
  }, []);

  const uninstall = useCallback((id: string) => {
    setInstalledIds(current => {
      const next = current.filter(item => item !== id);
      writeInstalled(next);
      return next;
    });
  }, []);

  const isInstalled = useCallback(
    (id: string) => installedIds.includes(id),
    [installedIds]
  );

  return useMemo(
    () => ({ installedIds, install, uninstall, isInstalled }),
    [installedIds, install, uninstall, isInstalled]
  );
}
