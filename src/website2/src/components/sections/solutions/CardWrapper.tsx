import React from 'react';

import { cn } from '@/lib/utils';

interface CardWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const CardWrapper: React.FC<CardWrapperProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'p-8 md:p-16 rounded-lg max-w-5xl mx-auto bg-[#E9F7EF]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default CardWrapper;
