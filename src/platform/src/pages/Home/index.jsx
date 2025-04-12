// Import statements
import withAuth from '@/core/utils/protectedRoute';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Layout from '@/components/Layout';
import CheckIcon from '@/icons/tickIcon';
import Link from 'next/link';
import Button from '@/components/Button';
import Image from 'next/image';
import AnalyticsImage from '@/images/Home/analyticsImage.webp';
import PlayIcon from '@/images/Home/playIcon.svg';
import { useSelector, useDispatch } from 'react-redux';
import {
  startTask,
  completeTask,
  updateTitle,
} from '@/lib/store/services/checklists/CheckList';
import HomeSkeleton from '@/components/skeletons/HomeSkeleton';
import VideoModal from '@/features/video-players/Intro-video-modal';
import StepProgress from '@/components/steppers/CircularStepper';
import Card from '@/components/CardWrapper';

// Video URL constant
const ANALYTICS_VIDEO_URL =
  'https://res.cloudinary.com/dbibjvyhm/video/upload/v1730840120/Analytics/videos/Airqo_Tech_video_cc8chw.mp4';

// Steps data factory function
const createSteps = (handleModal, handleCardClick) => [
  {
    id: 1,
    label: 'Introduction AirQo Analytics demo video',
    time: '1 min',
    link: '#',
    func: handleModal,
    disabled: false,
  },
  {
    id: 2,
    label: 'Choose location you are most interested in',
    time: '2 min',
    link: '/analytics',
    func: () => handleCardClick(2),
    disabled: false,
  },
  {
    id: 3,
    label: 'Complete your AirQo Analytics profile',
    time: '4 min',
    link: '/settings',
    func: () => handleCardClick(3),
    disabled: false,
  },
  {
    id: 4,
    label: 'Practical ways to reduce air pollution',
    time: '1 min',
    link: 'https://blog.airqo.net/',
    func: () => handleCardClick(4),
    disabled: false,
  },
];

const useUserData = () => {
  const userData = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const storedUser = localStorage.getItem('loggedUser');
    if (!storedUser || storedUser === 'undefined') {
      return null;
    }

    try {
      return JSON.parse(storedUser);
    } catch (error) {
      console.error('Error parsing "loggedUser" from localStorage:', error);
      return null;
    }
  }, []);

  return userData;
};

