import { useState, useCallback } from 'react';
import {
  useUserChecklist,
  useUpdateUserChecklist,
} from '../../../shared/hooks';
import { useUser } from '@/shared/hooks/useUser';
import { createSteps } from '../utils/steps';
import type { UpdateChecklistItem } from '../types';
import { initializeChecklistTemplate } from '../utils';

export const useChecklist = (userId: string | null) => {
  const { data, error, isLoading, mutate } = useUserChecklist(userId);
  const [initializationAttempted, setInitializationAttempted] = useState(false);

  // Extract checklist from data
  const checklist = data?.checklists?.[0] || null;
  const checklistItems = checklist?.items || [];

  // Check if checklist is empty and needs initialization
  // We need initialization when:
  // 1. Not loading
  // 2. We have a userId
  // 3. We haven't already attempted initialization
  // 4. AND either:
  //    - No data at all (API failed or returned unexpected structure)
  //    - API succeeded but checklists array is empty or invalid
  //    - API failed with 404 (user doesn't have checklist yet)
  const needsInitialization =
    !isLoading &&
    userId &&
    !initializationAttempted &&
    (!data || // No data at all
      (data.success === true &&
        (!Array.isArray(data.checklists) || data.checklists.length === 0)) || // Success but empty/invalid checklists
      (error &&
        (error.message?.includes('404') ||
          error.message?.includes('Not Found')))); // API endpoint doesn't exist for new user

  // Check if we have valid checklist items (just need items to exist, not individual _id fields)
  const hasValidItems = checklistItems.length > 0;

  return {
    checklist,
    checklistItems,
    isLoading,
    error,
    needsInitialization,
    refetch: mutate,
    setInitializationAttempted,
    resetInitializationAttempted: () => setInitializationAttempted(false),
    hasData: !!data,
    hasValidItems,
  };
};

export const useUpdateChecklist = () => {
  const { trigger, isMutating, error } = useUpdateUserChecklist();

  const updateChecklist = useCallback(
    async (userId: string, items: UpdateChecklistItem[]) => {
      try {
        return await trigger({
          user_id: userId,
          items,
        });
      } catch (err) {
        console.error('Failed to update checklist:', err);
        throw err;
      }
    },
    [trigger]
  );

  return {
    updateChecklist,
    isUpdating: isMutating,
    error,
  };
};

export const useInitializeChecklist = () => {
  const { updateChecklist, isUpdating, error } = useUpdateChecklist();
  const [isInitializing, setIsInitializing] = useState(false);

  const initializeChecklist = useCallback(
    async (userId: string) => {
      if (!userId) {
        throw new Error('User ID is required for initialization');
      }

      setIsInitializing(true);

      try {
        const template = initializeChecklistTemplate();

        // For initialization, create items without _id since they're new
        // The API should generate IDs for new items
        const templateItems: UpdateChecklistItem[] = template.map(item => ({
          title: item.title,
          completed: item.completed,
          status: item.status as
            | 'not started'
            | 'in progress'
            | 'completed'
            | 'started',
          videoProgress: item.videoProgress || 0,
          completionDate: item.completionDate,
        }));

        const result = await updateChecklist(userId, templateItems);

        return result;
      } catch (err) {
        console.error('Failed to initialize checklist:', err);
        // For new users, API might fail initially - this is expected
        // We'll let the component handle this and retry if needed
        throw err;
      } finally {
        setIsInitializing(false);
      }
    },
    [updateChecklist]
  );

  return {
    initializeChecklist,
    isInitializing: isInitializing || isUpdating,
    error,
  };
};

