import { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import StepProgress from './CircularStepper';
import ChecklistStepCard from './ChecklistStepCard';
import ChecklistSkeleton from './ChecklistSkeleton';
import { createSteps, mergeStepsWithChecklist } from '../utils/steps';
import logger from '@/lib/logger';
import {
  fetchUserChecklists,
  updateTaskProgress,
} from '@/lib/store/services/checklists/CheckList';

import ErrorBoundary from '@/components/ErrorBoundary';

const Checklist = ({ openVideoModal }) => {
  const dispatch = useDispatch();
  const [userId, setUserId] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);
  const { data: session } = useSession();

  // Get checklist data from Redux
  const reduxChecklist = useSelector(
    (state) => state.cardChecklist.checklist || [],
  );
  const reduxStatus = useSelector((state) => state.cardChecklist.status);

  // Debug Redux state (keep for monitoring)
  useEffect(() => {
    logger.info('Checklist Redux state:', {
      status: reduxStatus,
      checklistLength: reduxChecklist?.length,
      hasItems: reduxChecklist?.length > 0,
    });
  }, [reduxChecklist, reduxStatus]);
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

  // Get user ID from NextAuth session when component mounts
  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    } else if (session?.user?._id) {
      setUserId(session.user._id);
    } else if (session?.user?.userId) {
      setUserId(session.user.userId);
    }
  }, [session]);

  // Fetch checklist data when component mounts or userId changes
  useEffect(() => {
    let isMounted = true;
    let retryCount = 0;
    const maxRetries = 3;

    const fetchData = async () => {
      if (userId && isMounted) {
        try {
          const result = await dispatch(fetchUserChecklists(userId));

          // Check if the action was fulfilled
          if (fetchUserChecklists.fulfilled.match(result)) {
            if (isMounted) {
              setDataFetched(true);
              logger.info('Checklist data fetched successfully', {
                userId,
                itemCount: result.payload?.length || 0,
              });
            }
          } else if (fetchUserChecklists.rejected.match(result)) {
            // Handle the case where the action was rejected
            logger.warn('Failed to fetch checklist data', {
              userId,
              error: result.payload || result.error?.message,
              retryCount,
            });

            // Retry if we haven't exceeded max retries
            if (retryCount < maxRetries && isMounted) {
              retryCount++;
              setTimeout(() => {
                if (isMounted) {
                  fetchData();
                }
              }, 1000 * retryCount); // Exponential backoff
            } else if (isMounted) {
              setDataFetched(true); // Stop loading even if failed
            }
          }
        } catch (error) {
          logger.error('Error fetching checklist data:', {
            userId,
            error: error.message,
            retryCount,
          });

          // Retry if we haven't exceeded max retries
          if (retryCount < maxRetries && isMounted) {
            retryCount++;
            setTimeout(() => {
              if (isMounted) {
                fetchData();
              }
            }, 1000 * retryCount); // Exponential backoff
          } else if (isMounted) {
            setDataFetched(true); // Stop loading even if failed
          }
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [userId, dispatch]);

  // Merge static steps with API data
  const mergedSteps = useMemo(() => {
    const safeChecklist = Array.isArray(reduxChecklist) ? reduxChecklist : [];
    return mergeStepsWithChecklist(staticSteps, safeChecklist);
  }, [staticSteps, reduxChecklist]);

  const handleStepClick = useCallback(
    async (stepItem) => {
      if (!stepItem._id || !userId) {
        logger.warn('Cannot update step: missing ID or user ID', {
          stepId: stepItem.id,
          hasId: !!stepItem._id,
          hasUserId: !!userId,
        });

        // If no _id, try to refetch the checklist data
        if (!stepItem._id && userId) {
          logger.info('Attempting to reinitialize checklist...');
          try {
            const result = await dispatch(fetchUserChecklists(userId));
            if (fetchUserChecklists.fulfilled.match(result)) {
              logger.info('Checklist reinitialized successfully');
              setDataFetched(true);
            }
          } catch (reinitError) {
            logger.error('Failed to reinitialize checklist:', reinitError);
          }
        }
        return;
      }

      try {
        // For step ID 4, directly mark as completed if not already completed
        if (stepItem.id === 4 && !stepItem.completed) {
          await dispatch(
            updateTaskProgress({
              _id: stepItem._id,
              status: 'completed',
              completed: true,
              completionDate: new Date().toISOString(),
              userId: userId,
            }),
          ).unwrap();

          logger.info('Step 4 marked as completed', {
            userId,
            stepId: stepItem._id,
          });
          return;
        }

        // For step ID 1 (video step), open the video modal
        if (stepItem.id === 1) {
          if (openVideoModal) {
            openVideoModal();
          }

          // If the step is "not started", update its status to "inProgress"
          if (stepItem.status === 'not started') {
            await dispatch(
              updateTaskProgress({
                _id: stepItem._id,
                status: 'inProgress',
                userId: userId,
              }),
            ).unwrap();

            logger.info('Step 1 marked as in progress', {
              userId,
              stepId: stepItem._id,
            });
          }
        } else if (stepItem.status === 'not started') {
          // For other new steps, mark as in progress
          await dispatch(
            updateTaskProgress({
              _id: stepItem._id,
              status: 'inProgress',
              userId: userId,
            }),
          ).unwrap();

          logger.info('Step marked as in progress', {
            userId,
            stepId: stepItem._id,
            stepNumber: stepItem.id,
          });
        }
      } catch (error) {
        logger.error('Error updating task:', {
          userId,
          stepId: stepItem._id,
          stepNumber: stepItem.id,
          error: error.message,
        });

        // If there's an error updating the task, try to refresh the checklist data
        try {
          const result = await dispatch(fetchUserChecklists(userId));
          if (fetchUserChecklists.fulfilled.match(result)) {
            setDataFetched(true);
            logger.info('Checklist refreshed after update error');
          }
        } catch (refreshError) {
          logger.error(
            'Failed to refresh checklist after error:',
            refreshError,
          );
          setDataFetched(false);
        }
      }
    },
    [userId, dispatch, openVideoModal, setDataFetched],
  );

  // Show loading skeleton during initial load
  if (
    (reduxStatus === 'loading' || !dataFetched) &&
    (!reduxChecklist || reduxChecklist.length === 0)
  ) {
    return <ChecklistSkeleton />;
  }

  // Show error state if failed and no data
  if (
    reduxStatus === 'failed' &&
    (!reduxChecklist || reduxChecklist.length === 0)
  ) {
    return (
      <ErrorBoundary name="Checklist" feature="Onboarding">
        <div className="p-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <div className="flex items-center mb-3">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Checklist Temporarily Unavailable
              </h3>
            </div>
          </div>
          <div className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
            We&apos;re having trouble loading your onboarding checklist. This is
            usually temporary.
          </div>
          <button
            onClick={async () => {
              if (userId) {
                setDataFetched(false);
                try {
                  await dispatch(fetchUserChecklists(userId));
                  setDataFetched(true);
                } catch (error) {
                  logger.error('Manual retry failed:', error);
                }
              }
            }}
            className="bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-800 dark:hover:bg-yellow-700 text-yellow-800 dark:text-yellow-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary name="Checklist" feature="Onboarding">
      <div
      // className={reduxStatus === 'loading' ? 'opacity-70' : ''}
      >
        {/* Header Section */}
        <div className="flex flex-row justify-between items-center md:items-center mb-4">
          <div className="w-full md:w-1/2 flex flex-col">
            <h2 className="text-xl md:text-2xl font-medium text-gray-900 dark:text-white">
              Onboarding Checklist
            </h2>
            <p className="text-sm md:text-base text-gray-500 dark:text-gray-300">
              {allCompleted
                ? 'Great job! You&apos;ve completed all onboarding steps.'
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
        <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
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
