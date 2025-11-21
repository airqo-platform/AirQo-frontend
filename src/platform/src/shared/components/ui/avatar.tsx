'use client';

import * as React from 'react';
import Image from 'next/image';
import { AqUser03 } from '@airqo/icons-react';
import { cn } from '@/shared/lib/utils';

interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  objectFit?: 'contain' | 'cover';
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      src,
      alt,
      fallback,
      className,
      size = 'md',
      objectFit = 'cover',
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false);

    // Reset error state when src changes
    React.useEffect(() => {
      setImageError(false);
    }, [src]);

    const sizeClasses = {
      sm: 'h-8 w-8',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
      xl: 'h-16 w-16',
    };

    const textSizeClasses = {
      sm: 'text-sm',
      md: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
    };

    const iconSizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
    };

    const getFallbackText = (text: string): string => {
      return text.charAt(0).toUpperCase();
    };

    const getObjectFitClass = (fit: 'contain' | 'cover'): string => {
      return fit === 'contain' ? 'object-contain' : 'object-cover';
    };

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex shrink-0 overflow-hidden rounded-full bg-primary/10',
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {src && !imageError ? (
          <Image
            src={src}
            alt={alt || 'Avatar'}
            fill
            className={cn(
              'aspect-square h-full w-full',
              getObjectFitClass(objectFit)
            )}
            onError={() => setImageError(true)}
          />
        ) : fallback ? (
          <div className="flex h-full w-full items-center justify-center">
            <span
              className={cn('text-primary uppercase', textSizeClasses[size])}
            >
              {getFallbackText(fallback)}
            </span>
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <AqUser03 className={cn('text-primary', iconSizeClasses[size])} />
          </div>
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

export { Avatar };
