import Image from 'next/image';
import React, { useState } from 'react';

type BaseProps = {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
};
type FillProps = BaseProps & { fill: true; width?: never; height?: never };
type FixedProps = BaseProps & { fill?: false; width: number; height: number };
type OptimizedImageProps = FillProps | FixedProps;

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  fill = false,
  sizes,
  quality = 75,
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleLoad: React.ComponentProps<typeof Image>['onLoad'] = (e) => {
    setImageLoaded(true);
    onLoad?.(e as React.SyntheticEvent<HTMLImageElement, Event>);
  };

  const handleError: React.ComponentProps<typeof Image>['onError'] = (e) => {
    setImageError(true);
    onError?.(e as React.SyntheticEvent<HTMLImageElement, Event>);
  };

  // Fallback image placeholder
  const fallbackSrc = '/assets/images/placeholder.webp';

  // Generate sizes attribute if not provided
  const defaultSizes = fill
    ? '100vw'
    : width && width < 640
      ? `${width}px`
      : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

  return (
    <div className={`relative ${className}`}>
      <Image
        src={imageError ? fallbackSrc : src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={sizes || defaultSizes}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-300 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          objectFit: fill ? 'cover' : undefined,
        }}
      />
      {!imageLoaded && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{
            width: fill ? '100%' : width,
            height: fill ? '100%' : height,
          }}
        />
      )}
    </div>
  );
};

export default OptimizedImage;
