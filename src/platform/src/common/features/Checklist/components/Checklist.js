import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StepProgress from './CircularStepper';
import ChecklistStepCard from './ChecklistStepCard';
import ChecklistSkeleton from './ChecklistSkeleton';
import { createSteps, mergeStepsWithChecklist } from '../utils/steps';
import {
  fetchUserChecklists,
  updateTaskProgress,
} from '@/lib/store/services/checklists/CheckList';
import ErrorBoundary from '@/components/ErrorBoundary';

const Checklist = ({ openVideoModal }) => {
  const dispatch = useDispatch();
  const [userId, setUserId] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);

  // Get checklist data from Redux
  const reduxChecklist = useSelector(
    (state) => state.cardChecklist.checklist || [],
  );
  const reduxStatus = useSelector((state) => state.cardChecklist.status);
  const totalSteps = 4;

  // Create static steps - use useMemo to avoid recreating on each render
  const staticSteps = useMemo(() => createSteps(() => {}), []);

  // Derived states using useMemo to avoid unnecessary calculations on re-renders
  const stepCount = useMemo(() => {
    return reduxChecklist.filter((item) => item.completed).length;
  }, [reduxChecklist]);

  const allCompleted = useMemo(() => {
    return stepCount === totalSteps && stepCount > 0;
  }, [stepCount, totalSteps]);

  // Get user ID from localStorage only once when component mounts
  useEffect(() => {
    const getUserFromStorage = () => {
      if (typeof window !== 'undefined') {
        try {
          const storedUser = localStorage.getItem('loggedUser');
          if (storedUser && storedUser !== 'undefined') {
            const parsedUser = JSON.parse(storedUser);
            if (parsedUser?._id) {
              setUserId(parsedUser._id);
            }
          }
        } catch (error) {
          console.error('Error parsing user from localStorage:', error);
        }
      }
    };

    getUserFromStorage();
  }, []);

  // Fetch checklist data when component mounts, userId changes, or when we need a refresh
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (userId && isMounted && !dataFetched) {
        try {
          await dispatch(fetchUserChecklists(userId));
          if (isMounted) {
            setDataFetched(true);
          }
        } catch (error) {
          console.error('Error fetching checklist data:', error);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [userId, dispatch, dataFetched]);

  // Merge static steps with API data - using useMemo to avoid recalculating on every render
  const mergedSteps = useMemo(() => {
    const safeChecklist = Array.isArray(reduxChecklist) ? reduxChecklist : [];
    return mergeStepsWithChecklist(staticSteps, safeChecklist);
  }, [staticSteps, reduxChecklist]);

  // Prevent accidental data reset for completed checklists
  useEffect(() => {
    if (
      localStorage.getItem('checklistPreviouslyCompleted') === 'true' &&
      Array.isArray(reduxChecklist) &&
      reduxChecklist.length > 0 &&
      reduxChecklist.every((item) => !item.completed)
    ) {
      console.warn(
        'Potential checklist reset detected, preserving previous state',
      );
    }

    // Store completion state for reference
    if (allCompleted) {
      localStorage.setItem('checklistPreviouslyCompleted', 'true');
    }
  }, [reduxChecklist, allCompleted]);

  // Handle step click with useCallback to avoid recreation on every render
  const handleStepClick = useCallback(
    (stepItem) => {
      if (!stepItem._id || !userId) return;

      // For step ID 4, directly mark as completed if not already completed
      if (stepItem.id === 4 && !stepItem.completed) {
        dispatch(
          updateTaskProgress({
            _id: stepItem._id,
            status: 'completed',
            completed: true,
            completionDate: new Date().toISOString(),
          }),
        );
        return;
      }

      // For step ID 1 (video step), open the video modal
      if (stepItem.id === 1) {
        if (openVideoModal) {
          openVideoModal();
        }

        // If the step is "not started", update its status to "inProgress"
        if (stepItem.status === 'not started') {
          dispatch(
            updateTaskProgress({
              _id: stepItem._id,
              status: 'inProgress',
            }),
          );
        }
      } else if (stepItem.status === 'not started') {
        // For other new steps, mark as in progress
        dispatch(
          updateTaskProgress({
            _id: stepItem._id,
            status: 'inProgress',
          }),
        );
      }
    },
    [userId, dispatch, openVideoModal],
  );

  // Show loading skeleton during initial load
  if (
    (reduxStatus === 'loading' || !dataFetched) &&
    (!reduxChecklist || reduxChecklist.length === 0)
  ) {
    return <ChecklistSkeleton />;
  }

  return (
    <ErrorBoundary name="Checklist" feature="Onboarding">
      <div className={reduxStatus === 'loading' ? 'opacity-70' : ''}>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="w-full md:w-1/2 flex flex-col">
            <h2 className="text-xl md:text-2xl font-medium text-gray-900 dark:text-white">
              Onboarding Checklist
            </h2>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-300">
              {allCompleted
                ? "Great job! You've completed all onboarding steps."
                : 'Continue with your onboarding journey.'}
            </p>
          </div>
          <div className="w-full md:w-1/2 mt-4 md:mt-0">
            <StepProgress
              step={stepCount}
              totalSteps={totalSteps}
              completed={allCompleted}
            />
          </div>
        </div>

        {/* Checklist Grid */}
        <div className="grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-4">
          {mergedSteps.map((stepItem) => (
            <ChecklistStepCard
              key={`step-${stepItem.id}-${stepItem._id || 'new'}`}
              stepItem={stepItem}
              onClick={() => handleStepClick(stepItem)}
            />
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Checklist;
