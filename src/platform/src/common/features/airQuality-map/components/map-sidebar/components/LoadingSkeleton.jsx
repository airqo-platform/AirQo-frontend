import Card from '@/components/CardWrapper';
import React from 'react';

const LoadingSkeleton = React.memo(() => (
  <Card className="animate-pulse" bordered={false}>
    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md mb-3" />
    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md mb-3" />
    <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded-md" />
  </Card>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';
export default LoadingSkeleton;
