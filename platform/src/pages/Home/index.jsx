import withAuth from '@/core/utils/protectedRoute';
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import CheckIcon from '@/icons/tickIcon';
import Link from 'next/link';
import Button from '@/components/Button';
import Image from 'next/image';
import AnalyticsImage from '@/images/Home/analyticsImage.png';
import PlayIcon from '@/images/Home/playIcon.svg';
import AnalyticsVideo from '../../../public/videos/analytics.mp4';
import { useSelector, useDispatch } from 'react-redux';
import { startTask, completeTask, updateTitle } from '@/lib/store/services/checklists/CheckList';
import HomeSkeleton from '@/components/skeletons/HomeSkeleton';
import CustomModal from '@/components/Modal/videoModals/CustomModal';
import StepProgress from '@/components/steppers/CircularStepper';

const Home = () => {
  const dispatch = useDispatch();
  const checkListData = useSelector((state) => state.checklists.checklist);
  const cardCheckList = useSelector((state) => state.cardChecklist.cards);
  const userData = JSON.parse(localStorage.getItem('loggedUser'));
  const checkListStatus = useSelector((state) => state.checklists.status);
  const [open, setOpen] = useState(false);

  const [step, setStep] = useState(0);
  const totalSteps = 4;

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
    if (id === 4) {
      dispatch(completeTask(4));
    } else {
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
      link: 'https://blog.airqo.net/',
      func: () => handleCardClick(4),
    },
  ];

  return (
    <Layout noBorderBottom pageTitle='Home'>
      {checkListStatus === 'loading' && checkListData.length === 0 ? (
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
                            <a
                              onClick={step.func}
                              className={statusColor}
                              target={index === 3 ? '_blank' : ''}>
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
