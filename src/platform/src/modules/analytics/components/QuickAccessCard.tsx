'use client';

import React, { memo } from 'react';
import PageHeading from '@/shared/components/ui/page-heading';
import FilterBar from './FilterBar';
import { cn } from '@/shared/lib/utils';
import type { QuickAccessLocationsProps } from '../types';
import { AnalyticsCard } from './AnalyticsCard';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import { EmptyState } from '@/shared/components/ui';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';

const QUICK_ACCESS_ERROR_MESSAGE =
  'Your favorites are saved. Refresh to try loading the latest readings again.';

const QUICK_ACCESS_ERROR_TECHNICAL_PATTERNS = [
  /failed to fetch/i,
  /request failed/i,
  /internal server error/i,
  /service unavailable/i,
  /gateway timeout/i,
  /axioserror/i,
  /err_network/i,
  /err_canceled/i,
  /timeout/i,
  /abort/i,
  /exception/i,
  /traceback/i,
  /stack trace/i,
  /token/i,
  /session/i,
  /unauthorized/i,
  /forbidden/i,
  /database/i,
  /sql/i,
];

const isCancellationMessage = (message: string): boolean => {
  const lowerMessage = message.toLowerCase();

  return (
    lowerMessage.includes('aborterror') ||
    lowerMessage.includes('canceled') ||
    lowerMessage.includes('cancelled') ||
    lowerMessage.includes('request aborted') ||
    lowerMessage.includes('request canceled') ||
    lowerMessage.includes('request cancelled')
  );
};

const redactSensitiveTokens = (message: string): string => {
  return message
    .replace(/Bearer\s+[A-Za-z0-9-._~+/]+=*/gi, '[redacted]')
    .replace(
      /\beyJ[A-Za-z0-9-._~+/]+=*\.[A-Za-z0-9-._~+/]+=*(?:\.[A-Za-z0-9-._~+/]+=*)?\b/g,
      '[redacted]'
    )
    .replace(
      /(token|session|accessToken|refreshToken)=([^&\s]+)/gi,
      '$1=[redacted]'
    )
    .replace(/[\w.-]+@[\w.-]+\.\w+/g, '[redacted]')
    .replace(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
      '[redacted]'
    )
    .replace(/[A-Za-z]:\\[\\\w\s.-]+/g, '[redacted]')
    .replace(/\s+/g, ' ')
    .trim();
};

const getDisplayErrorMessage = (
  errorMessage: string | null | undefined
): string | null => {
  if (!errorMessage?.trim()) {
    return null;
  }

  const trimmedMessage = errorMessage.trim();
  if (isCancellationMessage(trimmedMessage)) {
    return null;
  }

  const friendlyMessage = getUserFriendlyErrorMessage(trimmedMessage).trim();
  if (friendlyMessage !== trimmedMessage) {
    const sanitizedFriendlyMessage = redactSensitiveTokens(friendlyMessage);
    return sanitizedFriendlyMessage || QUICK_ACCESS_ERROR_MESSAGE;
  }

  const sanitizedMessage = redactSensitiveTokens(trimmedMessage);
  if (
    !sanitizedMessage ||
    QUICK_ACCESS_ERROR_TECHNICAL_PATTERNS.some(pattern =>
      pattern.test(sanitizedMessage)
    )
  ) {
    return QUICK_ACCESS_ERROR_MESSAGE;
  }

  return sanitizedMessage.length > 140
    ? `${sanitizedMessage.slice(0, 137)}...`
    : sanitizedMessage;
};

export const QuickAccessCard: React.FC<QuickAccessLocationsProps> = memo(
  ({
    sites,
    onManageFavorites,
    onRefresh,
    isRefreshing,
    className,
    title = 'Favorite Locations',
    subtitle = 'Add up to 4 frequently monitored cities for instant access to air quality trends, visualizations, and quick data downloads.',
    infoLine,
    warningBanner,
    showIcon = true,
    onShowIconsChange,
    selectedPollutant,
    isLoading = false,
    placeholderCount = 0,
    errorMessage = null,
    onCardClick,
  }) => {
    const visiblePlaceholderCount = Math.min(Math.max(placeholderCount, 1), 4);
    const hasUsableSites = sites.length > 0;
    const displayErrorMessage = getDisplayErrorMessage(errorMessage);
    const shouldShowSkeleton =
      visiblePlaceholderCount > 0 && isLoading && !hasUsableSites;
    const shouldShowErrorState =
      !isLoading && !hasUsableSites && Boolean(displayErrorMessage);
    const shouldShowAddFavorite =
      !shouldShowSkeleton && !shouldShowErrorState && sites.length < 4;

    return (
      <div className={cn('w-full space-y-4', className)}>
        <PageHeading
          title={title}
          subtitle={subtitle}
          infoLine={
            infoLine ??
            'All air quality data shown here is open, public, and free to download.'
          }
        />

        {/* External filter bar - matches the design in the image (pill style) */}
        <FilterBar
          onManageFavorites={onManageFavorites}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          showIcons={showIcon}
          onShowIconsChange={onShowIconsChange}
        />

        {isRefreshing && sites.length > 0 && !isLoading && (
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground shadow-sm">
              <LoadingSpinner size={12} />
              <span>Refreshing latest readings...</span>
            </div>
          </div>
        )}

        {warningBanner && <div>{warningBanner}</div>}

        {/* Sites Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {shouldShowErrorState ? (
            <div className="col-span-full">
              <EmptyState
                compact={true}
                title="Latest readings could not be loaded"
                description={displayErrorMessage || QUICK_ACCESS_ERROR_MESSAGE}
                action={
                  onRefresh
                    ? {
                        label: 'Refresh',
                        onClick: onRefresh,
                        variant: 'outlined',
                      }
                    : undefined
                }
              />
            </div>
          ) : shouldShowSkeleton ? (
            Array.from({ length: visiblePlaceholderCount }).map((_, index) => (
              <div
                key={`favorite-skeleton-${index}`}
                className="h-[185px] rounded-md border border-border bg-card p-4 shadow-sm"
                aria-hidden="true"
              >
                <div className="animate-pulse space-y-4">
                  <div className="space-y-2">
                    <div className="h-6 w-3/5 rounded bg-muted" />
                    <div className="h-4 w-1/3 rounded bg-muted" />
                  </div>
                  <div className="flex items-center justify-between pt-8">
                    <div className="space-y-3">
                      <div className="h-5 w-8 rounded bg-muted" />
                      <div className="h-8 w-20 rounded bg-muted" />
                    </div>
                    <div className="h-16 w-16 rounded-full bg-muted" />
                  </div>
                </div>
              </div>
            ))
          ) : (
            sites
              .slice(0, 4)
              .map(site => (
                <AnalyticsCard
                  key={site._id}
                  siteData={site}
                  className="w-full"
                  showIcon={showIcon}
                  selectedPollutant={selectedPollutant}
                  onClick={onCardClick || (() => {})}
                />
              ))
          )}

          {shouldShowAddFavorite && (
            <button
              onClick={() => {
                if (onManageFavorites) onManageFavorites();
              }}
              className="w-full h-[185px] border-2 border-dashed border-primary/50 dark:border-primary/80 rounded-md flex items-center justify-center text-primary bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 hover:scale-95 transition-all duration-200 focus:outline-none"
              aria-label="Add Location"
            >
              <div className="text-center">
                <div className="text-lg font-medium">+ Add Favorite</div>
              </div>
            </button>
          )}
        </div>
      </div>
    );
  }
);
QuickAccessCard.displayName = 'QuickAccessCard';
