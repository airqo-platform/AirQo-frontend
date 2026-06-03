import { useBanner } from '@/context/banner-context';

export const useClipboard = () => {
  const { showBanner } = useBanner();

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showBanner({ severity: 'success', message: 'Copied', scoped: false });
    } catch {
      showBanner({ severity: 'error', message: 'Failed to copy', scoped: false });
    }
  };

  return { handleCopy };
};
