import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import StepProgress from './components/StepProgress';
import ChecklistStepCard from './components/ChecklistStepCard';
import ChecklistSkeleton from './components/ChecklistSkeleton';
import VideoModal from './components/VideoModal';
import { createSteps, mergeStepsWithChecklist } from './utils/steps';
import {
  useChecklist,
  useInitializeChecklist,
  useChecklistActions,
} from './hooks';
import type { ChecklistStepItem } from './types';

interface ChecklistProps {
  openVideoModal?: () => void;
  isAnalyticsModalOpen?: boolean;
  onCloseAnalyticsModal?: () => void;
}

const Checklist = ({
  openVideoModal,
  isAnalyticsModalOpen,
  onCloseAnalyticsModal,
}: ChecklistProps) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [videoStepId, setVideoStepId] = useState<number | null>(null);
  const { data: session } = useSession();

  // Get user ID from NextAuth session when component mounts
  useEffect(() => {
    if (session?.user) {
      const user = session.user as unknown as {
        id?: string;
        _id?: string;
        userId?: string;
      };
      if (user.id) {
        setUserId(user.id);
      } else if (user._id) {
        setUserId(user._id);
      } else if (user.userId) {
        setUserId(user.userId);
      }
    } else {
      // Clear user ID and reset initialization state when user logs out
      setUserId(null);
      setInitializationCompleted(false);
      if (typeof window !== 'undefined') {
        // Clear all checklist initialization states on logout
        const keys = Object.keys(localStorage).filter(key =>
          key.startsWith('checklist_initialized_')
        );
        keys.forEach(key => localStorage.removeItem(key));
      }
    }
  }, [session]);

  // Get checklist data
  const {
    checklist,
    checklistItems,
    isLoading,
    needsInitialization,
    refetch,
    setInitializationAttempted,
    resetInitializationAttempted,
    hasData,
    hasValidItems,
  } = useChecklist(userId);

  // Use the checklist's user_id for updates, fallback to session user_id
  const checklistUserId = checklist?.user_id || userId;

  // Initialize checklist for new users
  const { initializeChecklist, isInitializing: isInitializingHook } =
    useInitializeChecklist();

  // Actions for updating checklist items
  const { markStepCompleted, markStepInProgress, updateVideoProgress } =
    useChecklistActions();

  const totalSteps = 4;

  // Create static steps - use useMemo to avoid recreating on each render
  const staticSteps = useMemo(() => createSteps(), []);

  // Handle initialization for first-time users with proper state tracking
  const [isInitializingLocal, setIsInitializingLocal] = useState(false);
  const [initializationCompleted, setInitializationCompleted] = useState(() => {
    // Check localStorage for initialization state to persist across page reloads
    if (typeof window !== 'undefined' && userId) {
      const stored = localStorage.getItem(`checklist_initialized_${userId}`);
      return stored === 'true';
    }
    return false;
  });

  useEffect(() => {
    let isMounted = true;

    const handleInitialization = async () => {
      // Only initialize if we truly need to (no data at all, not just missing IDs)
      // Don't initialize if we have checklist items with meaningful progress
      const hasMeaningfulData =
        checklistItems.length > 0 &&
        checklistItems.some(
          item =>
            item.completed ||
            item.status === 'in progress' ||
            item.videoProgress > 0
        );

      const shouldInitialize =
        needsInitialization && !initializationCompleted && !hasMeaningfulData;

      if (
        shouldInitialize &&
        userId &&
        !isInitializingLocal &&
        !isInitializingHook
      ) {
        try {
          setIsInitializingLocal(true);
          // Don't set initializationAttempted until we succeed

          await initializeChecklist(userId);

          if (isMounted) {
            // Mark initialization as attempted and completed
            setInitializationAttempted(true);
            setInitializationCompleted(true);
            // Persist initialization state to localStorage
            if (typeof window !== 'undefined' && userId) {
              localStorage.setItem(`checklist_initialized_${userId}`, 'true');
            }
            // Force refetch to get the updated data with IDs
            await refetch();
            setIsInitializingLocal(false);
          }
        } catch (error) {
          console.error('Failed to initialize checklist', {
            userId,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
          // Don't mark as attempted if it failed - allow retries
          if (isMounted) {
            setInitializationCompleted(false);
            setIsInitializingLocal(false);
          }
        }
      }
    };

    handleInitialization();

    return () => {
      isMounted = false;
    };
  }, [
    needsInitialization,
    hasData,
    hasValidItems,
    checklistItems,
    userId,
    isInitializingLocal,
    isInitializingHook,
    initializationCompleted,
    initializeChecklist,
    refetch,
    setInitializationAttempted,
    resetInitializationAttempted,
  ]);

  // Merge static steps with API data
  const mergedSteps = useMemo(() => {
    const safeChecklist = Array.isArray(checklistItems) ? checklistItems : [];

    const merged = mergeStepsWithChecklist(staticSteps, safeChecklist);

    return merged;
  }, [staticSteps, checklistItems]);

  // Calculate completed steps count from merged steps
  const stepCount = useMemo(() => {
    return mergedSteps.filter(item => item.completed).length;
  }, [mergedSteps]);

  // Check if all steps are completed
  const allCompleted = useMemo(() => {
    return stepCount === totalSteps && stepCount > 0;
  }, [stepCount, totalSteps]);

  const handleStepClick = useCallback(
    async (stepItem: ChecklistStepItem) => {
      if (!checklistUserId) {
        console.warn('Cannot update step: missing checklist user ID', {
          stepId: stepItem.id,
          sessionUserId: userId,
          checklistUserId,
        });
        return;
      }

      // Extract item index from the generated ID (format: "item-{index}")
      const itemIndex = stepItem.id - 1; // Convert 1-based step ID to 0-based array index

      if (itemIndex < 0 || itemIndex >= checklistItems.length) {
        console.warn('Cannot update step: invalid item index', {
          stepId: stepItem.id,
          itemIndex,
          checklistItemsLength: checklistItems.length,
        });
        return;
      }

      try {
        // For step ID 4, directly mark as completed if not already completed
        if (stepItem.id === 4 && !stepItem.completed) {
          await markStepCompleted(checklistUserId, itemIndex, checklistItems);
          await refetch();
          return;
        }

        // For step ID 1 (video step), open the video modal
        if (stepItem.id === 1) {
          setIsVideoModalOpen(true);
          setVideoStepId(itemIndex);
          // Call the external openVideoModal if provided (for backward compatibility)
          openVideoModal?.();

          // If the step is "not started", update its status to "in progress"
          if (stepItem.status === 'not started') {
            await markStepInProgress(
              checklistUserId,
              itemIndex,
              checklistItems
            );
            await refetch();
          }
        } else if (stepItem.status === 'not started') {
          // For other new steps, mark as in progress
          await markStepInProgress(checklistUserId, itemIndex, checklistItems);
          await refetch();
        }
      } catch (error) {
        console.error('Error updating task:', {
          userId,
          stepId: stepItem.id,
          itemIndex,
          error: error instanceof Error ? error.message : 'Unknown error',
        });

        // If there's an error updating the task, try to refresh the checklist data
        try {
          await refetch();
        } catch (refreshError) {
          console.error(
            'Failed to refresh checklist after error:',
            refreshError
          );
        }
      }
    },
    [
      checklistUserId,
      userId,
      markStepCompleted,
      markStepInProgress,
      openVideoModal,
      refetch,
      checklistItems,
    ]
  );

  // Video modal handlers
  const handleCloseVideoModal = useCallback(() => {
    // VideoModal already saves progress on close, so just close the modal
    setIsVideoModalOpen(false);
    setVideoStepId(null);
  }, []);

  const handleVideoProgress = useCallback(
    async (progress: number) => {
      if (
        !checklistUserId ||
        videoStepId === null ||
        videoStepId === undefined
      ) {
        return;
      }

      try {
        await updateVideoProgress(
          checklistUserId,
          videoStepId,
          progress,
          checklistItems
        );
        await refetch();
      } catch (error) {
        console.error('Failed to update video progress:', error);
      }
    },
    [checklistUserId, videoStepId, updateVideoProgress, checklistItems, refetch]
  );

  const handleVideoComplete = useCallback(async () => {
    if (!checklistUserId || !videoStepId) return;

    try {
      await markStepCompleted(checklistUserId, videoStepId, checklistItems);
      await refetch();
      // Close modal after marking complete
      handleCloseVideoModal();
    } catch (error) {
      console.error('Failed to mark video step as completed:', error);
    }
  }, [
    checklistUserId,
    videoStepId,
    markStepCompleted,
    checklistItems,
    refetch,
    handleCloseVideoModal,
  ]);

  const handleVideoPause = useCallback(async () => {
    // Save progress when video is paused (backup to VideoModal's pause handler)
    if (checklistUserId && videoStepId !== null && videoStepId !== undefined) {
      try {
        // Get current progress from the video modal (this is a bit tricky since we don't have direct access)
        // For now, just log that pause occurred - the VideoModal handles the actual progress saving
      } catch (error) {
        console.error('Failed to save progress on pause:', error);
      }
    }
  }, [checklistUserId, videoStepId]);

  // Find analytics item (step 1)
  const analyticsItem = useMemo(() => {
    const item = mergedSteps.find(item => item.id === 1);
    return item;
  }, [mergedSteps]);

  const handleAnalyticsProgress = useCallback(
    async (progress: number) => {
      if (!checklistUserId || !analyticsItem) {
        return;
      }

      // Extract item index from step ID (analytics is step 1, so index 0)
      const itemIndex = analyticsItem.id - 1;
      if (itemIndex < 0 || itemIndex >= checklistItems.length) return;

      try {
        await updateVideoProgress(
          checklistUserId,
          itemIndex,
          progress,
          checklistItems
        );
        await refetch();
      } catch (error) {
        console.error('Failed to update analytics video progress:', error);
      }
    },
    [
      checklistUserId,
      analyticsItem,
      updateVideoProgress,
      checklistItems,
      refetch,
    ]
  );

  const handleAnalyticsComplete = useCallback(async () => {
    if (!checklistUserId || !analyticsItem) return;

    // Extract item index from step ID (analytics is step 1, so index 0)
    const itemIndex = analyticsItem.id - 1;
    if (itemIndex < 0 || itemIndex >= checklistItems.length) return;

    try {
      await markStepCompleted(checklistUserId, itemIndex, checklistItems);
    } catch (error) {
      console.error('Failed to mark analytics video as completed:', error);
    }
  }, [checklistUserId, analyticsItem, markStepCompleted, checklistItems]);

  // Show loading skeleton when data is loading or initialization is in progress
  // Use loading states from hooks for proper state management
  const isLoadingState = isLoading || isInitializingHook || isInitializingLocal;

  if (isLoadingState && !hasData) {
    return <ChecklistSkeleton />;
  }

  return (
    <div>
      {/* Header Section */}
      <div className="flex flex-row justify-between items-center md:items-center mb-4">
        <div className="w-full md:w-1/2 flex flex-col">
          <h2 className="text-xl md:text-2xl font-medium text-foreground">
            Onboarding Checklist
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            {allCompleted
              ? 'Great job! You have completed all onboarding steps.'
              : 'Continue with your onboarding journey.'}
          </p>
        </div>
        <div className="w-full md:w-1/2 mt-4 md:mt-0">
          <StepProgress step={stepCount} totalSteps={totalSteps} />
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {mergedSteps.map(stepItem => (
          <ChecklistStepCard
            key={`step-${stepItem.id}-${stepItem._id || 'new'}`}
            stepItem={stepItem}
            onClick={handleStepClick}
          />
        ))}
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={handleCloseVideoModal}
        onVideoProgress={handleVideoProgress}
        onVideoComplete={handleVideoComplete}
        onVideoPause={handleVideoPause}
      />

      {/* Analytics Video Modal */}
      {isAnalyticsModalOpen && (
        <VideoModal
          isOpen={isAnalyticsModalOpen}
          onClose={onCloseAnalyticsModal || (() => {})}
          onVideoProgress={handleAnalyticsProgress}
          onVideoComplete={handleAnalyticsComplete}
        />
      )}
    </div>
  );
};

export default Checklist;
