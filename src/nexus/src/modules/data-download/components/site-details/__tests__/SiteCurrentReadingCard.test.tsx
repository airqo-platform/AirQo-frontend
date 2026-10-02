import React from 'react';
import { render, screen } from '@testing-library/react';
import { SiteCurrentReadingCard } from '../SiteCurrentReadingCard';
import type { AqiConfig } from '@/shared/types/aqi';
import type { RecentReading } from '@/shared/types/api';

const mockAqiConfig: AqiConfig = {
  pollutant: 'pm2_5',
  standard: 'test',
  source: 'test',
  version: null,
  effective_from: null,
  ranges: [
    ['good', 'Good', 9, '#34C759'],
    ['moderate', 'Moderate', 35.4, '#ECAA06'],
    ['u4sg', 'Unhealthy for Sensitive Groups', 55.4, '#FF851F'],
    ['unhealthy', 'Unhealthy', 125.4, '#F7453C'],
    ['very_unhealthy', 'Very Unhealthy', 225.4, '#AC5CD9'],
    ['hazardous', 'Hazardous', null, '#D95BA3'],
  ].map(([key, label, max_value, color], index) => ({
    key: key as AqiConfig['ranges'][number]['key'],
    label: label as string,
    min_value: [0, 9.1, 35.5, 55.5, 125.5, 225.5][index],
    max_value: max_value as number | null,
    color: color as string,
    display_order: index + 1,
  })),
};

jest.mock('@/shared/providers/aqi-config-provider', () => ({
  useAqiConfig: () => ({ config: mockAqiConfig }),
}));

jest.mock('@/shared/components/ui/card', () => ({
  Card: ({ children, className }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={className}>{children}</div>
  ),
  CardContent: ({
    children,
    className,
  }: React.HTMLAttributes<HTMLDivElement>) => (
    <div className={className}>{children}</div>
  ),
}));

const reading = {
  aqi_index: 75,
  aqi_category: 'Moderate',
  time: '2026-10-02T12:00:00.000Z',
  pm2_5: { value: 22.2 },
  pm10: { value: 43.7 },
} as unknown as RecentReading;

describe('SiteCurrentReadingCard', () => {
  it('shows the AQI index from the reading separately from PM concentration', () => {
    render(<SiteCurrentReadingCard reading={reading} />);

    expect(
      screen.getByRole('img', { name: 'Air quality index: 75, Moderate' })
    ).toBeInTheDocument();
    expect(screen.getByText('22.2')).toBeInTheDocument();
    expect(screen.getByText('43.7')).toBeInTheDocument();
    expect(screen.getByText(/Current value 75/)).toBeInTheDocument();
  });
});
