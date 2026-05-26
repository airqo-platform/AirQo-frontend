import { useEffect, useRef } from 'react';
import { useBanner, type ShowBannerOptions } from '@/context/banner-context';
import { AFTER_DIALOG_CLOSE_MS } from '@/core/constants/ui';

export const useDeferredBanner = () => {
  const { showBanner } = useBanner();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showDeferredBanner = (options: ShowBannerOptions) => {
    timerRef.current = setTimeout(() => {
      showBanner(options);
    }, AFTER_DIALOG_CLOSE_MS);
  };

  return { showDeferredBanner };
};
