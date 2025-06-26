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
  const completeStep = (stepIndex) => {
    try {
      if (
        typeof stepIndex !== 'number' ||
        !Array.isArray(checklist) ||
        stepIndex < 0 ||
        stepIndex >= checklist.length
      ) {
        return false;
      }

      const step = checklist[stepIndex];

      if (!step || !step._id) {
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

      dispatch(
        updateTaskProgress({
          _id: step._id,
          status: 'completed',
          completed: true,
          completionDate: new Date().toISOString(),
          userId: userId,
        }),
      );

      return true;
    } catch (error) {
      logger.error('Error completing checklist step:', error);
      return false;
    }
  };

  /**
   * Refreshes the checklist data for a user
   * @param {string} userId - The user ID to refresh data for
   * @returns {Promise} - The dispatch promise
   */
  const refreshChecklist = async (userId) => {
    if (!userId) {
      return false;
    }

    try {
      return await dispatch(fetchUserChecklists(userId));
    } catch {
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
