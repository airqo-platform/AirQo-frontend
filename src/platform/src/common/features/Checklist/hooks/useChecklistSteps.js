import { useDispatch, useSelector } from 'react-redux';
import { updateTaskProgress } from '@/lib/store/services/checklists/CheckList';

/**
 * Custom hook for managing checklist steps
 * @returns {Function} completeStep - Function to complete a specific step
 */
export const useChecklistSteps = () => {
  const dispatch = useDispatch();
  const checklist = useSelector((state) => state.cardChecklist.checklist);

  /**
   * Completes a specific checklist step
   * @param {number} stepIndex - The index of the step to complete (0-based)
   */
  const completeStep = (stepIndex) => {
    try {
      if (
        typeof stepIndex !== 'number' ||
        !checklist ||
        stepIndex < 0 ||
        stepIndex >= checklist.length
      ) {
        return false;
      }

      const step = checklist[stepIndex];

      if (!step || step.completed || !step._id) {
        return false;
      }

      dispatch(
        updateTaskProgress({
          _id: step._id,
          status: 'completed',
          completed: true,
          completionDate: new Date().toISOString(),
        }),
      );

      return true;
    } catch (error) {
      console.error('Error completing checklist step:', error);
      return false;
    }
  };

  return { completeStep };
};
