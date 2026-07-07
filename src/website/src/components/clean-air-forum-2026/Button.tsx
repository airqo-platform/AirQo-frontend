import { ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils/cn';

type CleanAirForum2026ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({
  className,
  type = 'button',
  ...props
}: CleanAirForum2026ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        'caf-2026-button inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition-colors',
        className,
      )}
      {...props}
    />
  );
}
