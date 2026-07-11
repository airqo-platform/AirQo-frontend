import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useSWRConfig } from 'swr';
import { selfieService } from '@/shared/services/selfieService';
import type { GetSelfiesResponse, Selfie } from '@/shared/types/api';

const SWR_KEY_PREFIX = 'system/selfies';

// Get selfies for an event
export const useSelfies = (eventId: string) => {
  return useSWR(
    eventId ? `${SWR_KEY_PREFIX}?eventId=${eventId}` : null,
    () => selfieService.getSelfies(eventId),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );
};

// Hide a selfie (reversible) with optimistic update
export const useHideSelfie = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    `${SWR_KEY_PREFIX}/hide`,
    async (
      key,
      {
        arg,
      }: {
        arg: { id: string; eventId: string };
      }
    ) => {
      // Optimistically mark as hidden in the local cache
      await mutate(
        `${SWR_KEY_PREFIX}?eventId=${arg.eventId}`,
        (current: GetSelfiesResponse | undefined) => {
          if (!current) return current;
          return {
            ...current,
            selfies: current.selfies.map((s: Selfie) =>
              s._id === arg.id ? { ...s, hidden: true } : s
            ),
          };
        },
        { revalidate: false }
      );

      try {
        const result = await selfieService.hideSelfie(arg.id);
        // Revalidate to sync with server
        await mutate(`${SWR_KEY_PREFIX}?eventId=${arg.eventId}`);
        return result;
      } catch (err) {
        // Revert optimistic update on failure
        await mutate(`${SWR_KEY_PREFIX}?eventId=${arg.eventId}`);
        throw err;
      }
    }
  );
};

// Unhide a selfie with optimistic update
export const useUnhideSelfie = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    `${SWR_KEY_PREFIX}/unhide`,
    async (
      key,
      {
        arg,
      }: {
        arg: { id: string; eventId: string };
      }
    ) => {
      // Optimistically mark as visible in the local cache
      await mutate(
        `${SWR_KEY_PREFIX}?eventId=${arg.eventId}`,
        (current: GetSelfiesResponse | undefined) => {
          if (!current) return current;
          return {
            ...current,
            selfies: current.selfies.map((s: Selfie) =>
              s._id === arg.id ? { ...s, hidden: false } : s
            ),
          };
        },
        { revalidate: false }
      );

      try {
        const result = await selfieService.unhideSelfie(arg.id);
        await mutate(`${SWR_KEY_PREFIX}?eventId=${arg.eventId}`);
        return result;
      } catch (err) {
        await mutate(`${SWR_KEY_PREFIX}?eventId=${arg.eventId}`);
        throw err;
      }
    }
  );
};

// Delete a selfie (permanent) with optimistic update
export const useDeleteSelfie = () => {
  const { mutate } = useSWRConfig();

  return useSWRMutation(
    `${SWR_KEY_PREFIX}/delete`,
    async (
      key,
      {
        arg,
      }: {
        arg: { id: string; eventId: string };
      }
    ) => {
      // Optimistically remove from local cache
      await mutate(
        `${SWR_KEY_PREFIX}?eventId=${arg.eventId}`,
        (current: GetSelfiesResponse | undefined) => {
          if (!current) return current;
          return {
            ...current,
            selfies: current.selfies.filter((s: Selfie) => s._id !== arg.id),
            total: current.total - 1,
          };
        },
        { revalidate: false }
      );

      try {
        const result = await selfieService.deleteSelfie(arg.id);
        await mutate(`${SWR_KEY_PREFIX}?eventId=${arg.eventId}`);
        return result;
      } catch (err) {
        await mutate(`${SWR_KEY_PREFIX}?eventId=${arg.eventId}`);
        throw err;
      }
    }
  );
};
