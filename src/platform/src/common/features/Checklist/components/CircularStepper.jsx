import React from 'react';

/**
 * Circular progress indicator showing step/totalSteps.
 * @param {number} step - Current completed steps.
 * @param {number} totalSteps - Total number of steps.
 * @param {string} color - Tailwind color token (e.g., 'primary', 'blue-500').
 */
const StepProgress = ({ step, totalSteps, color = 'primary' }) => {
  const radius = 45;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (step / totalSteps) * circumference;

  return (
    <div className={`flex items-center justify-end text-${color}`}>
      {' '}
      {/* sets currentColor */}
      <svg height={radius * 2} width={radius * 2}>
        <defs>
          <mask id="progress-mask">
            <rect width="100%" height="100%" fill="#fff" />
            <circle
              cx={radius}
              cy={radius}
              r={normalizedRadius - stroke / 2}
              fill="#000"
            />
          </mask>
        </defs>

        {/* Background track */}
        <circle
          className="stroke-gray-200 dark:stroke-gray-700"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* Progress indicator */}
        <circle
          className="stroke-current"
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset,
            transform: 'rotate(-90deg)',
            transformOrigin: '50% 50%',
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          mask="url(#progress-mask)"
        />

        {/* Center text */}
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          fill="currentColor"
          fontSize="18px"
          dy=".4em"
        >
          {step}/{totalSteps}
        </text>
      </svg>
    </div>
  );
};

export default StepProgress;
