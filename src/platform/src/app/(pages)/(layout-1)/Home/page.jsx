'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/Button';
import Image from 'next/image';
import AnalyticsImage from '@/images/Home/analyticsImage.webp';
import PlayIcon from '@/images/Home/PlayIcon';
import HomeSkeleton from '@/components/skeletons/HomeSkeleton';
import VideoModal from '@/features/video-players/Intro-video-modal';
import Card from '@/components/CardWrapper';
import { Checklist } from '@/features/Checklist';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserChecklists,
  updateTaskProgress,
} from '@/lib/store/services/checklists/CheckList';

const ANALYTICS_VIDEO_URL =
  'https://res.cloudinary.com/dbibjvyhm/video/upload/v1730840120/Analytics/videos/Airqo_Tech_video_cc8chw.mp4';

const Home = () => {
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchInitiated, setIsFetchInitiated] = useState(false);
  const dispatch = useDispatch();

  // Get Redux state for checklist
  const checklistStatus = useSelector((state) => state.cardChecklist.status);
  const checklistData = useSelector((state) => state.cardChecklist.checklist);

  // Load user data and fetch checklist
  useEffect(() => {
    let timer;

    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem('loggedUser');
        if (storedUser && storedUser !== 'undefined') {
          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);

          // If we have a user ID and haven't started fetching yet, fetch their checklist data
          if (parsedUser._id && !isFetchInitiated) {
            dispatch(fetchUserChecklists(parsedUser._id));
            setIsFetchInitiated(true);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }

      // Only set loading to false when we have data or after a timeout
      if (checklistStatus !== 'loading' || checklistData?.length > 0) {
        setIsLoading(false);
      } else {
        // Set a timeout to prevent infinite loading states
        timer = setTimeout(() => {
          setIsLoading(false);
        }, 5000);
      }
    };

    loadUserData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [dispatch, checklistStatus, isFetchInitiated, checklistData]);

  // Add data persistence check for MAC users specifically
  useEffect(() => {
    const checkPlatform = () => {
      const platform = navigator.platform || '';
      const isMacOS = /Mac|iPad|iPhone|iPod/.test(platform);

      if (isMacOS) {
        // Extra check for Mac users to ensure data persistence
        const checklistComplete = localStorage.getItem(
          'checklistPreviouslyCompleted',
        );

        // If previously completed checklist but now data is missing, attempt recovery
        if (
          checklistComplete === 'true' &&
          (!checklistData || checklistData.length === 0) &&
          userData?._id &&
          checklistStatus !== 'loading'
        ) {
          console.warn(
            'Detected potential data loss on MacOS, refreshing data',
          );
          dispatch(fetchUserChecklists(userData._id));
        }
      }
    };

    if (!isLoading) {
      checkPlatform();
    }
  }, [isLoading, checklistData, userData, dispatch, checklistStatus]);

  // Handle video modal close and update checklist item
  const handleVideoModalClose = () => {
    setOpen(false);

    // Find and update the video step (ID=1) as completed when modal is closed
    if (Array.isArray(checklistData) && userData?._id) {
      const videoStep = checklistData.find(
        (item) => item.id === 1 || item.title?.includes('video'),
      );

      if (videoStep && !videoStep.completed && videoStep._id) {
        dispatch(
          updateTaskProgress({
            _id: videoStep._id,
            status: 'completed',
            completed: true,
            completionDate: new Date().toISOString(),
            videoProgress: 100,
          }),
        );
      }
    }
  };

  // Toggle the video modal
  const handleModal = () => {
    if (open) {
      handleVideoModalClose();
    } else {
      setOpen(true);
    }
  };

  // Function to open video modal (to pass to Checklist)
  const openVideoModal = () => setOpen(true);

  // Show skeleton loader during initial load
  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <>
      <div className="space-y-6 transition-all duration-300 ease-in-out">
        {/* Welcome Section */}
        <div className="w-full">
          <h1 className="text-2xl md:text-4xl font-medium">
            Welcome,{' '}
            <span className="capitalize">
              {userData?.firstName || userData?.name || 'Guest'}
            </span>{' '}
            👋
          </h1>
        </div>

        {/* Render Checklist component with video modal function */}
        <Checklist openVideoModal={openVideoModal} />

        {/* Information and Video Section */}
        <Card className="w-full" padding="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            <div className="flex flex-col justify-start space-y-4">
              <h2 className="text-2xl font-medium text-gray-900 dark:text-white">
                Track air pollution in places you care about
              </h2>
              <p className="text-lg font-normal text-gray-900 dark:text-white">
                Empower yourself with knowledge about the air you breathe;
                because clean air begins with understanding.
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <Button
                  path="/analytics"
                  className="w-32 h-12"
                  dataTestId="get-started-button"
                >
                  Start here
                </Button>
                <Button
                  variant="text"
                  padding="p-0 shadow-none"
                  onClick={handleModal}
                  className="text-primary text-sm font-normal hover:underline"
                  data-testid="show-video-button"
                >
                  Show me how
                </Button>
              </div>
            </div>
            <div
              className="rounded-md p-6 relative flex items-center justify-center cursor-pointer hover:bg-[#145DFF15]"
              style={{ background: '#145DFF08' }}
              onClick={handleModal}
              aria-label="Play Analytics Video"
              data-testid="video-thumbnail"
            >
              <div className="absolute inset-0 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                <PlayIcon className="text-primary" />
              </div>
              <Image
                src={AnalyticsImage}
                alt="Analytics Image"
                width={600}
                height={350}
                className="rounded-md"
                priority
              />
            </div>
          </div>
        </Card>
      </div>

      {/* Video Modal */}
      <VideoModal
        open={open}
        setOpen={handleVideoModalClose}
        videoUrl={ANALYTICS_VIDEO_URL}
      />
    </>
  );
};

export default Home;
