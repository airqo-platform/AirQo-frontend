// This component has been consolidated into the unified Skeleton component
// Please use: import { Skeleton } from '@/common/components/Skeleton'
import { Skeleton } from '@/common/components/Skeleton';
import React from 'react';

const SkeletonLoader = ({
  width = '100%',
  height = '300px',
  className = '',
}) => <Skeleton width={width} height={height} className={className} />;

export default React.memo(SkeletonLoader);
