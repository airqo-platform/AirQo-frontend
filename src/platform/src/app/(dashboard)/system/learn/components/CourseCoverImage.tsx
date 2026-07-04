'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AqBookOpen01, AqEye } from '@airqo/icons-react';

interface CourseCoverImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  aspectRatio?: string;
}

type ImageState = 'idle' | 'loading' | 'loaded' | 'error';

const CourseCoverImage: React.FC<CourseCoverImageProps> = ({
  src,
  alt,
  className = '',
  fallbackClassName = '',
  aspectRatio = '16/9',
}) => {
  const imgRef = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<ImageState>(src ? 'loading' : 'idle');

  useEffect(() => {
    if (!src) {
      setState('idle');
      return;
    }

    const img = imgRef.current;
    if (!img) {
      setState('loading');
      return;
    }

    if (img.complete && img.naturalWidth > 0) {
      setState('loaded');
    } else {
      setState('loading');
    }
  }, [src]);

  const handleLoad = useCallback(() => {
    setState('loaded');
  }, []);

  const handleError = useCallback(() => {
    setState('error');
  }, []);

  const showImage = src && (state === 'loading' || state === 'loaded');

  return (
    <div
      className={`relative overflow-hidden bg-muted ${className}`}
      style={{ aspectRatio }}
    >
      {state === 'loading' && (
        <div className="absolute inset-0 z-10 animate-pulse bg-muted/80" />
      )}

      {(state === 'error' || state === 'idle') && (
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/15 via-primary/8 to-muted ${fallbackClassName}`}
        >
          <AqBookOpen01 className="h-10 w-10 text-primary/40" />
          <span className="max-w-[80%] text-center text-xs text-muted-foreground">
            {state === 'error' ? 'Image failed to load' : 'No cover image'}
          </span>
          {state === 'error' && src && /^https?:\/\//i.test(src) && (
            <a
              href={src}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
              onClick={e => e.stopPropagation()}
            >
              <AqEye className="h-3 w-3" />
              View source
            </a>
          )}
        </div>
      )}

      {showImage ? (
        <CoverImage
          ref={imgRef}
          src={src}
          alt={alt}
          state={state}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : null}
    </div>
  );
};

interface CoverImageProps {
  src: string;
  alt: string;
  state: ImageState;
  onLoad: () => void;
  onError: () => void;
}

const CoverImage = React.forwardRef<HTMLImageElement, CoverImageProps>(
  ({ src, alt, state, onLoad, onError }, ref) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      onLoad={onLoad}
      onError={onError}
      className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
        state === 'loaded' ? 'opacity-100' : 'opacity-0'
      }`}
    />
  )
);

CoverImage.displayName = 'CoverImage';

export default CourseCoverImage;
