'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Button from '@/components/Button';
import Image from 'next/image';
import AnalyticsImage from '@/images/Home/analyticsImage.webp';
import PlayIcon from '@/images/Home/PlayIcon';
import { HomeSkeleton } from '@/common/components/Skeleton';
import VideoModal from '@/features/video-players/Intro-video-modal';
import Card from '@/components/CardWrapper';
import { Checklist } from '@/features/Checklist';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchUserChecklists,
  updateTaskProgress,
} from '@/lib/store/services/checklists/CheckList';
import { useRouter } from 'next/navigation';
import { AqDownload01, AqBuilding07, AqBarChart01 } from '@airqo/icons-react';

const ANALYTICS_VIDEO_URL =
  'https://res.cloudinary.com/dbibjvyhm/video/upload/v1730840120/Analytics/videos/Airqo_Tech_video_cc8chw.mp4';

const Home = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchInitiated, setIsFetchInitiated] = useState(false);
  const dispatch = useDispatch();
  const { data: session, status } = useSession();

  // Get Redux state for checklist and user info
  const checklistStatus = useSelector((state) => state.cardChecklist.status);
  const checklistData = useSelector((state) => state.cardChecklist.checklist);
  const reduxUserInfo = useSelector((state) => state.login.userInfo);

  // Get user display name from multiple sources with priority
  const getUserDisplayName = () => {
    // Priority: Redux user info -> NextAuth session -> Guest
    if (reduxUserInfo?.firstName) {
      return reduxUserInfo.firstName;
    }
    if (reduxUserInfo?.name) {
      return reduxUserInfo.name;
    }
    if (session?.user?.name) {
      return session.user.name.split(' ')[0];
    }
    if (userData?.firstName) {
      return userData.firstName;
    }
    if (userData?.name) {
      return userData.name;
    }
    return 'Guest';
  };
  useEffect(() => {
    let timer;

    const loadUserData = () => {
      try {
        // If we have NextAuth session, prioritize that data
        if (session?.user) {
          const sessionUser = {
            _id: session.user.id,
            firstName: session.user.name?.split(' ')[0],
            name: session.user.name,
            email: session.user.email,
          };
          setUserData(sessionUser);

          // Fetch checklist if we haven't started yet
          if (session.user.id && !isFetchInitiated) {
            dispatch(fetchUserChecklists(session.user.id));
            setIsFetchInitiated(true);
          }
        } else if (reduxUserInfo?._id) {
          // Use Redux user info if available
          setUserData(reduxUserInfo);

          if (reduxUserInfo._id && !isFetchInitiated) {
            dispatch(fetchUserChecklists(reduxUserInfo._id));
            setIsFetchInitiated(true);
          }
        }
      } catch (error) {
        // Handle error silently or with logger
        console.warn('Error loading user data:', error);
      }

      // Set loading to false when we have data or after a timeout
      if (checklistStatus !== 'loading' || checklistData?.length > 0) {
        setIsLoading(false);
      } else {
        timer = setTimeout(() => {
          setIsLoading(false);
        }, 5000);
      }
    };

    loadUserData();

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [
    dispatch,
    checklistStatus,
    isFetchInitiated,
    checklistData,
    session,
    status,
    reduxUserInfo,
  ]);
  useEffect(() => {
    const checkPlatform = () => {
      const platform = navigator.platform || '';
      const isMacOS = /Mac|iPad|iPhone|iPod/.test(platform);

      if (isMacOS) {
        if (
          (!checklistData || checklistData.length === 0) &&
          (userData?._id || session?.user?.id) &&
          checklistStatus !== 'loading'
        ) {
          // Attempt recovery by refetching checklist data
          const userId = userData?._id || session?.user?.id;
          if (userId) {
            dispatch(fetchUserChecklists(userId));
          }
        }
      }
    };

    if (!isLoading) {
      checkPlatform();
    }
  }, [isLoading, checklistData, userData, dispatch, checklistStatus, session]);

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
            Welcome, <span className="capitalize">{getUserDisplayName()}</span>{' '}
            👋
          </h1>
        </div>

        {/* Quick Access Section */}
        <div className="mb-8">
          <div className="flex items-center mb-3">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white mr-2">
              Quick Access
            </h2>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button
              variant="outlined"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              Icon={AqDownload01}
              onClick={() => router.push('/user/data-export')}
            >
              Download Data
            </Button>
            <Button
              variant="outlined"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              Icon={AqBarChart01}
              onClick={() => router.push('/user/analytics')}
            >
              Data Analysis
            </Button>
            <Button
              variant="outlined"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              Icon={AqBuilding07}
              onClick={() => {
                router.push('/create-organization');
              }}
            >
              Request New Organization
            </Button>
          </div>
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
                  path="/user/analytics"
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
