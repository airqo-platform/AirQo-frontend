import { useBanner } from '@/context/banner-context';
import { toast } from '@/components/shared/toast/ReusableToast';

interface UseClipboardOptions {
  successMessage?: string;
  errorMessage?: string;
  scoped?: boolean;
}

export const useClipboard = (options?: UseClipboardOptions) => {
  const { showBanner } = useBanner();
  const {
    successMessage = 'Copied',
    errorMessage = 'Failed to copy',
    scoped = false,
  } = options ?? {};

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(successMessage);
    } catch {
      showBanner({ severity: 'error', message: errorMessage, scoped });
    }
  };

  return { handleCopy };
};
