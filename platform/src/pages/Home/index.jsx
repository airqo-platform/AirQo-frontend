import withAuth from '@/core/utils/protectedRoute';
import React, { useState, useRef, useEffect } from 'react';
import Layout from '@/components/Layout';
import CheckIcon from '@/icons/tickIcon';
import Link from 'next/link';
import Button from '@/components/Button';
import Image from 'next/image';
import AnalyticsImage from '@/images/Home/analyticsImage.png';
import PlayIcon from '@/images/Home/playIcon.svg';
import CloseIcon from '@/icons/close_icon';
import Spinner from '@/components/Spinner';
import AnalyticsVideo from '../../../public/videos/analytics.mp4';
import { useSelector, useDispatch } from 'react-redux';
import {
  startTask,
  completeTask,
  updateTitle,
  updateVideoProgress,
} from '@/lib/store/services/checklists/CheckList';

const StepProgress = ({ step, totalSteps }) => {
  const radius = 45;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (step / totalSteps) * circumference;

  return (
    <div className='flex items-center justify-end'>
      <svg height={radius * 2} width={radius * 2}>
        <defs>
          <mask id='round'>
            <rect width='100%' height='100%' fill='#fff' />
            <circle cx={radius} cy={radius} r={normalizedRadius - stroke / 2} fill='#000' />
          </mask>
        </defs>
        <circle
          stroke='#E1E7EC'
          fill='transparent'
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke='#145FFF'
          fill='transparent'
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset, transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          mask='url(#round)'
        />
        <text x='50%' y='50%' textAnchor='middle' fill='#536A87' fontSize='18px' dy='.4em'>
          {step}/{totalSteps}
        </text>
      </svg>
    </div>
  );
};

