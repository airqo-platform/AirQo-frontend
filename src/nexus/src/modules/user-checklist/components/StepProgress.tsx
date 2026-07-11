import React from 'react';
import { useTheme } from '@/modules/themes/hooks/useTheme';

interface StepProgressProps {
  step: number;
  totalSteps: number;
}

/**
 * Circular progress indicator showing step/totalSteps using the application's primary color.
 * @param {number} step - Current completed steps.
 * @param {number} totalSteps - Total number of steps.
 */
const StepProgress: React.FC<StepProgressProps> = ({ step, totalSteps }) => {
  const { theme } = useTheme();
  const progressColor = theme.primaryColor || '#1649e5'; // fallback to default primary
  const radius = 45;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (step / totalSteps) * circumference;

  return (
    // Use explicit classes for stroke colors to ensure contrast.
    // We'll render the progress circle with a neutral background track and a vivid foreground arc.
    <div className="flex items-center justify-end">
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

        {/* Background track - slightly darker neutral for contrast */}
        <circle
          style={{ stroke: '#e6eef8' }} /* very light bluish track */
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />

        {/* Progress indicator - vivid foreground */}
        <circle
          fill="transparent"
          strokeWidth={stroke}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            stroke: progressColor,
            transition: 'stroke-dashoffset 300ms ease',
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
          fontSize="16px"
          dy=".4em"
        >
          {step}/{totalSteps}
        </text>
      </svg>
    </div>
  );
};

export default StepProgress;
