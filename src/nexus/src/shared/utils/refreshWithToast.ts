import { toast } from '@/shared/components/ui';

export const refreshWithToast = async (
  action: () => Promise<unknown> | unknown,
  successMessage = 'Data refreshed successfully'
): Promise<void> => {
  await action();
  toast.success(successMessage);
};
