import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import {
  updateTaskProgress,
  fetchUserChecklists,
} from '@/lib/store/services/checklists/CheckList';
import logger from '@/lib/logger';

/**
 * Custom hook for managing checklist steps
 * @returns {Object} Hook methods and properties
 */
export const useChecklistSteps = () => {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const checklist = useSelector((state) => state.cardChecklist.checklist || []);
  const status = useSelector((state) => state.cardChecklist.status);

  // Get user ID from session first, fallback to Redux state
  const reduxUserInfo = useSelector((state) => state.login?.userInfo || {});
  const userId = session?.user?.id || reduxUserInfo?.id || reduxUserInfo?._id;

  /**
   * Completes a specific checklist step
   * @param {number} stepIndex - The index of the step to complete (0-based)
   * @returns {boolean} - Success status of the operation
   */
  const completeStep = async (stepIndex) => {
    try {
      if (
        typeof stepIndex !== 'number' ||
        !Array.isArray(checklist) ||
        stepIndex < 0 ||
        stepIndex >= checklist.length
      ) {
        logger.warn('Invalid step index for completion:', {
          stepIndex,
          checklistLength: checklist.length,
        });
        return false;
      }

      const step = checklist[stepIndex];

      if (!step || !step._id) {
        logger.warn('Step missing or has no _id:', { stepIndex, step });

        // Try to refresh checklist if step has no _id
        if (userId) {
          logger.info(
            'Attempting to refresh checklist for missing step _id...',
          );
          try {
            await dispatch(fetchUserChecklists(userId));
            return false; // Return false so caller can retry after refresh
          } catch (refreshError) {
            logger.error('Failed to refresh checklist:', refreshError);
          }
        }
        return false;
      }

      if (step.completed) {
        return true;
      }

      // Use the internally determined userId for the API update
      if (!userId) {
        logger.warn('No userId available for checklist step completion');
        return false;
      }

      const result = await dispatch(
        updateTaskProgress({
          _id: step._id,
          status: 'completed',
          completed: true,
          completionDate: new Date().toISOString(),
          userId: userId,
        }),
      );

      if (updateTaskProgress.fulfilled.match(result)) {
        logger.info('Step completed successfully:', {
          stepIndex,
          stepId: step._id,
        });
        return true;
      } else {
        logger.error('Failed to complete step:', {
          stepIndex,
          error: result.payload || result.error?.message,
        });
        return false;
      }
    } catch (error) {
      logger.error('Error completing checklist step:', {
        stepIndex,
        error: error.message,
      });
      return false;
    }
  };

  /**
   * Refreshes the checklist data for a user
   * @param {string} userIdParam - The user ID to refresh data for (optional, defaults to hook's userId)
   * @returns {Promise<boolean>} - Success status
   */
  const refreshChecklist = async (userIdParam) => {
    const targetUserId = userIdParam || userId;

    if (!targetUserId) {
      logger.warn('No userId available for checklist refresh');
      return false;
    }

    try {
      logger.info('Refreshing checklist for user:', targetUserId);
      const result = await dispatch(fetchUserChecklists(targetUserId));

      if (fetchUserChecklists.fulfilled.match(result)) {
        logger.info('Checklist refreshed successfully:', {
          userId: targetUserId,
          itemCount: result.payload?.length || 0,
        });
        return true;
      } else {
        logger.error('Failed to refresh checklist:', {
          userId: targetUserId,
          error: result.payload || result.error?.message,
        });
        return false;
      }
    } catch (error) {
      logger.error('Error refreshing checklist:', {
        userId: targetUserId,
        error: error.message,
      });
      return false;
    }
  };

  /**
   * Gets the completion status of the entire checklist
   * @returns {boolean} - Whether all steps are completed
   */
  const isChecklistComplete = () => {
    return (
      Array.isArray(checklist) &&
      checklist.length > 0 &&
      checklist.every((step) => step.completed)
    );
  };

  return {
    completeStep,
    refreshChecklist,
    isChecklistComplete,
    isLoading: status === 'loading',
    hasData: Array.isArray(checklist) && checklist.length > 0,
  };
};
