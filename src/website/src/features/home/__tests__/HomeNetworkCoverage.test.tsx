import { act, fireEvent, render, screen } from '@testing-library/react';

import { useNetworkCoverageImpact } from '@/hooks/useApiHooks';

import HomeNetworkCoverage from '../HomeNetworkCoverage';

jest.mock('@/hooks/useApiHooks', () => ({
  useNetworkCoverageImpact: jest.fn(),
}));

const mockedUseNetworkCoverageImpact =
  useNetworkCoverageImpact as unknown as jest.Mock;

const sampleHookResult = {
  data: {
    impact: {
      byCountry: [
        { country: 'Uganda', iso2: 'UG', total: 179 },
        { country: 'Kenya', iso2: 'KE', total: 110 },
        { country: 'Nigeria', iso2: 'NG', total: 51 },
      ],
    },
  },
  isLoading: false,
  error: null,
  refetch: jest.fn(),
};

describe('HomeNetworkCoverage', () => {
  const proto = HTMLElement.prototype as unknown as Record<string, unknown>;
  const originalScrollTo = proto.scrollTo;
  const originalScrollBy = proto.scrollBy;
  let scrollToSpy: jest.Mock;
  let scrollBySpy: jest.Mock;

  beforeEach(() => {
    mockedUseNetworkCoverageImpact.mockReturnValue(sampleHookResult);
    scrollToSpy = jest.fn();
    scrollBySpy = jest.fn();
    proto.scrollTo = scrollToSpy;
    proto.scrollBy = scrollBySpy;
  });

  afterEach(() => {
    // Restore global spies before tearing down fake timers so the spy never
    // reinstalls a stale reference over the real timer functions.
    jest.restoreAllMocks();
    jest.useRealTimers();
    if (originalScrollTo === undefined) {
      delete proto.scrollTo;
    } else {
      proto.scrollTo = originalScrollTo;
    }
    if (originalScrollBy === undefined) {
      delete proto.scrollBy;
    } else {
      proto.scrollBy = originalScrollBy;
    }
    jest.clearAllMocks();
  });

  it('renders the section heading and the CTA link to /solutions/network-coverage', () => {
    render(<HomeNetworkCoverage />);

    expect(mockedUseNetworkCoverageImpact).toHaveBeenCalledWith({
      tenant: 'airqo',
    });

    const heading = document.getElementById('network-coverage-heading');
    expect(heading).not.toBeNull();
    expect(heading).toHaveTextContent('Air quality monitoring across Africa');
    expect(
      screen.getByRole('heading', {
        name: /Air quality monitoring across Africa/i,
      }),
    ).toBeInTheDocument();

    const cta = screen.getByRole('link', {
      name: /View full network coverage/i,
    });
    expect(cta).toHaveAttribute('href', '/solutions/network-coverage');
  });

  it('does not render the legacy stats row (Total monitors / Countries / Cities)', () => {
    render(<HomeNetworkCoverage />);

    expect(screen.queryByText('Total monitors')).toBeNull();
    expect(screen.queryByText('Cities')).toBeNull();
    expect(screen.queryByText('442')).toBeNull();
    expect(screen.queryByText('117')).toBeNull();
  });

  it('renders one card per country with flag, name, total and the "sensors" label', () => {
    render(<HomeNetworkCoverage />);

    expect(screen.getByText('Uganda')).toBeInTheDocument();
    expect(screen.getByText('Kenya')).toBeInTheDocument();
    expect(screen.getByText('Nigeria')).toBeInTheDocument();
    expect(screen.getByText('179')).toBeInTheDocument();
    expect(screen.getAllByText('sensors').length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText('sensors')).toHaveLength(3);

    // Sorted by total descending: Uganda (179) precedes Nigeria (51)
    const orderedNames = screen.getAllByText(/^(Uganda|Kenya|Nigeria)$/);
    expect(orderedNames.map((el) => el.textContent)).toEqual([
      'Uganda',
      'Kenya',
      'Nigeria',
    ]);

    expect(
      screen.getByRole('region', { name: 'Network coverage by country' }),
    ).toBeInTheDocument();
  });

  it('does not auto-rotate: no interval is scheduled and nothing scrolls after 20s', () => {
    jest.useFakeTimers();
    // Any auto-rotation (setInterval + isPaused from the previous version)
    // would land here.
    const setIntervalSpy = jest.spyOn(globalThis, 'setInterval');

    render(<HomeNetworkCoverage />);

    expect(setIntervalSpy).not.toHaveBeenCalled();
    // At most one pending timer: Next.js <Link>'s use-intersection one-shot
    // setTimeout(1ms) visibility check. An auto-rotation interval would also
    // be pending here.
    expect(jest.getTimerCount()).toBeLessThanOrEqual(1);

    act(() => {
      jest.advanceTimersByTime(20000);
    });

    expect(scrollToSpy).not.toHaveBeenCalled();
    expect(setIntervalSpy).not.toHaveBeenCalled();
    // One-shot timer(s) fired and cleared; a repeating interval would still
    // be scheduled after 20s.
    expect(jest.getTimerCount()).toBe(0);
  });

  it('manual prev/next buttons scroll the carousel', () => {
    render(<HomeNetworkCoverage />);

    fireEvent.click(screen.getByLabelText('Next countries'));
    expect(scrollBySpy).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByLabelText('Previous countries'));
    expect(scrollBySpy).toHaveBeenCalledTimes(2);
  });
});
