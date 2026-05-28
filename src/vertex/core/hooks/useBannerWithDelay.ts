import { useEffect, useRef } from 'react';
import { useBanner, type ShowBannerOptions } from '@/context/banner-context';
import { AFTER_DIALOG_CLOSE_MS } from '@/core/constants/ui';

export const useBannerWithDelay = () => {
  const { showBanner } = useBanner();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showBannerWithDelay = (options: ShowBannerOptions, delay: number = AFTER_DIALOG_CLOSE_MS) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      showBanner(options);
    }, delay);
  };

  return { showBannerWithDelay };
};
