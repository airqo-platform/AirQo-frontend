'use client';

import { useEffect, useState } from 'react';

import { DEVCON_COUNTDOWN_TARGET } from '@/lib/devcon';
import { cn } from '@/lib/utils';

type CountdownTimerProps = {
  targetDate?: string;
  compact?: boolean;
  className?: string;
};

type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const EMPTY_COUNTDOWN: CountdownParts = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
};

const getTimeLeft = (targetDate: string): CountdownParts => {
  const difference = new Date(targetDate).getTime() - Date.now();

  if (difference <= 0) {
    return EMPTY_COUNTDOWN;
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
};

const padValue = (value: number): string => String(value).padStart(2, '0');

const CountdownTimer = ({
  targetDate = DEVCON_COUNTDOWN_TARGET,
  compact = false,
  className,
}: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<CountdownParts>(() =>
    getTimeLeft(targetDate),
  );

  useEffect(() => {
    const tick = () => setTimeLeft(getTimeLeft(targetDate));

    tick();
    const timer = window.setInterval(tick, 1000);

    return () => window.clearInterval(timer);
  }, [targetDate]);

  const units = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-3 sm:grid-cols-4',
        compact ? 'gap-2' : 'gap-3 md:gap-4',
        className,
      )}
      aria-label="Countdown to AirQo DevCon 2026"
    >
      {units.map((unit) => (
        <div
          key={unit.label}
          className={cn(
            'rounded-lg border border-blue-100 bg-white text-center shadow-sm',
            compact ? 'px-3 py-3' : 'px-4 py-5 md:px-5 md:py-6',
          )}
        >
          <div
            className={cn(
              'font-semibold leading-none tracking-tight text-gray-900',
              compact ? 'text-2xl' : 'text-4xl md:text-5xl',
            )}
            suppressHydrationWarning
          >
            {padValue(unit.value)}
          </div>
          <div
            className={cn(
              'mt-2 font-semibold uppercase tracking-[0.18em] text-blue-700',
              compact ? 'text-[10px]' : 'text-xs',
            )}
          >
            {unit.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CountdownTimer;
