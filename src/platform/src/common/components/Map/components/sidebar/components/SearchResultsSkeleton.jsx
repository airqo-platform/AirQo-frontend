import React from 'react';

const SearchResultsSkeleton = () => {
  const numElements = 6;
  return (
    <div className="flex flex-col gap-4 animate-pulse px-4 mt-5">
      {Array.from({ length: numElements }).map((_, i) => (
        <div
          key={i}
          className="bg-secondary-neutral-dark-50 rounded-xl w-full h-16"
        />
      ))}
    </div>
  );
};

export default SearchResultsSkeleton;
