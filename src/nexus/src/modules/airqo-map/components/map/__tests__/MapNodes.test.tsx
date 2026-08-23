import React from 'react';
import { render } from '@testing-library/react';
import { MapNodes } from '../MapNodes';
import type { AirQualityReading, ClusterData } from '../MapNodes';
import type { MapReading } from '@/shared/types/api';

/**
 * Regression tests for the CodeRabbit finding: a reading whose ONLY change is
 * its AQI category (`aqiCategory` or `fullReadingData.aqi_category`) must
 * invalidate the React.memo comparator and refresh the rendered icon.
 *
 * These tests exercise MapNodes' REAL memo comparator and rendering. Only
 * external dependencies are mocked:
 * - `../CustomTooltip` — pulls flowbite-react/@popperjs which is irrelevant
 *   to memoisation; replaced with a passthrough that renders children.
 * - `@airqo/icons-react` — swapped for stubs tagged with `data-testid` so the
 *   currently rendered icon can be asserted deterministically in jsdom.
 */

jest.mock('@airqo/icons-react', () => {
  const React = jest.requireActual('react');
  const makeIcon = (name: string) => {
    const Icon = (props: { className?: string }) =>
      React.createElement('svg', {
        'data-testid': `aqi-icon-${name}`,
        className: props.className,
      });
    Icon.displayName = name;
    return Icon;
  };
  return {
    AqGood: makeIcon('good'),
    AqModerate: makeIcon('moderate'),
    AqUnhealthyForSensitiveGroups: makeIcon('unhealthy-sensitive-groups'),
    AqUnhealthy: makeIcon('unhealthy'),
    AqVeryUnhealthy: makeIcon('very-unhealthy'),
    AqHazardous: makeIcon('hazardous'),
    AqNoValue: makeIcon('no-value'),
    AqArrowDown: makeIcon('arrow-down'),
    AqArrowUp: makeIcon('arrow-up'),
  };
});

jest.mock('../CustomTooltip', () => {
  const React = jest.requireActual('react');
  return {
    CustomTooltip: ({ children }: { children?: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

const baseReading: AirQualityReading = {
  id: 'site-1',
  siteId: 'site-1',
  longitude: 32.58,
  latitude: 0.34,
  pm25Value: 12,
  pm10Value: 20,
  lastUpdated: '2026-01-01T00:00:00Z',
  provider: 'airqo',
};

/** Minimal raw-API payload stub — display resolution only reads aqi_category. */
const makeFullReadingData = (aqiCategory: string): MapReading =>
  ({ aqi_category: aqiCategory }) as unknown as MapReading;

describe('MapNodes memo comparator — category awareness', () => {
  it('re-renders an individual node when only aqiCategory changes', () => {
    const view = render(
      <MapNodes reading={{ ...baseReading, aqiCategory: 'moderate' }} />
    );

    expect(
      view.container.querySelector('[data-testid="aqi-icon-moderate"]')
    ).toBeInTheDocument();

    // Same id / pm25Value / pm10Value / status — ONLY the API category changed.
    view.rerender(
      <MapNodes reading={{ ...baseReading, aqiCategory: 'unhealthy' }} />
    );

    expect(
      view.container.querySelector('[data-testid="aqi-icon-unhealthy"]')
    ).toBeInTheDocument();
    expect(
      view.container.querySelector('[data-testid="aqi-icon-moderate"]')
    ).not.toBeInTheDocument();
  });

  it('re-renders an individual node when only fullReadingData.aqi_category changes', () => {
    const view = render(
      <MapNodes
        reading={{
          ...baseReading,
          fullReadingData: makeFullReadingData('good'),
        }}
      />
    );

    expect(
      view.container.querySelector('[data-testid="aqi-icon-good"]')
    ).toBeInTheDocument();

    view.rerender(
      <MapNodes
        reading={{
          ...baseReading,
          fullReadingData: makeFullReadingData('hazardous'),
        }}
      />
    );

    expect(
      view.container.querySelector('[data-testid="aqi-icon-hazardous"]')
    ).toBeInTheDocument();
    expect(
      view.container.querySelector('[data-testid="aqi-icon-good"]')
    ).not.toBeInTheDocument();
  });

  it('re-renders a cluster when only a member fullReadingData.aqi_category changes', () => {
    // memberA has no category info → best icon resolves to 'no-value';
    // memberB carries the API category → worst icon follows it.
    const memberA: AirQualityReading = {
      ...baseReading,
      id: 'site-a',
      siteId: 'site-a',
      pm25Value: 5,
      pm10Value: 8,
    };
    const memberB: AirQualityReading = {
      ...baseReading,
      id: 'site-b',
      siteId: 'site-b',
      pm25Value: 30,
      pm10Value: 45,
    };

    const clusterWithMemberBCategory = (aqiCategory: string): ClusterData => ({
      id: 'cluster-1',
      longitude: 32.58,
      latitude: 0.34,
      pointCount: 2,
      readings: [
        memberA,
        { ...memberB, fullReadingData: makeFullReadingData(aqiCategory) },
      ],
    });

    const view = render(
      <MapNodes cluster={clusterWithMemberBCategory('moderate')} />
    );

    expect(
      view.container.querySelector('[data-testid="aqi-icon-moderate"]')
    ).toBeInTheDocument();

    view.rerender(
      <MapNodes cluster={clusterWithMemberBCategory('unhealthy')} />
    );

    expect(
      view.container.querySelector('[data-testid="aqi-icon-unhealthy"]')
    ).toBeInTheDocument();
    expect(
      view.container.querySelector('[data-testid="aqi-icon-moderate"]')
    ).not.toBeInTheDocument();
  });
});
