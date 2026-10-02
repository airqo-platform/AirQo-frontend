import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ChartContainer } from '../ChartContainer';
import { store } from '@/shared/store';
import { toast } from '@/shared/components/ui/toast';

jest.mock('flowbite-react', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('@/shared/components/ui/toast', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

const renderWithStore = (ui: React.ReactElement) =>
  render(<Provider store={store}>{ui}</Provider>);

const TestChart = ({
  standards,
  showReferenceLines,
}: {
  standards?: string;
  showReferenceLines?: boolean;
}) => (
  <div>
    {standards}:{String(showReferenceLines)}
  </div>
);

const openStandardsDialog = async () => {
  fireEvent.click(screen.getByRole('button', { name: /more/i }));
  fireEvent.click(await screen.findByText('Air Quality Standards'));
};

describe('ChartContainer pollutant-specific standards', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('uses the chart pollutant for standards, apply state, and toast', async () => {
    const view = renderWithStore(
      <ChartContainer title="Air quality" activePollutant="pm10">
        <TestChart />
      </ChartContainer>
    );

    await openStandardsDialog();
    expect(
      await screen.findByRole('heading', {
        name: 'Air Quality Standards - PM10',
      })
    ).toBeInTheDocument();
    expect(screen.getByText('15 µg/m³')).toBeInTheDocument();
    expect(screen.getByText('45 µg/m³')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Apply Standards' }));
    await waitFor(() =>
      expect(toast.success).toHaveBeenCalledWith(
        'Applied WHO (World Health Organization) standards for PM10'
      )
    );

    view.rerender(
      <Provider store={store}>
        <ChartContainer title="Air quality" activePollutant="pm2_5">
          <TestChart />
        </ChartContainer>
      </Provider>
    );

    await openStandardsDialog();
    expect(
      await screen.findByRole('heading', {
        name: 'Air Quality Standards - PM2.5',
      })
    ).toBeInTheDocument();
    expect(screen.getByText('5 µg/m³')).toBeInTheDocument();
    expect(screen.getByText('15 µg/m³')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Apply Standards' }));
    await waitFor(() =>
      expect(toast.success).toHaveBeenLastCalledWith(
        'Applied WHO (World Health Organization) standards for PM2.5'
      )
    );
  });
});
