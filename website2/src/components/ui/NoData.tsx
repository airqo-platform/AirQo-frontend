import Image_404 from '@public/assets/svgs/402.svg';
import Image from 'next/image';
import React from 'react';

import { cn } from '@/lib/utils';

interface NoDataProps {
  imageSrc?: string;
  altText?: string;
  message?: string;
  className?: string;
}

const NoData: React.FC<NoDataProps> = ({
  imageSrc,
  altText = 'No data available',
  message = 'Sorry, there is no data available at the moment.',
  className = '',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-6',
        className,
      )}
    >
      {/* Image Section */}
      <div className="relative w-full max-w-sm h-64">
        <Image
          src={imageSrc || Image_404}
          alt={altText}
          layout="fill"
          objectFit="contain"
          className="mx-auto"
        />
      </div>

      {/* Text Section */}
      <p className="mt-6 text-lg font-semibold text-gray-600">{message}</p>
    </div>
  );
};

export default NoData;
