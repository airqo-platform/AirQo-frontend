import React from 'react';
import cn from 'classnames';

export const Skeleton = ({ className }) => (
  <div className={cn('bg-skeleton rounded animate-pulse', className)} />
);
