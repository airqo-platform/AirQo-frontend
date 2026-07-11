import { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

type CleanAirForum2026BadgeProps = HTMLAttributes<HTMLSpanElement>;

export default function Badge({
  className,
  ...props
}: CleanAirForum2026BadgeProps) {
  return (
    <span
      className={cn(
        'caf-2026-badge inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold',
        className,
      )}
      {...props}
    />
  );
}
