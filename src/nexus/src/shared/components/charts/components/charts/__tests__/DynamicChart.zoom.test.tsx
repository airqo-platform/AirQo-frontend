import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { DynamicChart } from '../DynamicChart';
import { NormalizedChartData } from '../../../types';

const mockChartCalls: Record<string, Array<Record<string, unknown>>> = {};
const mockReact = React;

jest.mock('recharts', () => {
  const createStub = (name: string) => {
    const Component = ({
      children,
      ...props
    }: Record<string, unknown> & { children?: React.ReactNode }) => {
      mockChartCalls[name] = mockChartCalls[name] ?? [];
      mockChartCalls[name].push(props);
      return mockReact.createElement(
        'div',
        { 'data-testid': `recharts-${name}` },
        children
      );
    };
    Component.displayName = name;
    return Component;
  };
  return {
    LineChart: createStub('LineChart'),
    AreaChart: createStub('AreaChart'),
    BarChart: createStub('BarChart'),
    ScatterChart: createStub('ScatterChart'),
    RadarChart: createStub('RadarChart'),
    PieChart: createStub('PieChart'),
    Line: createStub('Line'),
    Area: createStub('Area'),
    Bar: createStub('Bar'),
    Scatter: createStub('Scatter'),
    Radar: createStub('Radar'),
    Pie: createStub('Pie'),
    Cell: createStub('Cell'),
    XAxis: createStub('XAxis'),
    YAxis: createStub('YAxis'),
    CartesianGrid: createStub('CartesianGrid'),
    Tooltip: createStub('Tooltip'),
    Legend: createStub('Legend'),
    ReferenceLine: createStub('ReferenceLine'),
    ResponsiveContainer: createStub('ResponsiveContainer'),
    Curve: createStub('Curve'),
    Customized: createStub('Customized'),
    PolarGrid: createStub('PolarGrid'),
    PolarAngleAxis: createStub('PolarAngleAxis'),
    PolarRadiusAxis: createStub('PolarRadiusAxis'),
    useIsTooltipActive: () => null,
    useActiveTooltipCoordinate: () => null,
    useActiveTooltipDataPoints: () => null,
    useYAxisScale: () => null,
  };
});

const buildSeries = (count: number, start = 0): NormalizedChartData[] =>
  Array.from({ length: count }, (_, i) => ({
    time: new Date(Date.UTC(2026, 0, 1 + start + i)).toISOString(),
    value: 10 + (i % 50),
    site: 'Site A',
    device_id: 'device-1',
  }));

const lastChartData = (name: string) => {
  const calls = mockChartCalls[name] ?? [];
  return ((calls[calls.length - 1]?.data as unknown[]) ?? []).length;
};

const lastChartAnimation = (name: string): boolean | undefined => {
  const calls = mockChartCalls[name] ?? [];
  return calls[calls.length - 1]?.isAnimationActive as boolean | undefined;
};

const renderChart = (data: NormalizedChartData[], extraProps = {}) =>
  render(
    <DynamicChart
      data={data}
      autoSelectType={false}
      config={{ type: 'line' }}
      {...extraProps}
    />
  );

describe('DynamicChart zoom controls', () => {
  beforeEach(() => {
    Object.keys(mockChartCalls).forEach(key => delete mockChartCalls[key]);
  });

  it('shows the zoom pill automatically on dense data', () => {
    renderChart(buildSeries(100));

    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Zoom out' })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reset zoom' })).toBeNull();
  });

  it('hides the pill on sparse data', () => {
    renderChart(buildSeries(5));

    expect(screen.queryByRole('button', { name: 'Zoom in' })).toBeNull();
  });

  it('shows the pill on default-sized analytics data (7 days of daily points)', () => {
    renderChart(buildSeries(8));

    expect(screen.getByRole('button', { name: 'Zoom in' })).toBeInTheDocument();
  });

  it('zoom in halves the rendered window and disables re-animation', () => {
    renderChart(buildSeries(100));

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));

    expect(lastChartData('LineChart')).toBe(50);
    expect(lastChartAnimation('Line')).toBe(false);
    expect(
      screen.getByRole('button', { name: 'Reset zoom' })
    ).toBeInTheDocument();
  });

  it('zoom out doubles the window back and reset restores the full data', () => {
    renderChart(buildSeries(100));

    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    fireEvent.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(lastChartData('LineChart')).toBe(25);

    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(lastChartData('LineChart')).toBe(50);

    fireEvent.click(screen.getByRole('button', { name: 'Zoom out' }));
    expect(lastChartData('LineChart')).toBe(100);
    expect(screen.queryByRole('button', { name: 'Reset zoom' })).toBeNull();
    expect(lastChartAnimation('Line')).toBe(true);
  });

  it('disables zoom out while the full dataset is visible', () => {
    renderChart(buildSeries(100));

    expect(screen.getByRole('button', { name: 'Zoom out' })).toBeDisabled();
  });

  it('never shows the pill on non-zoomable chart types, even when forced', () => {
    renderChart(buildSeries(100), {
      config: { type: 'pie' },
      zoomable: true,
    });

    expect(screen.queryByRole('button', { name: 'Zoom in' })).toBeNull();
  });

  it('respects an explicit zoomable={false}', () => {
    renderChart(buildSeries(100), { zoomable: false });

    expect(screen.queryByRole('button', { name: 'Zoom in' })).toBeNull();
  });

  it('marks the pill as ignored by both PNG/PDF export paths', () => {
    renderChart(buildSeries(100));

    const pill = screen
      .getByRole('group', { name: 'Chart zoom controls' })
      .closest('div');
    expect(pill).toHaveAttribute('data-export-ignore');
    expect(pill).toHaveAttribute('data-html2canvas-ignore', 'true');
  });
});
