'use client';

import React from 'react';
import { AqGlobe05 } from '@airqo/icons-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  getAirQualityColor,
  getAirQualityIcon,
  mapAqiCategoryToLevel,
} from '@/shared/utils/airQuality';
import { formatHomeTimestamp } from '../utils';
import { READINGS_HREF } from '../constants';
import type { HomeLocationUpdate } from '../types';

export const PlaceUpdateCard = ({
  location,
  onOpen,
}: {
  location: HomeLocationUpdate;
  onOpen: () => void;
}) => {
  const level = mapAqiCategoryToLevel(location.aqiCategory ?? undefined);
  const hasReading = location.aqiIndex !== null && level !== 'no-value';
  const StatusIcon = hasReading ? getAirQualityIcon(level) : AqGlobe05;
  const statusColor = hasReading ? getAirQualityColor(level) : undefined;

  return (
    <Card
      // `border-t-border` is required: without an explicit colour the 3px
      // status strip falls back to `currentColor` and renders as a dark bar.
      // The inline borderTopColor below overrides it with the AQI category
      // colour when a reading exists.
      className="flex h-full flex-col overflow-hidden border-t-[3px] border-t-border ring-1 ring-transparent transition-all hover:shadow-md hover:ring-primary/25 motion-reduce:transition-none"
      style={statusColor ? { borderTopColor: statusColor } : undefined}
      data-testid="home-place-update"
    >
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 p-4">
        <div className="min-w-0">
          <CardTitle className="truncate text-base font-medium text-foreground">
            {location.name}
          </CardTitle>
          <CardDescription className="mt-1 text-xs">
            {formatHomeTimestamp(location.measuredAt) || 'Saved place'}
          </CardDescription>
        </div>
        <span
          className="shrink-0 text-muted-foreground"
          style={statusColor ? { color: statusColor } : undefined}
        >
          <StatusIcon className="h-7 w-7" />
        </span>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-2 px-4 pb-2 pt-1">
        <div>
          <span className="text-2xl font-semibold tabular-nums text-foreground">
            {location.aqiIndex ?? '—'}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">AQI</span>
        </div>
        <span
          className="max-w-[55%] truncate text-right text-sm font-medium text-muted-foreground"
          style={statusColor ? { color: statusColor } : undefined}
        >
          {location.aqiCategory || 'No reading yet'}
        </span>
      </CardContent>
      {/* mt-auto pins the action to the bottom so cards of equal height line up
          the same way the other home cards do. */}
      <CardFooter className="mt-auto border-t border-border bg-muted/20 px-2 py-1">
        <Button
          variant="text"
          size="sm"
          path={location.href || READINGS_HREF}
          onClick={onOpen}
          showTextOnMobile
        >
          See readings
        </Button>
      </CardFooter>
    </Card>
  );
};
