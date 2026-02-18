'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';
import { Card } from '@/shared/components/ui/card';
import { MapHeader } from './MapHeader';
import { CountryList } from './CountryList';
import { LocationsList } from './LocationsList';
import { LocationDetailsPanel } from './LocationDetailsPanel';
import type { MapReading } from '../../../../shared/types/api';
import type { AirQualityReading } from '../map/MapNodes';
import type { PollutantType } from '@/shared/utils/airQuality';

interface LocationData {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface MapSidebarProps {
  children?: React.ReactNode;
  className?: string;
  onSearch?: (query: string) => void;
  onCountrySelect?: (countryCode: string) => void;
  onLocationSelect?: (
    locationId: string,
    locationData?: { latitude: number; longitude: number; name: string }
  ) => void;
  selectedCountry?: string;
  searchQuery?: string;
  selectedLocation?: LocationData | null;
  selectedMapReading?: MapReading | AirQualityReading | null;
  selectedLocationId?: string | null;
  onBackToList?: () => void;
  locationDetailsLoading?: boolean;
  selectedPollutant?: PollutantType;
  cohort_id?: string;
  isOrganizationFlow?: boolean;
}

export const MapSidebar: React.FC<MapSidebarProps> = ({
  children,
  className,
  onSearch,
  onCountrySelect,
  onLocationSelect,
  selectedCountry = 'uganda',
  searchQuery = '',
  selectedLocation = null,
  selectedMapReading = null,
  selectedLocationId = null,
  onBackToList,
  locationDetailsLoading = false,
  selectedPollutant = 'pm2_5',
  cohort_id,
  isOrganizationFlow = false,
}) => {
  const hasSearch = searchQuery.trim().length > 0;
  const hasActiveLocation = !!(selectedLocation || selectedMapReading);

  return (
    /**
     * HEIGHT APPROACH — why we use inline style instead of Tailwind h-* classes
     * ─────────────────────────────────────────────────────────────────────────
     * Tailwind's h-full = "100% of computed parent height".
     * If any ancestor in the tree has height:auto (default block behavior),
     * the chain resolves to content-height — meaning content INSIDE dictates
     * the sidebar's height, which is the exact bug we're fixing.
     *
     * By setting an explicit dvh (dynamic viewport height) via inline style,
     * we break the chain completely. This element knows its own height
     * independent of every ancestor.
     *
     * Desktop: calc(100dvh - 64px)  → full viewport minus nav bar
     * Mobile:  55dvh                → bottom 55% of viewport (map gets 45dvh)
     *
     * The mobile value is set in MapPage on the wrapper div via inline style,
     * and we set height:100% here so MapSidebar fills that wrapper exactly.
     * The wrapper's overflow:hidden is the containment wall for mobile.
     *
     * For desktop, MapSidebar sets its own height directly since it's not
     * constrained by a wrapper in the same way.
     *
     * We use a data attribute to switch between the two contexts so the
     * parent (MapPage) can control which height rule applies.
     */
    <Card
      className={cn(
        'flex flex-col overflow-hidden',
        'min-w-full lg:max-w-80 lg:min-w-80 pb-20 md:pb-0',
        'rounded-none md:rounded-lg',
        className
      )}
      style={
        {
          /**
           * --sidebar-height is set by MapPage on the wrapper div.
           * Desktop wrapper sets: --sidebar-height: calc(100dvh - 64px)
           * Mobile wrapper sets:  --sidebar-height: 55dvh
           * Fallback if neither is set: full viewport minus typical nav.
           */
          height: 'var(--sidebar-height, calc(100dvh - 64px))',
        } as React.CSSProperties
      }
    >
      {children ? (
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      ) : hasActiveLocation ? (
        /**
         * Location details view
         *
         * overflow-hidden (not overflow-y-auto) because LocationDetailsPanel
         * owns its own internal scroll. Accordion/section expansion must scroll
         * inside the panel — not push the panel height outward.
         *
         * ⚠️  REQUIREMENT on LocationDetailsPanel's root element:
         *       className="h-full flex flex-col overflow-hidden"
         *     on its scrollable content area:
         *       className="flex-1 min-h-0 overflow-y-auto"
         */
        <div className="flex-1 min-h-0 overflow-hidden">
          <LocationDetailsPanel
            locationData={selectedLocation ?? undefined}
            mapReading={selectedMapReading ?? undefined}
            onBack={onBackToList}
            loading={locationDetailsLoading}
            selectedPollutant={selectedPollutant}
          />
        </div>
      ) : (
        /**
         * Location list view — three-part flex column
         *
         * [flex-none] Header        never grows, never shrinks
         * [flex-none] CountryList   never grows, never shrinks
         * [flex-1 min-h-0 scroll]   LocationsList — takes remaining space, scrolls
         *
         * flex-none is the key: these sections cannot participate in flex space
         * distribution so expanding them has zero effect on the list below or
         * the Card's overall height.
         *
         * min-h-0 on the list overrides the browser's default min-height:auto
         * on flex children — without it the list would still expand the Card.
         */
        <>
          <div className="flex-none">
            <MapHeader
              onSearch={onSearch}
              showSearchHeader={hasSearch}
              searchQuery={searchQuery}
            />
          </div>

          {!hasSearch && (
            <div className="flex-none">
              <CountryList
                selectedCountry={selectedCountry}
                onCountrySelect={onCountrySelect}
                cohort_id={cohort_id}
                isOrganizationFlow={isOrganizationFlow}
              />
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-y-auto">
            <LocationsList
              selectedCountry={selectedCountry}
              onLocationSelect={onLocationSelect}
              searchQuery={searchQuery}
              cohort_id={cohort_id}
              selectedLocationId={
                selectedLocationId ??
                (selectedMapReading
                  ? 'site_id' in selectedMapReading
                    ? (selectedMapReading as MapReading).site_id
                    : (selectedMapReading as AirQualityReading).siteId
                  : undefined)
              }
            />
          </div>
        </>
      )}
    </Card>
  );
};

// ─── Re-exports ───────────────────────────────────────────────────────────────
export { MapHeader } from './MapHeader';
export { CountryList } from './CountryList';
export { LocationsList } from './LocationsList';
export { LocationCard, LocationCardSkeleton } from './LocationCard';
export { LocationDetailsPanel } from './LocationDetailsPanel';
export { LocationDetailsSkeleton } from './LocationDetailsSkeleton';
export { SiteInsightsChart } from './SiteInsightsChart';
