import React from 'react';
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

export default StepProgress;
