'use client';

import React, { useMemo, useRef, useState, useCallback } from 'react';
import Checkbox from './checkbox';
import { Card, CardContent } from './card';
import { AqXClose } from '@airqo/icons-react';

interface LocationCardProps {
  locationName: string;
  country?: string;
  subtitle?: string;
  deviceName?: string;
  isChecked: boolean;
  onChange?: (checked: boolean) => void;
  onClose?: () => void;
  showCloseButton?: boolean;
  compact?: boolean;
  variant?: 'city' | 'location';
  loading?: boolean;
}

const LocationCard: React.FC<LocationCardProps> = ({
  locationName,
  country,
  subtitle,
  deviceName,
  isChecked,
  onChange,
  onClose,
  showCloseButton = false,
  compact = false,
  variant = 'city',
  loading = false,
}) => {
  const displaySubtitle = variant === 'location' ? subtitle : country;

  // Format name for display by replacing underscores with spaces
  const displayName = locationName.replace(/_/g, ' ');

  // Refs and state for truncation detection
  const nameRef = useRef<HTMLHeadingElement>(null);
  const [isNameTruncated, setIsNameTruncated] = useState(false);

  const checkTruncation = useCallback(() => {
    if (nameRef.current) {
      setIsNameTruncated(
        nameRef.current.scrollWidth > nameRef.current.clientWidth
      );
    }
  }, []);

  // Check truncation on mount and resize
  React.useEffect(() => {
    checkTruncation();
    window.addEventListener('resize', checkTruncation);
    return () => window.removeEventListener('resize', checkTruncation);
  }, [checkTruncation]);

  // Memoize skeleton card to avoid recreation on re-renders
  const skeletonCard = useMemo(
    () => (
      <Card className={`relative ${compact ? 'p-3' : 'p-4'}`}>
        <CardContent className="p-0">
          {/* Skeleton for interactive element */}
          <div className="absolute top-3 right-3">
            <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
          </div>

          <div className="pr-10 space-y-2">
            {/* Skeleton for title */}
            <div
              className={`h-4 bg-muted rounded animate-pulse ${
                compact ? 'w-3/4' : 'w-2/3'
              }`}
            />

            {/* Skeleton for subtitle */}
            <div
              className={`h-3 bg-muted rounded animate-pulse ${
                compact ? 'w-1/2' : 'w-1/3'
              }`}
            />
          </div>
        </CardContent>
      </Card>
    ),
    [compact]
  );

  if (loading) {
    return skeletonCard;
  }

  return (
    <Card
      className={`relative transition-all duration-200 hover:shadow-md ${
        compact ? 'p-3' : 'p-4'
      }`}
    >
      <CardContent className="p-0">
        {/* Interactive element at top right corner */}
        <div className="absolute top-3 right-3 z-10">
          {showCloseButton && onClose ? (
            <button
              onClick={e => {
                e.stopPropagation();
                onClose();
              }}
              className="p-1.5 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors duration-150 flex items-center justify-center"
              aria-label={`Remove ${displayName}`}
            >
              <AqXClose className="w-4 h-4" />
            </button>
          ) : (
            <Checkbox
              checked={isChecked}
              onCheckedChange={onChange}
              className="flex-shrink-0"
            />
          )}
        </div>

        <div className="pr-10 flex flex-col gap-1">
          <h3
            ref={nameRef}
            className={`font-medium text-foreground truncate ${
              compact ? 'text-sm' : 'text-base'
            } ${isNameTruncated ? 'cursor-help' : ''}`}
            title={isNameTruncated ? displayName : undefined}
          >
            {displayName}
          </h3>
          {deviceName && (
            <p
              className={`text-muted-foreground m-0 ${
                compact ? 'text-xs' : 'text-sm'
              }`}
            >
              {deviceName}
            </p>
          )}
          {displaySubtitle && (
            <p
              className={`text-muted-foreground m-0 ${
                compact ? 'text-xs' : 'text-sm'
              }`}
            >
              {displaySubtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationCard;
