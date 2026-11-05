import { render, screen } from '@testing-library/react';

import ExplorePage from '../ExplorePage';

describe('ExplorePage', () => {
  it('presents data tools, the full product suite, and resources', () => {
    render(<ExplorePage />);

    expect(
      screen.getByRole('heading', {
        name: /Find the right way to explore air quality data/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /One place to find every AirQo tool/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', {
        name: /Documents, evidence, and practical guidance/i,
      }),
    ).toBeInTheDocument();
  });

  it('keeps the major data and product destinations discoverable', () => {
    render(<ExplorePage />);

    expect(screen.getAllByText('AirQo Nexus').length).toBeGreaterThan(0);
    expect(screen.getByText('View the live map')).toBeInTheDocument();
    expect(screen.getAllByText('Binos Monitor').length).toBeGreaterThan(0);
    expect(screen.getByText('AirQo Beacon')).toBeInTheDocument();
    expect(screen.getByText('AirQo Vertex')).toBeInTheDocument();
    expect(screen.getByText('AirQo AI Platform')).toBeInTheDocument();
    expect(screen.getByText('Technical documentation')).toBeInTheDocument();
    expect(screen.getByText('Research & publications')).toBeInTheDocument();
  });

  it('uses AirQo product and field imagery instead of a fabricated data panel', () => {
    render(<ExplorePage />);

    expect(
      screen.getByRole('img', {
        name: 'AirQo team members working in the field',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: 'AirQo air quality analytics platform',
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Monitoring network')).not.toBeInTheDocument();
  });

  it('provides safe external destinations for the live data tools', () => {
    render(<ExplorePage />);

    const nexusLinks = screen.getAllByRole('link', {
      name: /Explore live data/i,
    });
    expect(
      nexusLinks.some(
        (link) => link.getAttribute('href') === 'https://nexus.airqo.net/',
      ),
    ).toBe(true);
    expect(
      nexusLinks.some((link) => link.getAttribute('rel')?.includes('noopener')),
    ).toBe(true);
  });
});
