import withAuth from '@/core/utils/protectedRoute';
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import CheckIcon from '@/icons/tickIcon';
import Link from 'next/link';
import Button from '@/components/Button';
import Image from 'next/image';
import AnalyticsImage from '@/images/Home/analyticsImage.png';
import PlayIcon from '@/images/Home/playIcon.svg';

const StepProgress = ({ step, totalSteps }) => {
  const radius = 50;
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

const Home = () => {
  const userData = JSON.parse(localStorage.getItem('loggedUser'));

  const [step, setStep] = useState(0);
  const totalSteps = 3;

  const completeStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const steps = [
    {
      label: 'Introduction AirQo Analytics demo video',
      completed: false,
      time: '2 min',
    },
    {
      label: 'Choose location you most interested in',
      completed: false,
      time: '3 min',
    },
    {
      label: 'Complete your AirQo Analytics profile',
      completed: false,
      time: '4 min',
    },
    {
      label: 'Practical ways to reduce air pollution',
      completed: false,
      time: '6 min',
    },
  ];

  return (
    <Layout noBorderBottom>
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
          {steps.map((step, index) => (
            <div
              key={index}
              className='w-full h-[250px] flex flex-col justify-between items-start border-[0.5px] rounded-xl border-grey-150 py-5 px-3 space-y-5 focus:outline-blue-600 focus:ring-2 focus:shadow-lg focus:border-blue-600'
              tabIndex={0}>
              <div className='w-full'>
                {step.completed ? (
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
              <div className={`w-full flex ${step.completed ? 'justify-end' : 'justify-between'} `}>
                <span className='text-sm flex font-normal'>
                  {step.completed ? (
                    <span className='text-black-900'>Done</span>
                  ) : (
                    <Link href='#'>
                      <a className='text-blue-600 cursor-pointer'>Start</a>
                    </Link>
                  )}
                </span>
                {step.completed ? null : (
                  <span className='text-sm font-normal text-black-900'>{step.time}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-3 items-center border-[0.5px] rounded-xl border-grey-150 p-3'>
          <div className='flex flex-col justify-start p-8'>
            <h1 className='text-black-900 text-2xl font-medium'>
              Track air pollution in places you care about
            </h1>
            <p className='text-lg font-normal text-black-900 mt-2'>
              Empower yourself with knowledge about the air you breathe; because clean air begins
              with understanding
            </p>
            <div className='mt-4 flex items-center space-x-8'>
              <Button
                path='#'
                className='bg-blue-900 text-white rounded-lg w-32 h-12'
                dataTestId='get-started-button'>
                Start here
              </Button>

              <Link href='#'>
                <a className='text-blue-600 text-sm font-normal mt-2'>Show me how</a>
              </Link>
            </div>
          </div>
          <div
            className='rounded-md p-9 relative'
            style={{
              background: '#145DFF08',
            }}>
            <div
              onClick={completeStep}
              className='absolute z-50 inset-0 flex items-center justify-center cursor-pointer'>
              <PlayIcon />
            </div>
            <Image src={AnalyticsImage} alt='Analytics Image' width={600} height={350} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default withAuth(Home);
