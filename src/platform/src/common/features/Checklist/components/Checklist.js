import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StepProgress from '@/components/steppers/CircularStepper';
import ChecklistStepCard from './ChecklistStepCard';
import ChecklistSkeleton from './ChecklistSkeleton';
import { createSteps, mergeStepsWithChecklist } from '../utils/steps';
import {
  fetchUserChecklists,
  updateTaskProgress,
} from '@/lib/store/services/checklists/CheckList';

const Checklist = ({ openVideoModal }) => {
  const dispatch = useDispatch();
  const [stepCount, setStepCount] = useState(0);
  const [allCompleted, setAllCompleted] = useState(false);
  const [userId, setUserId] = useState(null);

  // Get checklist data from Redux
  const reduxChecklist = useSelector((state) => state.cardChecklist.checklist);
  const reduxStatus = useSelector((state) => state.cardChecklist.status);
  const totalSteps = 4;

  // Create static steps
  const staticSteps = createSteps(() => {});

  // Get user ID from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('loggedUser');
        if (storedUser && storedUser !== 'undefined') {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser?._id) {
            setUserId(parsedUser._id);
          }
        }
      } catch {
        // empty for now
      }
    }
  }, []);

  // Fetch checklist data when component mounts or userId changes
  useEffect(() => {
    if (userId && (reduxStatus === 'idle' || reduxChecklist.length === 0)) {
      dispatch(fetchUserChecklists(userId));
    }
  }, [userId, reduxStatus, reduxChecklist.length, dispatch]);

  // Merge static steps with API data
  const mergedSteps = mergeStepsWithChecklist(staticSteps, reduxChecklist);

  // Handle step click
  const handleStepClick = useCallback(
    (stepItem) => {
      if (!stepItem._id || !userId) return;

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
      } else if (stepItem.id === 4 && !stepItem.completed) {
        dispatch(
          updateTaskProgress({
            _id: stepItem._id,
            status: 'completed',
            completed: true,
            completionDate: new Date().toISOString(),
          }),
        );
      }
    },
    [userId, dispatch, openVideoModal],
  );

  // Update step count when checklist data changes
  useEffect(() => {
    if (reduxChecklist.length > 0) {
      const completedItems = reduxChecklist.filter((item) => item.completed);
      setStepCount(completedItems.length);
      setAllCompleted(completedItems.length === totalSteps);
    }
  }, [reduxChecklist, totalSteps]);

  // Show loading skeleton during initial load
  if (reduxStatus === 'loading' && reduxChecklist.length === 0) {
    return <ChecklistSkeleton />;
  }

  return (
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
            key={stepItem._id || stepItem.id}
            stepItem={stepItem}
            onClick={() => handleStepClick(stepItem)}
          />
        ))}
      </div>
    </div>
  );
};

export default Checklist;
