import React from 'react';

import { cn } from '@/lib/utils';

interface DividerProps {
  className?: string;
}

const Divider: React.FC<DividerProps> = ({ className }) => {
  return (
    <div
      className={cn('bg-blue-50 py-2 max-w-5xl mx-auto px-4 w-full', className)}
    ></div>
  );
};

export default Divider;
