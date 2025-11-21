import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from 'swr';
import { checklistService } from '../services/checklistService';
import type {
  GetUserChecklistResponse,
  UpdateUserChecklistRequest,
} from '../types/api';

// User Checklist fetcher
const userChecklistFetcher = async (
  userId: string
): Promise<GetUserChecklistResponse> => {
  return await checklistService.getUserChecklist(userId);
};

// Get user checklist hook
export const useUserChecklist = (userId: string | null) => {
  return useSWR<GetUserChecklistResponse>(
    userId ? `checklist/${userId}` : null,
    userId ? () => userChecklistFetcher(userId) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 5000,
      // Add persistence across page reloads
      revalidateIfStale: false,
      // Keep data fresh for longer
      focusThrottleInterval: 10000,
    }
  );
};

// Update user checklist mutation
export const useUpdateUserChecklist = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'checklist/update',
    async (key, { arg }: { arg: UpdateUserChecklistRequest }) => {
      return await checklistService.updateUserChecklist(arg);
    },
    {
      onSuccess: data => {
        // Invalidate checklist cache for the user
        if (data && data.checklist && data.checklist.user_id) {
          mutate(
            key =>
              typeof key === 'string' &&
              key.startsWith(`checklist/${data.checklist.user_id}`)
          );
        } else {
          // Fallback: invalidate all checklist-related cache
          mutate(
            key => typeof key === 'string' && key.startsWith('checklist/')
          );
        }
      },
    }
  );
};
