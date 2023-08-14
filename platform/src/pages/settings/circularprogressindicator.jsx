// ProgressIndicator.jsx
import React from 'react';

const ProgressIndicator = ({ toggledCount = 0, total = 3 }) => {
  const percentage = (toggledCount / total) * 100;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = (100 - percentage)/100 * circumference;


  return (
    <div className='relative pr-4'>
      <div className='w-12 h-12 flex justify-center items-center'>
        <span className='text-gray-700 text-xl font-semibold leading-6'>
          {toggledCount}/{total}
        </span>
        <svg className='absolute' width='100' height='100'>
          <circle
            cx='50'
            cy='50'
            r='28'
            fill='none'
            stroke='#ccc'
            strokeWidth='5'
          />
          <circle
            cx='50'
            cy='50'
            r='28'
            fill='none'
            stroke='#2196F3'
            strokeWidth='5'
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform='rotate(-90 50 50)'//fill begins at 12 o'clock
            strokeLinecap='round'//rounded fill
          />
        </svg>
      </div>
    </div>
  );
};

export default ProgressIndicator;