const CustomModal = ({ open, setOpen, videoUrl, checklistData }) => {
  const dispatch = useDispatch();
  const modalRef = useRef(null);
  const backdropRef = useRef(null);
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(true);

  const handleClickOutside = (event) => {
    if (backdropRef.current && !backdropRef.current.contains(event.target)) {
      setOpen(false);
      dispatch(updateVideoProgress({ id: 1, videoProgress: videoRef.current.currentTime }));
    }
  };

  useEffect(() => {
    if (open) {
      modalRef.current.focus();
      document.addEventListener('mousedown', handleClickOutside);
      const videoTime = checklistData.find(
        (card) => card.title === 'analytics_video',
      )?.videoProgress;
      if (videoTime) {
        videoRef.current.currentTime = videoTime;
      }
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      if (videoRef.current) {
        dispatch(updateVideoProgress({ id: 1, videoProgress: videoRef.current.currentTime }));
      }
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const handleVideoLoad = () => {
    setLoading(false);
  };

  const handleVideoPause = () => {
    dispatch(updateVideoProgress({ id: 1, videoProgress: videoRef.current.currentTime }));
  };

  const handleVideoEnd = () => {
    dispatch(updateVideoProgress({ id: 1, videoProgress: 0 }));
    dispatch(completeTask(1));
  };

  return (
    open && (
      <div
        ref={modalRef}
        id='custom-modal'
        tabIndex='-1'
        className={`fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center transform transition-transform duration-300 ${
          open ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        } bg-gray-800 bg-opacity-50`}>
        <div
          ref={backdropRef}
          className='relative w-full h-[450px] max-w-2xl max-h-full bg-white rounded-xl shadow dark:bg-gray-700 p-1 mx-4 md:mx-0 animate-slide-in'>
          <h1 className='text-sm md:text-xl w-full text-center font-medium text-gray-900 p-3'>
            Introducing AirQo Analytics
          </h1>
          <button
            type='button'
            onClick={() => {
              setOpen(!open);
              dispatch(updateVideoProgress({ id: 1, videoProgress: videoRef.current.currentTime }));
            }}
            className='absolute top-0 right-0 md:-top-[25px] md:-right-[24px] m-2 text-gray-400 bg-blue-600 hover:bg-blue-900 hover:text-gray-900 rounded-full text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white'
            data-modal-hide='custom-modal'>
            <CloseIcon fill='#FFFFFF' />
            <span className='sr-only'>Close modal</span>
          </button>
          <div className='w-full h-full max-h-[384px] relative'>
            {loading && (
              <div className='absolute top-0 left-0 w-full h-full flex justify-center items-center'>
                <Spinner />
              </div>
            )}
            <video
              ref={videoRef}
              onCanPlayThrough={handleVideoLoad}
              onPause={handleVideoPause}
              onEnded={handleVideoEnd}
              className={`w-full h-full ${loading ? 'hidden' : 'block'}`}
              src={videoUrl}
              controls
              autoPlay
            />
          </div>
        </div>
      </div>
    )
  );
};

const HomeSkeleton = () => {
  return (
    <div className='px-3 lg:px-16 py-3 space-y-5'>
      <div className='w-full mb-4 md:mb-10 animate-pulse'>
        <h1 className='text-[32px] leading-10 font-medium bg-gray-300 h-10 w-3/4'></h1>
      </div>

      <div className='w-full flex justify-between items-center'>
        <div className='w-full flex flex-col items-start'>
          <h1 className='text-2xl font-medium text-gray-900 bg-gray-300 h-7 w-1/2'></h1>
          <p className='text-sm font-normal text-gray-500 bg-gray-300 h-5 w-3/4'></p>
        </div>
        <div className='w-full'>
          <div className='h-5 bg-gray-300 w-1/4'></div>
        </div>
      </div>

      <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
        {[1, 2, 3, 4].map((index) => (
          <div
            key={index}
            className='w-full h-[250px] flex flex-col justify-between items-start border-[0.5px] rounded-xl border-grey-150 py-5 px-3 space-y-5 focus:outline-blue-600 focus:ring-2 focus:shadow-lg focus:border-blue-600 animate-pulse'
            tabIndex={0}>
            <div className='w-full bg-gray-300 h-14 flex justify-center items-center rounded-full'></div>
            <div className='w-full text-base font-normal bg-gray-300 h-5'></div>
            <div className={`w-full text-sm flex justify-between font-normal bg-gray-300 h-5`}>
              <span className='text-blue-600 bg-gray-300 h-4 w-1/4'></span>
              <span className='text-black-900 bg-gray-300 h-4 w-1/4'></span>
            </div>
          </div>
        ))}
      </div>

      <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-3 items-center border-[0.5px] rounded-xl border-grey-150 p-3'>
        <div className='flex flex-col justify-start p-8 animate-pulse'>
          <h1 className='text-black-900 text-2xl font-medium bg-gray-300 h-7 w-3/4'></h1>
          <p className='text-lg font-normal text-black-900 mt-2 bg-gray-300 h-5 w-3/4'></p>
          <div className='mt-4 flex items-center space-x-8'>
            <div className='bg-gray-300 text-white rounded-lg w-32 h-12'></div>
            <div className='text-gray-300 text-sm font-normal mt-2 cursor-pointer bg-gray-300 h-5 w-1/4'></div>
          </div>
        </div>
        <div
          className='rounded-md p-9 relative bg-gray-300'
          style={{
            background: '#145DFF08',
          }}>
          <div className='absolute z-50 inset-0 flex items-center justify-center cursor-pointer'>
            <div className='w-8 h-8 bg-gray-300 rounded-full'></div>
          </div>
          <div className='bg-gray-300 h-48 w-72'></div>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const dispatch = useDispatch();
  const checkListData = useSelector((state) => state.checklists.checklist);
  const cardCheckList = useSelector((state) => state.cardChecklist.cards);
  const userData = JSON.parse(localStorage.getItem('loggedUser'));
  const checkListStatus = useSelector((state) => state.checklists.status);
  const [open, setOpen] = useState(false);

  const [step, setStep] = useState(0);
  const totalSteps = 4;

  console.log('checklist', cardCheckList);

  useEffect(() => {
    const completedCards = cardCheckList.filter((card) => card.completed === true);
    setStep(completedCards.length);
  }, [cardCheckList]);

  const handleModel = () => {
    setOpen(!open);
    const card = cardCheckList.find((card) => card.id === 1);
    if (card) {
      switch (card.status) {
        case 'not started':
          dispatch(startTask(1));
          dispatch(updateTitle({ id: 1, title: 'analytics_video' }));
          break;
        default:
          return;
      }
    } else {
      console.log('Card not found');
    }
  };

  const handleCardClick = (id) => {
    const card = cardCheckList.find((card) => card.id === id);
    if (card) {
      switch (card.status) {
        case 'not started':
          dispatch(startTask(id));
          break;
        default:
          return;
      }
    } else {
      console.log('Card not found');
    }
  };

  const steps = [
    {
      label: 'Introduction AirQo Analytics demo video',
      time: '1 min',
      link: '#',
      func: () => handleModel(),
    },
    {
      label: 'Choose location you most interested in',
      time: '2 min',
      link: '/analytics',
      func: () => handleCardClick(2),
    },
    {
      label: 'Complete your AirQo Analytics profile',
      time: '4 min',
      link: '/settings',
      func: () => handleCardClick(3),
    },
    {
      label: 'Practical ways to reduce air pollution',
      time: '1 min',
      link: '#',
      func: () => handleCardClick(4),
    },
  ];

  return (
    <Layout noBorderBottom>
      {checkListStatus === 'loading' && !checkListData ? (
        <HomeSkeleton />
      ) : (
        <>
          <div className='px-3 lg:px-16 py-3 space-y-5'>
            <div className='w-full mb-4 md:mb-10'>
              <h1 className='text-[32px] leading-10 font-medium'>
                Welcome, <span className='capitalize'>{userData?.firstName}</span> 👋
              </h1>
            </div>

            <div className='w-full flex justify-between items-center'>
              <div className='w-full flex flex-col items-start'>
                <h1 className='text-2xl font-medium text-gray-900'>Onboarding checklist</h1>
                <p className='text-sm font-normal text-gray-500'>
                  We recommend starting with our onboarding checklist.
                </p>
              </div>
              <div className='w-full'>
                <StepProgress step={step} totalSteps={totalSteps} />
              </div>
            </div>

            <div className='w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'>
              {steps.map((step, index) => {
                const card = cardCheckList.find((card) => card.id === index + 1);

                const statusText = card && card.completed === true ? 'Done' : 'Start';
                const statusColor =
                  card && card.completed === true ? 'text-black' : 'text-blue-600';
                const justifyStyle =
                  card && card.completed === true ? 'justify-end' : 'justify-between';

                return (
                  <div
                    key={index}
                    className='w-full h-[250px] flex flex-col justify-between items-start border-[0.5px] rounded-xl border-grey-150 py-5 px-3 space-y-5 focus:outline-blue-600 focus:ring-2 focus:shadow-lg focus:border-blue-600'
                    tabIndex={0}>
                    <div className='w-full'>
                      {card && card.completed === true ? (
                        <div className='w-14 h-14 flex justify-center items-center rounded-full bg-blue-900'>
                          <CheckIcon fill='#FFFFFF' />
                        </div>
                      ) : (
                        <div
                          className='text-base w-14 h-14 flex justify-center items-center font-medium rounded-full'
                          style={{ background: '#F5F5FF' }}>
                          <span className='text-blue-600'>{index + 1}</span>
                        </div>
                      )}
                    </div>
                    <p className='w-full text-base font-normal'>{step.label}</p>

                    <div className={`w-full text-sm flex ${justifyStyle} font-normal`}>
                      {card && card.completed === true ? (
                        <span className={statusColor}>{statusText}</span>
                      ) : (
                        <>
                          <Link href={step.link}>
                            <a onClick={step.func} className={statusColor}>
                              {card && card.status === 'inProgress' ? 'Resume' : statusText}
                            </a>
                          </Link>
                          <span className='text-sm font-normal text-black-900'>{step.time}</span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-3 items-center border-[0.5px] rounded-xl border-grey-150 p-3'>
              <div className='flex flex-col justify-start p-8'>
                <h1 className='text-black-900 text-2xl font-medium'>
                  Track air pollution in places you care about
                </h1>
                <p className='text-lg font-normal text-black-900 mt-2'>
                  Empower yourself with knowledge about the air you breathe; because clean air
                  begins with understanding
                </p>
                <div className='mt-4 flex items-center space-x-8'>
                  <Button
                    path='/analytics'
                    className='bg-blue-900 text-white rounded-lg w-32 h-12'
                    dataTestId='get-started-button'>
                    Start here
                  </Button>
                  <a
                    onClick={handleModel}
                    className='text-blue-600 text-sm font-normal mt-2 cursor-pointer'>
                    Show me how
                  </a>
                </div>
              </div>
              <div
                className='rounded-md p-9 relative'
                style={{
                  background: '#145DFF08',
                }}>
                <div
                  onClick={handleModel}
                  className='absolute z-50 inset-0 flex items-center justify-center cursor-pointer'>
                  <PlayIcon />
                </div>
                <Image src={AnalyticsImage} alt='Analytics Image' width={600} height={350} />
              </div>
            </div>
          </div>

          <CustomModal
            open={open}
            setOpen={setOpen}
            videoUrl={AnalyticsVideo}
            checklistData={cardCheckList}
          />
        </>
      )}
    </Layout>
  );
};

export default withAuth(Home);