export const useChecklistActions = () => {
  const { updateChecklist, isUpdating, error } = useUpdateChecklist();
  const staticSteps = createSteps();

  const updateSingleItem = useCallback(
    async (
      userId: string,
      itemIndex: number,
      updates: Partial<UpdateChecklistItem>,
      currentItems: UpdateChecklistItem[]
    ) => {
      if (!userId) {
        throw new Error('User ID is required');
      }

      if (typeof itemIndex !== 'number' || itemIndex < 0) {
        console.error('Cannot update step: invalid item index', {
          userId,
          itemIndex,
          updates,
          currentItemsLength: currentItems?.length || 0,
        });
        throw new Error('Valid item index is required for update.');
      }

      if (!Array.isArray(currentItems) || currentItems.length === 0) {
        throw new Error('Current checklist items are required for update');
      }

      if (itemIndex >= currentItems.length) {
        throw new Error(
          `Item index ${itemIndex} is out of bounds (length: ${currentItems.length})`
        );
      }

      // Create the updated items array - API expects items without _id fields
      const updatedItems = currentItems.map((item, index) => {
        // Get the proper title from static steps (step IDs are 1-based, array indices are 0-based)
        const staticStep = staticSteps[index];
        const properTitle = staticStep ? staticStep.title : item.title || '';

        if (index === itemIndex) {
          // Apply updates to the target item
          return {
            title: properTitle,
            completed:
              updates.completed !== undefined
                ? updates.completed
                : item.completed,
            status: updates.status || item.status,
            videoProgress:
              updates.videoProgress !== undefined
                ? updates.videoProgress
                : item.videoProgress || 0,
            completionDate:
              updates.completionDate !== undefined
                ? updates.completionDate
                : item.completionDate,
          } as UpdateChecklistItem;
        } else {
          // Keep other items unchanged (without _id for API)
          return {
            title: properTitle,
            completed: item.completed,
            status: item.status,
            videoProgress: item.videoProgress || 0,
            completionDate: item.completionDate,
          } as UpdateChecklistItem;
        }
      });

      return await updateChecklist(userId, updatedItems);
    },
    [updateChecklist, staticSteps]
  );

  const markStepCompleted = useCallback(
    async (
      userId: string,
      itemIndex: number,
      currentItems: UpdateChecklistItem[]
    ) => {
      return await updateSingleItem(
        userId,
        itemIndex,
        {
          completed: true,
          status: 'completed',
          completionDate: new Date().toISOString(),
        },
        currentItems
      );
    },
    [updateSingleItem]
  );

  const markStepInProgress = useCallback(
    async (
      userId: string,
      itemIndex: number,
      currentItems: UpdateChecklistItem[]
    ) => {
      return await updateSingleItem(
        userId,
        itemIndex,
        {
          status: 'in progress',
        },
        currentItems
      );
    },
    [updateSingleItem]
  );

  const updateVideoProgress = useCallback(
    async (
      userId: string,
      itemIndex: number,
      progress: number,
      currentItems: UpdateChecklistItem[]
    ) => {
      const updateData = {
        videoProgress: progress,
        status: (progress >= 100 ? 'completed' : 'in progress') as
          | 'completed'
          | 'in progress',
        completed: progress >= 100,
        completionDate: progress >= 100 ? new Date().toISOString() : undefined,
      };

      const result = await updateSingleItem(
        userId,
        itemIndex,
        updateData,
        currentItems
      );

      return result;
    },
    [updateSingleItem]
  );

  return {
    updateSingleItem,
    markStepCompleted,
    markStepInProgress,
    updateVideoProgress,
    isUpdating,
    error,
  };
};

// Integration hook for other modules
export const useChecklistIntegration = () => {
  const { markStepCompleted } = useChecklistActions();
  const { user } = useUser();
  const { checklistItems } = useChecklist(user?.id || null);

  const markLocationStepCompleted = useCallback(async () => {
    if (!user?.id || !checklistItems.length) {
      console.warn(
        'Cannot update location step: missing user ID or checklist items'
      );
      return;
    }

    try {
      // Step 2 is location selection (index 1)
      await markStepCompleted(user.id, 1, checklistItems);
    } catch (error) {
      console.error('Failed to mark location step as completed:', error);
      throw error;
    }
  }, [user?.id, checklistItems, markStepCompleted]);

  const markProfileStepCompleted = useCallback(async () => {
    if (!user?.id || !checklistItems.length) {
      console.warn(
        'Cannot update profile step: missing user ID or checklist items'
      );
      return;
    }

    try {
      // Step 3 is profile completion (index 2)
      await markStepCompleted(user.id, 2, checklistItems);
    } catch (error) {
      console.error('Failed to mark profile step as completed:', error);
      throw error;
    }
  }, [user?.id, checklistItems, markStepCompleted]);

  return {
    markLocationStepCompleted,
    markProfileStepCompleted,
  };
};
