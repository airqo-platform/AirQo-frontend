import React from 'react';
import { render, screen } from '@testing-library/react';
import { SiteHealthRecommendationsCard } from '../SiteHealthRecommendationsCard';
import type { HealthTip, RecentReading } from '@/shared/types/api';

jest.mock('@/shared/providers/aqi-config-provider', () => ({
  useAqiConfig: () => ({
    config: { pollutant: 'pm2_5', standard: 'WHO', ranges: [] },
  }),
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

const tip = (overrides: Partial<HealthTip>): HealthTip => ({
  title: 'For pregnant women',
  description: 'Reduce the intensity of your outdoor activities.',
  image: 'https://example.test/pregnant.png',
  tag_line: 'Air quality is unhealthy for sensitive people.',
  ...overrides,
});

const readingWith = (overrides: Partial<RecentReading> = {}): RecentReading =>
  ({
    site_id: 'site-1',
    time: '2026-09-30T18:00:00.000Z',
    aqi_index: 126,
    aqi_category: 'Unhealthy for Sensitive Groups',
    pm2_5: { value: 45.67 },
    health_tips: [],
    ...overrides,
  }) as unknown as RecentReading;

describe('SiteHealthRecommendationsCard', () => {
  it('renders every health tip returned by the API', () => {
    render(
      <SiteHealthRecommendationsCard
        reading={readingWith({
          health_tips: [
            tip({
              title: 'Unhealthy for Sensitive Groups',
              description:
                'Sensitive individuals should reduce intense activity.',
            }),
            tip({
              title: 'For elderly people',
              description: 'Reduce the intensity of your outdoor activities.',
            }),
            tip({
              title: 'For Children',
              description: 'Keep outdoor play shorter on high-pollution days.',
            }),
          ],
        })}
      />
    );

    // The reported bug: tips exist in the payload but were never rendered.
    expect(screen.getByText('For elderly people')).toBeInTheDocument();
    expect(screen.getByText('For Children')).toBeInTheDocument();
    expect(
      screen.getByText('Unhealthy for Sensitive Groups')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Reduce the intensity of your outdoor activities.')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Keep outdoor play shorter on high-pollution days.')
    ).toBeInTheDocument();
    expect(screen.queryByText('No health recommendations yet')).toBeNull();
  });

  it('does not repeat a tip as both headline and list item', () => {
    render(
      <SiteHealthRecommendationsCard
        reading={readingWith({
          health_tips: [tip({ title: 'For pregnant women' })],
        })}
      />
    );

    expect(screen.getAllByText('For pregnant women')).toHaveLength(1);
  });

  it('shows the tip artwork when the API provides it', () => {
    render(
      <SiteHealthRecommendationsCard
        reading={readingWith({
          health_tips: [tip({ image: 'https://example.test/child.png' })],
        })}
      />
    );

    const image = screen.getByRole('presentation', { hidden: true });
    expect(image).toHaveAttribute('src', 'https://example.test/child.png');
    // Decorative: the tip title already carries the meaning.
    expect(image).toHaveAttribute('alt', '');
  });

  it('falls back to built-in guidance when a reading has no tips', () => {
    render(<SiteHealthRecommendationsCard reading={readingWith()} />);

    expect(screen.queryByText('No health recommendations yet')).toBeNull();
    expect(
      screen.getByText(
        'Children, elderly, and people with heart or lung conditions should reduce prolonged outdoor exertion.'
      )
    ).toBeInTheDocument();
  });

  it('uses the AQI category when no PM2.5 value is present', () => {
    render(
      <SiteHealthRecommendationsCard
        reading={readingWith({
          aqi_category: 'Very Unhealthy',
          pm2_5: undefined,
        })}
      />
    );

    expect(
      screen.getByText(
        'Everyone should avoid prolonged outdoor exertion. Move activities indoors or reschedule.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByText('No health recommendations yet')).toBeNull();
  });

  it('shows the empty state only when there is genuinely no reading', () => {
    render(<SiteHealthRecommendationsCard reading={null} />);

    expect(
      screen.getByText('No health recommendations yet')
    ).toBeInTheDocument();
  });

  it('renders a skeleton while the reading is in flight', () => {
    const { container } = render(
      <SiteHealthRecommendationsCard reading={null} isLoading />
    );

    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(
      0
    );
    expect(screen.queryByText('No health recommendations yet')).toBeNull();
  });
});
