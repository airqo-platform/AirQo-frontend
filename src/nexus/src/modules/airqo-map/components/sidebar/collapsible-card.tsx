'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/components/ui/card';
import { AqChevronUp, AqChevronDown } from '@airqo/icons-react';

interface CollapsibleCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  defaultExpanded?: boolean;
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  children,
  className,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);

  return (
    <Card
      className={cn(
        'border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm',
        className
      )}
    >
      <CardContent className="p-0">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 p-1">
              🚨
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {title}
            </span>
          </div>
          <div className="flex-shrink-0">
            {isExpanded ? (
              <AqChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            ) : (
              <AqChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 pt-2 border-t border-gray-100 dark:border-gray-700">
            {children}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
