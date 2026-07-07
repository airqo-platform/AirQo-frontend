import Image from 'next/image';
import React from 'react';

import { cn } from '@/lib/utils';

interface EmptyStateProps {
  imageSrc?: string;
  altText?: string;
  title?: string;
  message?: string;
  className?: string;
  children?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  imageSrc,
  altText = 'No data available',
  title = 'No Data Found',
  message = 'Sorry, there is no data available at the moment.',
  className = '',
  children,
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-6',
        className,
      )}
    >
      {imageSrc && (
        <div className="relative w-full max-w-sm h-64">
          <Image
            src={imageSrc}
            alt={altText}
            fill
            className="object-contain mx-auto"
          />
        </div>
      )}

      <h3 className="mt-6 text-xl font-semibold text-gray-800">{title}</h3>
      <p className="mt-2 text-gray-600">{message}</p>
      {children}
    </div>
  );
};

export default EmptyState;
