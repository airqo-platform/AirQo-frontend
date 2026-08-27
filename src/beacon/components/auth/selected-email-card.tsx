'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SelectedEmailCardProps {
  email?: string;
  onChangeEmail: () => void;
  className?: string;
  label?: string;
  changeLabel?: string;
}

export default function SelectedEmailCard({
  email,
  onChangeEmail,
  className,
  label = 'Signing in as',
  changeLabel = 'Change email',
}: SelectedEmailCardProps) {
  const displayEmail = email || 'your email address';

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-slate-50/90 px-4 py-3 shadow-xs dark:border-slate-700 dark:bg-slate-800/50 sm:px-5 sm:py-3',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3 sm:items-center">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
            {label}
          </div>
          <div
            className="mt-0.5 block truncate text-base sm:text-lg font-semibold text-slate-900 dark:text-white"
            title={displayEmail}
          >
            {displayEmail}
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onChangeEmail}
          className="h-9 shrink-0 rounded-lg border-primary/20 bg-white px-4 text-sm font-semibold text-primary shadow-xs hover:border-primary/30 hover:bg-primary/10 hover:text-primary dark:border-primary/40 dark:bg-slate-900 dark:text-primary dark:hover:bg-slate-800 cursor-pointer"
        >
          {changeLabel}
        </Button>
      </div>
    </div>
  );
}
