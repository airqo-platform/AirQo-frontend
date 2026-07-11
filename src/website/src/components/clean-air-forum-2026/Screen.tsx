import { HTMLAttributes } from 'react';

import { cleanAirForum2026Theme } from '@/features/clean-air-forum-2026/constants/theme';
import { cn } from '@/lib/utils/cn';

type CleanAirForum2026ScreenProps = HTMLAttributes<HTMLElement>;

export default function Screen({
  className,
  children,
  ...props
}: CleanAirForum2026ScreenProps) {
  return (
    <main
      className={cn(
        cleanAirForum2026Theme.pageClassName,
        cleanAirForum2026Theme.textClassName,
        'min-h-screen w-full',
        className,
      )}
      {...props}
    >
      {children}
    </main>
  );
}
