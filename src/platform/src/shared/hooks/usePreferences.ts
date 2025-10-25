import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from 'swr';
import { userService } from '../services/userService';
import { preferencesService } from '../services/preferencesService';
import type {
  UpdatePreferencesRequest,
  UpdateUserPreferencesRequest,
  UpdateUserThemeRequest,
} from '../types/api';

// Authenticated preferences update
export const useUpdatePreferences = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'preferences/update',
    async (key, { arg }: { arg: UpdatePreferencesRequest }) => {
      return await userService.updatePreferencesAuthenticated(arg);
    },
    {
      onSuccess: () => {
        mutate(key => typeof key === 'string' && key.startsWith('user/'));
      },
    }
  );
};

// Token-based preferences update
export const useUpdatePreferencesWithToken = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'preferences/update/token',
    async (key, { arg }: { arg: UpdatePreferencesRequest }) => {
      return await userService.updatePreferencesWithToken(arg);
    },
    {
      onSuccess: () => {
        mutate(key => typeof key === 'string' && key.startsWith('user/'));
      },
    }
  );
};

// Get user preferences
export const useUserPreferences = (userId: string, groupId: string) => {
  return useSWR(
    userId && groupId ? `preferences/${userId}/${groupId}` : null,
    () => preferencesService.getUserRecentPreferences(userId, groupId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // Ensure fresh data when group changes - prevent stale data issues
      dedupingInterval: 0,
      // Keep error retry to minimum to avoid infinite loops on group switch
      errorRetryCount: 1,
      errorRetryInterval: 1000,
      // Use a custom comparison to detect if we should actually update
      // This prevents unnecessary re-renders while still ensuring fresh data
      compare: (a, b) => {
        // If either is null/undefined, they're different
        if (!a || !b) return a === b;
        // Compare the actual preference data, not the wrapper
        return JSON.stringify(a?.preference) === JSON.stringify(b?.preference);
      },
    }
  );
};

// Get user preferences list for a specific group
export const useUserPreferencesList = (userId: string, groupId: string) => {
  return useSWR(
    userId && groupId ? `preferences/list/${userId}/${groupId}` : null,
    () => preferencesService.getUserPreferencesList(userId, groupId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // Ensure fresh data when group changes
      dedupingInterval: 0,
      // Keep error retry to minimum to avoid infinite loops on group switch
      errorRetryCount: 1,
      errorRetryInterval: 1000,
    }
  );
};

// Update user preferences
export const useUpdateUserPreferences = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'preferences/update',
    async (key, { arg }: { arg: UpdateUserPreferencesRequest }) => {
      return await preferencesService.updateUserPreferences(arg);
    },
    {
      onSuccess: () => {
        // Invalidate all preferences cache
        mutate(
          key => typeof key === 'string' && key.startsWith('preferences/')
        );
      },
    }
  );
};

// Update user theme
export const useUpdateUserTheme = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    'preferences/theme/update',
    async (
      key,
      {
        arg,
      }: {
        arg: { userId: string; groupId: string; theme: UpdateUserThemeRequest };
      }
    ) => {
      return await preferencesService.updateUserTheme(
        arg.userId,
        arg.groupId,
        arg.theme
      );
    },
    {
      onSuccess: () => {
        // Invalidate theme cache
        mutate(
          key => typeof key === 'string' && key.startsWith('preferences/theme/')
        );
      },
    }
  );
};

// Get group theme
export const useGroupTheme = (groupId: string) => {
  return useSWR(
    groupId ? `preferences/theme/group/${groupId}` : null,
    () => preferencesService.getGroupTheme(groupId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
};

// Get user theme based on active group
export const useUserTheme = (userId: string, groupId: string) => {
  return useSWR(
    userId && groupId
      ? `preferences/theme/user/${userId}/group/${groupId}`
      : null,
    () => preferencesService.getUserTheme(userId, groupId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // Ensure fresh data when group changes
      dedupingInterval: 0,
      // Keep error retry to minimum to avoid infinite loops on group switch
      errorRetryCount: 1,
      errorRetryInterval: 1000,
    }
  );
};
