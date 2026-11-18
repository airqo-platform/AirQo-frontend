import { queryOptions } from '@tanstack/react-query';
import { users } from '@/core/apis/users';
import type { UserDetailsResponse } from '@/app/types/users';

/**
 * The signed-in user's details, offline-first. There's deliberately no `refetchOnReconnect`:
 * `useConnectionRecovery` re-runs this query after a reconnect, once the app is confirmed reachable,
 * if it is stale or failed. Refetching on the browser's `online` event would run it before that check.
 */
export const userDetailsQueryOptions = (userId: string | null) =>
  queryOptions<UserDetailsResponse, Error>({
    queryKey: ['userDetails', userId],
    queryFn: () => users.getUserDetails(userId!),
    enabled: !!userId,
    networkMode: 'offlineFirst',
    retry: process.env.NODE_ENV === 'development' ? 0 : 1,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
