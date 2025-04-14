import withAuth from '@/core/utils/protectedRoute';
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import Button from '@/components/Button';
import Image from 'next/image';
import AnalyticsImage from '@/images/Home/analyticsImage.webp';
import PlayIcon from '@/images/Home/playIcon.svg';
import HomeSkeleton from '@/components/skeletons/HomeSkeleton';
import VideoModal from '@/features/video-players/Intro-video-modal';
import Card from '@/components/CardWrapper';
import { Checklist } from '@/features/Checklist';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserChecklists } from '@/lib/store/services/checklists/CheckList';

const ANALYTICS_VIDEO_URL =
  'https://res.cloudinary.com/dbibjvyhm/video/upload/v1730840120/Analytics/videos/Airqo_Tech_video_cc8chw.mp4';

const Home = () => {
  const [open, setOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  // Get Redux state for checklist
  const checklistStatus = useSelector((state) => state.cardChecklist.status);

  // Load user data and fetch checklist
  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem('loggedUser');
        if (storedUser && storedUser !== 'undefined') {
          const parsedUser = JSON.parse(storedUser);
          setUserData(parsedUser);

          // If we have a user ID, fetch their checklist data
          if (parsedUser._id && checklistStatus === 'idle') {
            dispatch(fetchUserChecklists(parsedUser._id));
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [dispatch, checklistStatus]);

  // Toggle the video modal
  const handleModal = () => setOpen((prev) => !prev);

  // Show skeleton loader during initial load
  if (isLoading) {
    return (
      <Layout noBorderBottom pageTitle="Home" topbarTitle="Home">
        <HomeSkeleton />
      </Layout>
    );
  }

  return (
    <Layout noBorderBottom pageTitle="Home" topbarTitle="Home">
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

        {/* Render Checklist component */}
        <Checklist />

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
                  className="bg-blue-900 text-white rounded-lg w-32 h-12"
                  dataTestId="get-started-button"
                >
                  Start here
                </Button>
                <button
                  onClick={handleModal}
                  className="text-blue-600 text-sm font-normal hover:underline"
                  data-testid="show-video-button"
                >
                  Show me how
                </button>
              </div>
            </div>
            <div
              className="rounded-md p-6 relative flex items-center justify-center cursor-pointer hover:bg-[#145DFF15]"
              style={{ background: '#145DFF08' }}
              onClick={handleModal}
              aria-label="Play Analytics Video"
              data-testid="video-thumbnail"
            >
              <div className="absolute z-10 inset-0 flex items-center justify-center transition-transform duration-300 hover:scale-110">
                <PlayIcon />
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
        setOpen={setOpen}
        videoUrl={ANALYTICS_VIDEO_URL}
      />
    </Layout>
  );
};

export default withAuth(Home);