const Home = () => {
  const dispatch = useDispatch();

  // Selectors
  const checkListData = useSelector((state) => state.checklists.checklist);
  const cardCheckList = useSelector((state) => state.cardChecklist.cards);
  const checkListStatus = useSelector((state) => state.checklists.status);

  // State hooks
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const totalSteps = 4;

  // Safely retrieve user data from localStorage
  const userData = useUserData();

  // Handlers
  const handleModal = useCallback(() => {
    setOpen((prev) => !prev);
    const card = cardCheckList.find((card) => card.id === 1);
    if (card && card.status === 'not started') {
      dispatch(startTask(1));
      dispatch(updateTitle({ id: 1, title: 'analytics_video' }));
    }
  }, [cardCheckList, dispatch]);

  const handleCardClick = useCallback(
    (id) => {
      if (id === 4) {
        dispatch(completeTask(id));
      } else {
        const card = cardCheckList.find((card) => card.id === id);
        if (card && card.status === 'not started') {
          dispatch(startTask(id));
        }
      }
    },
    [cardCheckList, dispatch],
  );

  // Initialize steps with handlers
  const steps = useMemo(
    () => createSteps(handleModal, handleCardClick),
    [handleModal, handleCardClick],
  );

  // Update step count based on completed cards
  useEffect(() => {
    const completedCards = cardCheckList.filter((card, index) => {
      if (steps[index]?.disabled) return false;
      return card.completed === true;
    });
    setStep(completedCards.length);
  }, [cardCheckList, steps]);

  return (
    <Layout noBorderBottom pageTitle="Home" topbarTitle="Home">
      {checkListStatus === 'loading' && checkListData.length === 0 ? (
        <HomeSkeleton />
      ) : (
        <>
          <div className="space-y-5 transition-all duration-300 ease-in-out">
            {/* Welcome Section */}
            <div className="w-full">
              <h1 className="text-2xl md:text-4xl font-medium">
                Welcome,{' '}
                <span className="capitalize">{userData?.firstName}</span> 👋
              </h1>
            </div>

            {/* Onboarding Checklist and Progress */}
            <div className="w-full flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="w-full md:w-1/2 flex flex-col items-start">
                <h2 className="text-xl md:text-2xl font-medium text-gray-900 dark:text-white">
                  Onboarding Checklist
                </h2>
                <p className="text-sm md:text-base text-gray-500 dark:text-gray-300">
                  We recommend starting with our onboarding checklist.
                </p>
              </div>
              <div className="w-full md:w-1/2 mt-4 md:mt-0">
                <StepProgress step={step} totalSteps={totalSteps} />
              </div>
            </div>

            {/* Checklist Steps */}
            <div className="w-full grid gap-5 grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4">
              {steps.map((stepItem) => {
                if (stepItem.disabled) {
                  return null;
                }

                const card = cardCheckList.find(
                  (card) => card.id === stepItem.id,
                );

                const isCompleted = card?.completed;
                const isInProgress = card?.status === 'inProgress';

                const statusText = isCompleted ? 'Done' : 'Start';
                const statusColor = isCompleted
                  ? 'text-black'
                  : 'text-blue-600';
                const justifyStyle = isCompleted
                  ? 'justify-end'
                  : 'justify-between';

                return (
                  <Card
                    key={stepItem.id}
                    width="w-full"
                    height="h-full"
                    className="focus:outline-blue-600 focus:ring-2 focus:ring-blue-600"
                    contentClassName="space-y-8"
                    padding="py-5 px-3"
                  >
                    {/* Icon Section */}
                    <div className="w-full">
                      {isCompleted ? (
                        <div className="w-14 h-14 flex justify-center items-center rounded-full bg-blue-900">
                          <CheckIcon fill="#FFFFFF" />
                        </div>
                      ) : (
                        <div className="text-base w-14 h-14 flex justify-center items-center font-medium rounded-full bg-[#F5F5FF]">
                          <span className="text-blue-600">{stepItem.id}</span>
                        </div>
                      )}
                    </div>

                    {/* Label */}
                    <p className="w-full text-base font-normal dark:text-white">
                      {stepItem.label}
                    </p>

                    {/* Action Section */}
                    <div
                      className={`w-full text-sm flex ${justifyStyle} font-normal`}
                    >
                      {isCompleted ? (
                        <span className={statusColor}>{statusText}</span>
                      ) : (
                        <>
                          <Link
                            href={stepItem.link}
                            target={stepItem.id === 4 ? '_blank' : '_self'}
                            rel={
                              stepItem.id === 4
                                ? 'noopener noreferrer'
                                : undefined
                            }
                            passHref
                          >
                            <div
                              onClick={stepItem.func}
                              className={`${statusColor} cursor-pointer`}
                            >
                              {isInProgress ? 'Resume' : statusText}
                            </div>
                          </Link>
                          <span className="text-sm font-normal text-gray-900 dark:text-white">
                            {stepItem.time}
                          </span>
                        </>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Information and Video Section */}
            <Card className="w-full" padding="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                {/* Text Content */}
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
                      className="text-blue-600 text-sm font-normal mt-2 cursor-pointer"
                    >
                      Show me how
                    </button>
                  </div>
                </div>

                {/* Video Thumbnail */}
                <div
                  className="rounded-md p-9 relative flex items-center justify-center cursor-pointer"
                  style={{ background: '#145DFF08' }}
                  onClick={handleModal}
                  aria-label="Play Analytics Video"
                >
                  <div className="absolute z-50 inset-0 flex items-center justify-center">
                    <PlayIcon />
                  </div>
                  <Image
                    src={AnalyticsImage}
                    alt="Analytics Image"
                    width={600}
                    height={350}
                    className="rounded-md"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Custom Modal */}
          <VideoModal
            open={open}
            setOpen={setOpen}
            videoUrl={ANALYTICS_VIDEO_URL}
            checklistData={cardCheckList}
          />
        </>
      )}
    </Layout>
  );
};

export default withAuth(Home);
