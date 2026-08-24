import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { ChartContainer } from '../ChartContainer';
import { store } from '@/shared/store';

// flowbite-react ships ESM-only and cannot be parsed by ts-jest; the dialog
// only uses its Tooltip, so stub it for the component test.
jest.mock('flowbite-react', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Shared UI Button uses the Next router; no router exists in unit tests.
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

// Shared UI (Card etc.) reads the theme from the redux store — use the real
// store so `interfaceStyle` etc. resolve instead of crashing.
const renderWithStore = (ui: React.ReactElement) =>
  render(<Provider store={store}>{ui}</Provider>);

const LINE_BAR_OPTIONS = [
  { value: 'line' as const, label: 'Line Chart' },
  { value: 'bar' as const, label: 'Bar Chart' },
];

// The selector lives in the toolbar rows, so these cases host it in the
// compact period-presets row (the toolbar-row variant is covered below).
const PRESETS = [{ value: '7d', label: '7D' }];
const presetRowProps = {
  periodPresets: PRESETS,
  activePeriod: '7d',
  onPeriodChange: jest.fn(),
};

describe('ChartContainer toolbar chart-type selector', () => {
  it('renders the selector trigger showing the current chart type label', () => {
    renderWithStore(
      <ChartContainer
        title="T"
        onChartTypeChange={jest.fn()}
        currentChartType="line"
        chartTypeOptions={LINE_BAR_OPTIONS}
        {...presetRowProps}
      >
        <div>body</div>
      </ChartContainer>
    );

    const trigger = screen.getByRole('button', { name: 'Chart type' });
    expect(trigger).toHaveTextContent('Line Chart');
  });

  it('calls onChartTypeChange with the picked type and updates the label', () => {
    const onChartTypeChange = jest.fn();
    const view = renderWithStore(
      <ChartContainer
        title="T"
        onChartTypeChange={onChartTypeChange}
        currentChartType="line"
        chartTypeOptions={LINE_BAR_OPTIONS}
        {...presetRowProps}
      >
        <div>body</div>
      </ChartContainer>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Chart type' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bar Chart' }));

    expect(onChartTypeChange).toHaveBeenCalledWith('bar');

    // Rerender as the controlled consumer would after applying the change.
    view.rerender(
      <Provider store={store}>
        <ChartContainer
          title="T"
          onChartTypeChange={onChartTypeChange}
          currentChartType="bar"
          chartTypeOptions={LINE_BAR_OPTIONS}
          {...presetRowProps}
        >
          <div>body</div>
        </ChartContainer>
      </Provider>
    );
    expect(
      screen.getByRole('button', { name: 'Chart type' })
    ).toHaveTextContent('Bar Chart');
  });

  it('renders next to the toolbar date-range control in the same export-ignored row', () => {
    renderWithStore(
      <ChartContainer
        title="T"
        onChartTypeChange={jest.fn()}
        currentChartType="line"
        chartTypeOptions={LINE_BAR_OPTIONS}
        toolbar={
          <div>
            <span>Date range</span>
          </div>
        }
      >
        <div>body</div>
      </ChartContainer>
    );

    const dateRange = screen.getByText('Date range');
    const selector = screen.getByRole('button', { name: 'Chart type' });

    // Both live inside the same toolbar row, which carries the export-ignore
    // markers — interactive chrome stays out of chart exports.
    const row = dateRange.closest('[data-export-ignore]');
    expect(row).not.toBeNull();
    expect(selector.closest('[data-export-ignore]')).toBe(row);
  });

  it('hides the More menu chart-type section while the toolbar selector is visible', () => {
    renderWithStore(
      <ChartContainer
        title="T"
        onChartTypeChange={jest.fn()}
        currentChartType="line"
        chartTypeOptions={LINE_BAR_OPTIONS}
        {...presetRowProps}
      >
        <div>body</div>
      </ChartContainer>
    );

    // The More menu's "Auto Select" entry belongs to its chart-type section;
    // with the toolbar selector visible that section must not render at all.
    expect(screen.queryByText(/auto select/i)).not.toBeInTheDocument();
  });

  it('turns auto-select off before applying a manual pick when in auto mode', () => {
    const onAutoSelectToggle = jest.fn();
    const onChartTypeChange = jest.fn();
    renderWithStore(
      <ChartContainer
        title="T"
        onChartTypeChange={onChartTypeChange}
        currentChartType="line"
        chartTypeOptions={LINE_BAR_OPTIONS}
        autoSelectChart
        onAutoSelectToggle={onAutoSelectToggle}
        {...presetRowProps}
      >
        <div>body</div>
      </ChartContainer>
    );

    // Auto mode surfaces on the trigger instead of a pinned type label.
    expect(
      screen.getByRole('button', { name: 'Chart type' })
    ).toHaveTextContent('Auto');

    fireEvent.click(screen.getByRole('button', { name: 'Chart type' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bar Chart' }));

    expect(onAutoSelectToggle).toHaveBeenCalledTimes(1);
    expect(onChartTypeChange).toHaveBeenCalledWith('bar');
    // The manual choice must win: auto-select is disabled BEFORE the type
    // change is reported.
    expect(onAutoSelectToggle.mock.invocationCallOrder[0]).toBeLessThan(
      onChartTypeChange.mock.invocationCallOrder[0]
    );
  });
});
