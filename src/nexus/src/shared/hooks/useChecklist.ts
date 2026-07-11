import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from 'swr';
import { checklistService } from '../services/checklistService';
import type {
  GetUserChecklistResponse,
  UserChecklist,
  UpdateUserChecklistRequest,
} from '../types/api';

type ChecklistLikePayload = Partial<GetUserChecklistResponse> & {
  checklist?: UserChecklist;
  data?: {
    checklist?: UserChecklist;
    checklists?: UserChecklist[];
  };
};

const resolveChecklistFromPayload = (
  payload: unknown
): UserChecklist | undefined => {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const candidate = payload as ChecklistLikePayload;

  if (candidate.checklist && typeof candidate.checklist === 'object') {
    return candidate.checklist;
  }

  if (Array.isArray(candidate.checklists) && candidate.checklists.length > 0) {
    return candidate.checklists[0];
  }

  if (
    candidate.data?.checklist &&
    typeof candidate.data.checklist === 'object'
  ) {
    return candidate.data.checklist;
  }

  if (
    Array.isArray(candidate.data?.checklists) &&
    candidate.data.checklists.length > 0
  ) {
    return candidate.data.checklists[0];
  }

  return undefined;
};

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
      revalidateIfStale: false,
      focusThrottleInterval: 10000,
      errorRetryCount: 1,
      errorRetryInterval: 1000,
      shouldRetryOnError: error => {
        const status = (error as { response?: { status?: number } })?.response
          ?.status;

        // Avoid noisy retries on auth/permission errors.
        if (status === 401 || status === 403 || status === 404) {
          return false;
        }

        return true;
      },
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
        const checklist = resolveChecklistFromPayload(data);

        if (checklist?.user_id) {
          mutate(
            key =>
              typeof key === 'string' &&
              key.startsWith(`checklist/${checklist.user_id}`)
          );
        } else {
          mutate(
            key => typeof key === 'string' && key.startsWith('checklist/')
          );
        }
      },
    }
  );
};
