import Image from 'next/image';
import React, { useState } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  fill?: boolean;
  sizes?: string;
  quality?: number;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
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

  const handleLoad = () => {
    setImageLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    onError?.();
  };

  // Fallback image placeholder
  const fallbackSrc = '/assets/images/placeholder.webp';

  // Generate optimized sizes attribute
  const getSizes = () => {
    if (sizes) return sizes;
    if (fill) return '100vw';
    if (width) {
      if (width < 640) return `${width}px`;
      if (width < 1024) return '(max-width: 640px) 100vw, 50vw';
      return '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    }
    return '100vw';
  };

  // Generate blur placeholder for better loading experience
  const generateBlurDataURL = () => {
    if (blurDataURL) return blurDataURL;
    return 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=';
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {!imageLoaded && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"
          style={{
            width: fill ? '100%' : width,
            height: fill ? '100%' : height,
          }}
        />
      )}
      <Image
        src={imageError ? fallbackSrc : src}
        alt={alt}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        fill={fill}
        priority={priority}
        quality={quality}
        sizes={getSizes()}
        placeholder={placeholder}
        blurDataURL={generateBlurDataURL()}
        onLoad={handleLoad}
        onError={handleError}
        className={`transition-opacity duration-500 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        } ${fill ? 'object-cover' : ''}`}
        loading={priority ? 'eager' : 'lazy'}
      />
      {imageError && !imageLoaded && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400"
          style={{
            width: fill ? '100%' : width,
            height: fill ? '100%' : height,
          }}
        >
          <span className="text-xs">Image unavailable</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;
