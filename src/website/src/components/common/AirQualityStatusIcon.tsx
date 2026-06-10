import type { SVGProps } from 'react';

import type { AirQualityLevel } from '@/utils/airQuality';

interface AirQualityStatusIconProps extends SVGProps<SVGSVGElement> {
  status: AirQualityLevel;
  size?: number | string;
}

type StatusMood =
  | 'smile'
  | 'soft-smile'
  | 'flat'
  | 'grimace'
  | 'frown'
  | 'none';

const STATUS_STYLES: Record<
  AirQualityLevel,
  {
    background: string;
    accent: string;
    mood: StatusMood;
    accentDash: string;
  }
> = {
  good: {
    background: '#8FE6A4',
    accent: '#34C759',
    mood: 'smile',
    accentDash: '92 310',
  },
  moderate: {
    background: '#FFD633',
    accent: '#ECAA06',
    mood: 'soft-smile',
    accentDash: '112 310',
  },
  'unhealthy-sensitive-groups': {
    background: '#FFC170',
    accent: '#FF851F',
    mood: 'flat',
    accentDash: '130 310',
  },
  unhealthy: {
    background: '#FFA6A1',
    accent: '#F7453C',
    mood: 'grimace',
    accentDash: '164 310',
  },
  'very-unhealthy': {
    background: '#DBB6F1',
    accent: '#AC5CD9',
    mood: 'frown',
    accentDash: '208 310',
  },
  hazardous: {
    background: '#F0B1D8',
    accent: '#D95BA3',
    mood: 'frown',
    accentDash: '240 310',
  },
  'no-value': {
    background: '#E1E7EC',
    accent: '#C6D1DB',
    mood: 'none',
    accentDash: '0 400',
  },
};

const renderMouth = (mood: StatusMood, accent: string) => {
  switch (mood) {
    case 'smile':
      return (
        <path
          d="M53 91C61 104 75 111 80 111C85 111 99 104 107 91"
          stroke={accent}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case 'soft-smile':
      return (
        <path
          d="M56 95C64 102 73 106 80 106C87 106 96 102 104 95"
          stroke={accent}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case 'flat':
      return (
        <path
          d="M58 97H102"
          stroke={accent}
          strokeWidth="10"
          strokeLinecap="round"
        />
      );
    case 'grimace':
      return <rect x="58" y="92" width="44" height="10" rx="2" fill={accent} />;
    case 'frown':
      return (
        <path
          d="M56 104C64 92 72 87 80 87C88 87 96 92 104 104"
          stroke={accent}
          strokeWidth="10"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    case 'none':
      return <rect x="66" y="92" width="28" height="10" rx="2" fill={accent} />;
  }
};

export default function AirQualityStatusIcon({
  status,
  size = 24,
  className,
  ...props
}: AirQualityStatusIconProps) {
  const { background, accent, mood, accentDash } = STATUS_STYLES[status];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <circle cx="80" cy="80" r="80" fill={background} />
      <circle
        cx="80"
        cy="80"
        r="60"
        stroke="white"
        strokeWidth="12"
        strokeDasharray="286 90"
        transform="rotate(-100 80 80)"
      />
      {status !== 'no-value' && (
        <circle
          cx="80"
          cy="80"
          r="60"
          stroke={accent}
          strokeWidth="12"
          strokeDasharray={accentDash}
          transform="rotate(-100 80 80)"
        />
      )}
      <circle cx="64" cy="64" r={status === 'no-value' ? 8 : 7} fill={accent} />
      <circle cx="96" cy="64" r={status === 'no-value' ? 8 : 7} fill={accent} />
      {renderMouth(mood, accent)}
    </svg>
  );
}
