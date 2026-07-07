'use client';

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';
import { getPageTitle, capitalizeTitle } from '../config/pageTitles';

export const usePageTitle = () => {
  const pathname = usePathname();

  const title = useMemo(() => {
    const rawTitle = getPageTitle(pathname);
    return capitalizeTitle(rawTitle);
  }, [pathname]);

  return title;
};
