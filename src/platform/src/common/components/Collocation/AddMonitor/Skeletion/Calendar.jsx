import React from 'react';
import { Skeleton } from './Skeleton';

export const Calendar = () => (
  <div className="border border-skeleton rounded-tr-lg rounded-br-lg md:max-w-[304px] w-full h-full p-5 pr-6 pt-6 mr-6 space-y-2">
    <Skeleton className="max-w-[257px] h-6 mb-2" />
    <Skeleton className="max-w-[220px] h-4 mb-6" />
    <div className="space-y-1">
      <Skeleton className="h-10" />
      <Skeleton className="h-10" />
      <Skeleton className="h-10" />
      <Skeleton className="h-10 mb-12" />
      <Skeleton className="h-10 mb-12" />
      <Skeleton className="h-[210px] mb-24" />
    </div>
  </div>
);

export default Calendar;
