'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import { AnalyticsCard } from '@/modules/analytics';
import { EmptyState } from '@/shared/components/ui';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import { AqArrowLeft, AqArrowRight, AqChevronDown } from '@airqo/icons-react';
import type { AqiConfig } from '@/shared/types/aqi';
import type { SiteData } from '@/modules/analytics';
import type { PollutantType } from '../types';
import { cn } from '@/shared/lib/utils';
import { isReportableSiteCard } from '../utils/measurements';

interface SavedLocationsGridProps {
  siteCards: SiteData[];
  pollutant: PollutantType;
  aqiConfig?: AqiConfig | null;
  isLoading?: boolean;
  isRefreshing?: boolean;
  errorMessage?: string | null;
  onRefresh?: () => void;
  onCardClick?: (siteData: SiteData) => void;
  className?: string;
}

/**
 * Preference-driven saved-locations carousel — renders EVERY saved location
 * (no cap) with live readings from GET /devices/readings/recent, the same
 * service and card component the favorites module uses. Scrolled with
 * prev/next controls and native touch swipe.
 */
export const SavedLocationsGrid: React.FC<SavedLocationsGridProps> = ({
  siteCards,
  pollutant,
  aqiConfig = null,
  isLoading = false,
  isRefreshing = false,
  errorMessage = null,
  onRefresh,
  onCardClick,
  className,
}) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);
  const [visibleStart, setVisibleStart] = React.useState(0);
  const [visibleEnd, setVisibleEnd] = React.useState(0);

  // Never display a placeholder no-value card as a healthy zero reading.
  const reportableSiteCards = React.useMemo(
    () => siteCards.filter(isReportableSiteCard),
    [siteCards]
  );
  const hasUsableSites = reportableSiteCards.length > 0;
  const shouldShowSkeleton = isLoading && !hasUsableSites;
  const shouldShowErrorState =
    !isLoading && !hasUsableSites && Boolean(errorMessage);
  const shouldShowNoReadingsState =
    !isLoading && !hasUsableSites && !errorMessage;

  const updateScrollState = React.useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);

    const card = container.querySelector('[data-carousel-card]');
    const cardWidth = card?.clientWidth ?? 0;
    if (cardWidth > 0) {
      const first = Math.max(0, Math.floor(scrollLeft / cardWidth));
      const visibleCount = Math.max(1, Math.round(clientWidth / cardWidth));
      setVisibleStart(first);
      setVisibleEnd(
        Math.min(reportableSiteCards.length, first + visibleCount)
      );
    } else {
      setVisibleEnd(Math.min(reportableSiteCards.length, 1));
    }
  }, [reportableSiteCards.length]);

  React.useEffect(() => {
    updateScrollState();
  }, [reportableSiteCards.length, updateScrollState]);

  React.useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    window.addEventListener('resize', updateScrollState);
    return () => {
      window.removeEventListener('resize', updateScrollState);
    };
  }, [updateScrollState]);

  const scrollByCard = React.useCallback((direction: 1 | -1) => {
    const container = scrollRef.current;
    if (!container) return;
    const cardWidth =
      container.querySelector('[data-carousel-card]')?.clientWidth ?? 300;
    container.scrollBy({
      left: direction * cardWidth * 1.15,
      behavior: 'smooth',
    });
  }, []);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex-row flex-wrap items-start justify-between gap-2 pb-2">
        <div className="min-w-0">
          <CardTitle>Saved Locations</CardTitle>
          <CardDescription>
            Live air quality for the locations your organization tracks — swipe
            or use the arrows to browse. Change them anytime from “Manage
            Locations”.
          </CardDescription>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          {hasUsableSites && reportableSiteCards.length > 1 && (
            <span className="text-xs text-muted-foreground">
              {Math.min(visibleStart + 1, reportableSiteCards.length)}–
              {visibleEnd} of{' '}
              {reportableSiteCards.length}
            </span>
          )}
          <button
            type="button"
            aria-label="Previous locations"
            disabled={!canScrollLeft}
            onClick={() => scrollByCard(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <AqArrowLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Next locations"
            disabled={!canScrollRight}
            onClick={() => scrollByCard(1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          >
            <AqArrowRight className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isRefreshing && hasUsableSites && (
          <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
            <LoadingSpinner size={12} />
            <span>Refreshing latest readings…</span>
          </div>
        )}

        {shouldShowErrorState || shouldShowNoReadingsState ? (
          <EmptyState
            compact
            title={
              shouldShowErrorState
                ? 'Location readings could not be loaded'
                : 'No live readings yet'
            }
            description={
              shouldShowErrorState && errorMessage
                ? errorMessage
                : 'Your saved locations have not reported measurements recently. We will show them here when new readings arrive.'
            }
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
        ) : shouldShowSkeleton ? (
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`saved-location-skeleton-${index}`}
                className="h-[200px] w-[82%] flex-shrink-0 rounded-md border border-border bg-card p-4 shadow-sm sm:w-[48%] lg:w-[31%] xl:w-[23.5%]"
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
            ))}
          </div>
        ) : (
          <div
            ref={scrollRef}
            onScroll={updateScrollState}
            className="-mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-2 [scrollbar-width:thin] [-webkit-overflow-scrolling:touch]"
            role="region"
            aria-label="Saved locations carousel"
          >
            {reportableSiteCards.map(siteData => (
              <div
                key={siteData._id}
                data-carousel-card
                className="w-[82%] flex-shrink-0 snap-start sm:w-[48%] lg:w-[31%] xl:w-[23.5%]"
              >
                <AnalyticsCard
                  siteData={siteData}
                  selectedPollutant={pollutant}
                  aqiConfig={aqiConfig}
                  interactive
                  onClick={() => onCardClick?.(siteData)}
                  className="group h-full transition-shadow hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
                  extraInfo={
                    <div className="flex items-center gap-1 border-t border-border pt-2 text-xs font-medium text-muted-foreground transition-colors group-hover:text-primary">
                      <AqChevronDown className="h-3.5 w-3.5" />
                      Click to view insights
                    </div>
                  }
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
