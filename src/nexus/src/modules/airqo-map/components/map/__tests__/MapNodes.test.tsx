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

/** Complete siteDetails stub (shape reused from selectedLocationSlice.test.ts). */
const mockSiteDetails = {
  _id: 'site-1',
  formatted_name: 'Test Site',
  location_name: 'Test Location',
  search_name: 'test',
  city: 'Kampala',
  district: 'Central',
  county: 'Uganda',
  region: 'East',
  country: 'Uganda',
  name: 'Test',
  approximate_latitude: 0.3476,
  approximate_longitude: 32.5825,
  bearing_in_radians: 0,
  data_provider: 'airqo',
  description: 'Test site',
  site_category: { tags: ['test'], category: 'urban' },
};

/**
 * Fully-typed raw-API reading stub — no casts. Display resolution only reads
 * `aqi_category`; every other field is realistic filler so the fixture
 * satisfies `MapReading` structurally.
 */
const makeFullReadingData = (aqiCategory: string): MapReading => ({
  _id: 'reading-1',
  site_id: 'site-1',
  time: '2026-01-01T00:00:00Z',
  aqi_category: aqiCategory,
  aqi_color: '#34C759',
  aqi_color_name: 'green',
  aqi_index: 42,
  aqi_ranges: {
    good: { min: 0, max: 9.1 },
    moderate: { min: 9.1, max: 35.49 },
    u4sg: { min: 35.49, max: 55.49 },
    unhealthy: { min: 55.49, max: 125.49 },
    very_unhealthy: { min: 125.49, max: 225.49 },
    hazardous: { min: 225.49, max: null },
  },
  averages: {
    dailyAverage: 8,
    percentageDifference: 0,
    weeklyAverages: { currentWeek: 7, previousWeek: 6 },
  },
  createdAt: '2026-01-01T00:00:00Z',
  device: 'device-1',
  device_id: 'device-1',
  frequency: 'hourly',
  health_tips: [],
  is_reading_primary: true,
  no2: { value: null },
  pm10: { value: 20 },
  pm2_5: { value: 12 },
  siteDetails: mockSiteDetails,
  timeDifferenceHours: 1,
  updatedAt: '2026-01-01T00:00:00Z',
});

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

describe('MapNodes memo comparator — cluster member exchanges', () => {
  /**
   * Regression tests for the CodeRabbit finding: the old additive fingerprint
   * produced EQUAL sums when two members exchanged concentrations or
   * categories between themselves, so areEqual returned true and the cluster
   * kept stale icons. The cluster pill renders [BestIcon, WorstIcon] in that
   * DOM order, so asserting icon order proves whether a re-render happened.
   */
  const renderedIconOrder = (container: HTMLElement): string[] =>
    Array.from(container.querySelectorAll('[data-testid^="aqi-icon-"]')).map(
      element => element.getAttribute('data-testid') ?? ''
    );

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

  it('re-renders a cluster when members exchange AQI categories', () => {
    const clusterWithCategories = (
      catA: string,
      catB: string
    ): ClusterData => ({
      id: 'cluster-1',
      longitude: 32.58,
      latitude: 0.34,
      pointCount: 2,
      readings: [
        { ...memberA, aqiCategory: catA },
        { ...memberB, aqiCategory: catB },
      ],
    });

    const view = render(
      <MapNodes cluster={clusterWithCategories('good', 'unhealthy')} />
    );

    // best = site-a (pm25 5) → good; worst = site-b (pm25 30) → unhealthy.
    expect(renderedIconOrder(view.container)).toEqual([
      'aqi-icon-good',
      'aqi-icon-unhealthy',
    ]);

    // Same ids, same concentrations — ONLY the categories swapped places.
    view.rerender(
      <MapNodes cluster={clusterWithCategories('unhealthy', 'good')} />
    );

    expect(renderedIconOrder(view.container)).toEqual([
      'aqi-icon-unhealthy',
      'aqi-icon-good',
    ]);
  });

  it('re-renders a cluster when members exchange pm25/pm10 values', () => {
    const lowMember: AirQualityReading = {
      ...memberA,
      aqiCategory: 'good',
    };
    const highMember: AirQualityReading = {
      ...memberB,
      pm25Value: 150,
      pm10Value: 300,
      aqiCategory: 'hazardous',
    };

    const view = render(
      <MapNodes
        cluster={{
          id: 'cluster-1',
          longitude: 32.58,
          latitude: 0.34,
          pointCount: 2,
          readings: [lowMember, highMember],
        }}
      />
    );

    // best = lowMember (pm25 5) → good; worst = highMember (pm25 150) → hazardous.
    expect(renderedIconOrder(view.container)).toEqual([
      'aqi-icon-good',
      'aqi-icon-hazardous',
    ]);

    // Exchange ALL concentration values between the same member ids;
    // categories stay put. The additive sums are identical on both sides.
    view.rerender(
      <MapNodes
        cluster={{
          id: 'cluster-1',
          longitude: 32.58,
          latitude: 0.34,
          pointCount: 2,
          readings: [
            { ...lowMember, pm25Value: 150, pm10Value: 300 },
            { ...highMember, pm25Value: 5, pm10Value: 8 },
          ],
        }}
      />
    );

    // best is now the second member (pm25 5) → hazardous; worst the first → good.
    expect(renderedIconOrder(view.container)).toEqual([
      'aqi-icon-hazardous',
      'aqi-icon-good',
    ]);
  });
});
