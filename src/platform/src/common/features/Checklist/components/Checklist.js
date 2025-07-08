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
import Button from '@/common/components/Button';
import { FiDownload, FiBarChart2, FiUsers } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const Checklist = ({ openVideoModal }) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [userId, setUserId] = useState(null);
  const [dataFetched, setDataFetched] = useState(false);
  const { data: session } = useSession();

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

  // Get user ID from NextAuth session when component mounts
  useEffect(() => {
    if (session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [session]);
  // Fetch checklist data when component mounts or userId changes
  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (userId && isMounted) {
        try {
          // Log for debugging
          if (process.env.NODE_ENV !== 'production') {
            logger.info('Fetching checklist data for user:', userId);
          }

          await dispatch(fetchUserChecklists(userId));

          if (isMounted) {
            setDataFetched(true);
          }
        } catch (error) {
          // Log error but don't expose in production
          if (process.env.NODE_ENV !== 'production') {
            logger.error('Error fetching checklist data:', error);
          }
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [userId, dispatch]);

  // Merge static steps with API data - using useMemo to avoid recalculating on every render
  const mergedSteps = useMemo(() => {
    const safeChecklist = Array.isArray(reduxChecklist) ? reduxChecklist : [];
    return mergeStepsWithChecklist(staticSteps, safeChecklist);
  }, [staticSteps, reduxChecklist]); // Monitor checklist completion state
  useEffect(() => {
    // Note: We removed localStorage dependency as we're now using NextAuth and persistent server-side state
    // No side effects needed as state is persisted in the database
  }, [reduxChecklist, allCompleted]); // Handle step click with useCallback to avoid recreation on every render
  const handleStepClick = useCallback(
    async (stepItem) => {
      if (!stepItem._id || !userId) return;

      try {
        // For step ID 4, directly mark as completed if not already completed
        if (stepItem.id === 4 && !stepItem.completed) {
          await dispatch(
            updateTaskProgress({
              _id: stepItem._id,
              status: 'completed',
              completed: true,
              completionDate: new Date().toISOString(),
              userId: userId, // Include userId in updates
            }),
          ).unwrap();
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
                userId: userId, // Include userId in updates
              }),
            ).unwrap();
          }
        } else if (stepItem.status === 'not started') {
          // For other new steps, mark as in progress
          await dispatch(
            updateTaskProgress({
              _id: stepItem._id,
              status: 'inProgress',
              userId: userId, // Include userId in updates
            }),
          ).unwrap();
        }
      } catch (error) {
        // If there's an error updating the task, refresh the checklist data
        setDataFetched(false);
        // Log the error for debugging
        if (process.env.NODE_ENV !== 'production') {
          // eslint-disable-next-line no-console
          console.error('Error updating task:', error);
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

  return (
    <ErrorBoundary name="Checklist" feature="Onboarding">
      <div className={reduxStatus === 'loading' ? 'opacity-70' : ''}>
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
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

        {/* Quick Access Section */}
        <div className="mb-8">
          <div className="flex items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mr-2">
              Quick Access
            </h3>
            <span className="text-xs text-gray-400">to</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="outlined"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              Icon={FiDownload}
              onClick={() => router.push('/user/analytics')}
            >
              Download Data
            </Button>
            <Button
              variant="outlined"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              Icon={FiBarChart2}
              onClick={() => router.push('/user/analytics')}
            >
              Data Analysis
            </Button>
            <Button
              variant="outlined"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              Icon={FiUsers}
              onClick={() => {
                router.push('/create-organization');
              }}
            >
              Request New Organization
            </Button>
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
