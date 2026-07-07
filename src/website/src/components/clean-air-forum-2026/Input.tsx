import { InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

type CleanAirForum2026InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  className,
  ...props
}: CleanAirForum2026InputProps) {
  return (
    <input
      className={cn(
        'caf-2026-input w-full rounded-2xl border px-4 py-3 text-base outline-none transition-colors',
        className,
      )}
      {...props}
    />
  );
}
