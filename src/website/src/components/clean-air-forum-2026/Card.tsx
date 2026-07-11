import { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

type CleanAirForum2026CardProps = HTMLAttributes<HTMLDivElement>;

export default function Card({
  className,
  ...props
}: CleanAirForum2026CardProps) {
  return (
    <div
      className={cn(
        'caf-2026-card rounded-[2rem] border p-6 shadow-sm',
        className,
      )}
      {...props}
    />
  );
}
