import React from 'react';
import Skeleton from '@/common/components/Skeleton';

const SearchResultsSkeleton = () => {
  const numElements = 6;
  return (
    <div className="flex flex-col gap-4 px-4 mt-5">
      {Array.from({ length: numElements }).map((_, i) => (
        <Skeleton
          key={i}
          className="rounded-xl w-full h-16"
          variant="rectangular"
        />
      ))}
    </div>
  );
};

export default SearchResultsSkeleton;
