'use client';

import React, { useMemo, useState, useCallback } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { DynamicChartProps, ChartType } from '../../types';
import { CustomTooltip } from '../ui/CustomTooltip';
import { InteractiveLegend } from '../ui/CustomLegend';
import { CustomReferenceLine } from '../ui/CustomReferenceLine';
import {
  autoSelectChartType,
  groupDataBySite,
  convertToMultiSeriesFormat,
  formatTimestampByFrequency,
  getPollutantLabel,
  getPollutantUnits,
} from '../../utils';
import {
  getPrimaryColor,
  DEFAULT_CHART_CONFIG,
  BAR_CHART_CONFIG,
  GRID_CONFIG,
  AXIS_CONFIG,
  CHART_ANIMATIONS,
} from '../../constants';
import { cn } from '@/shared/lib/utils';

export const DynamicChart: React.FC<DynamicChartProps> = ({
  data,
  config = {},
  autoSelectType = true,
  responsive = true,
  className,
  frequency = 'daily',
  pollutant = 'pm2_5',
  showReferenceLines: controlledShowReferenceLines,
  standards = 'WHO',
  id,
  onReferenceLinesToggle,
}) => {
  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());
  const [localShowReferenceLines, setLocalShowReferenceLines] = useState(
    controlledShowReferenceLines ?? false
  );

  // Sync with controlled prop
  React.useEffect(() => {
    if (controlledShowReferenceLines !== undefined) {
      setLocalShowReferenceLines(controlledShowReferenceLines);
    }
  }, [controlledShowReferenceLines]);

  // Handle reference lines toggle - each chart instance manages its own state
  const handleReferenceLinesToggle = useCallback(() => {
    const newValue = !localShowReferenceLines;
    setLocalShowReferenceLines(newValue);
    onReferenceLinesToggle?.(newValue);
  }, [localShowReferenceLines, onReferenceLinesToggle]);

  // Store toggle function in a ref so parent components can access it
  const toggleRef = React.useRef(handleReferenceLinesToggle);
  toggleRef.current = handleReferenceLinesToggle;

  // Expose toggle function globally by ID for external access
  React.useEffect(() => {
    if (id && typeof window !== 'undefined') {
      const w = window as typeof window & {
        chartToggles?: Record<string, () => void>;
      };
      w.chartToggles = w.chartToggles || {};
      w.chartToggles[id] = toggleRef.current;
    }
  }, [id]);

  // Determine chart type
  const chartType: ChartType = useMemo(() => {
    if (config.type) return config.type;
    if (autoSelectType) return autoSelectChartType(data);
    return 'line';
  }, [config.type, autoSelectType, data]);

  // Prepare data for multi-series charts
  const { chartData, seriesKeys } = useMemo(() => {
    if (!data || data.length === 0) {
      return { chartData: [], seriesKeys: [] };
    }

    // Group data by site for multi-series
    const grouped = groupDataBySite(data);
    const keys = Object.keys(grouped);

    // For single series or pie charts, use original data
    if (keys.length === 1 || chartType === 'pie') {
      return { chartData: data, seriesKeys: [config.dataKey || 'value'] };
    }

    // For multi-series, convert to recharts format
    const converted = convertToMultiSeriesFormat(grouped);
    return { chartData: converted, seriesKeys: keys };
  }, [data, chartType, config.dataKey]);

  // Handle legend toggle
  const handleLegendToggle = useCallback(
    (dataKey: string, visible: boolean) => {
      setHiddenSeries(prev => {
        const newSet = new Set(prev);
        if (visible) {
          newSet.delete(dataKey);
        } else {
          newSet.add(dataKey);
        }
        return newSet;
      });
    },
    []
  );

  // Chart configuration
  const chartConfig = {
    ...DEFAULT_CHART_CONFIG,
    ...config,
  };

  // Common props for all charts
  const commonProps = {
    data: chartData,
    margin: chartConfig.margin,
    ...CHART_ANIMATIONS[chartType as keyof typeof CHART_ANIMATIONS],
  };

  // Render grid
  const renderGrid = () => {
    if (!chartConfig.showGrid) return null;
    return (
      <CartesianGrid
        strokeDasharray={GRID_CONFIG.strokeDasharray}
        stroke={GRID_CONFIG.stroke}
      />
    );
  };

  // Render axes
  const renderXAxis = () => (
    <XAxis
      dataKey={config.xAxisKey || 'time'}
      tick={AXIS_CONFIG.tick}
      tickLine={AXIS_CONFIG.tickLine}
      axisLine={AXIS_CONFIG.axisLine}
      tickFormatter={value =>
        formatTimestampByFrequency(String(value), frequency)
      }
    />
  );

  const renderYAxis = () => (
    <YAxis
      tick={AXIS_CONFIG.tick}
      tickLine={AXIS_CONFIG.tickLine}
      axisLine={AXIS_CONFIG.axisLine}
      label={{
        value: `${getPollutantLabel(pollutant)} (${getPollutantUnits(pollutant)})`,
        angle: 0,
        position: 'top',
        offset: 30,
        style: {
          textAnchor: 'start',
          fontSize: '12px',
          fill: 'rgb(100, 116, 139)',
        },
      }}
    />
  );

  // Render tooltip
  const renderTooltip = () => {
    if (!chartConfig.showTooltip) return null;
    return (
      <Tooltip
        content={<CustomTooltip pollutant={pollutant} frequency={frequency} />}
      />
    );
  };

  // Render legend
  const renderLegend = () => {
    if (!chartConfig.showLegend || seriesKeys.length <= 1) return null;

    return (
      <Legend
        align="right"
        verticalAlign="bottom"
        layout="horizontal"
        wrapperStyle={{
          paddingTop: '20px',
          paddingBottom: '10px',
          fontSize: '12px',
        }}
        content={props => (
          <InteractiveLegend
            {...props}
            onToggle={handleLegendToggle}
            hiddenSeries={hiddenSeries}
            className="flex justify-end items-center gap-2"
          />
        )}
      />
    );
  };

  // Render reference lines for air quality standards
  const renderReferenceLines = () => {
    if (!localShowReferenceLines) return null;

    return (
      <CustomReferenceLine
        pollutant={pollutant}
        standards={standards}
        showReferenceLine={localShowReferenceLines}
      />
    );
  };

  // Render series for line/area charts
  const renderLineSeries = (Component: typeof Line | typeof Area) => {
    return seriesKeys.map((key, index) => {
      const isHidden = hiddenSeries.has(key);
      const color = config.color || getPrimaryColor(index);

      return (
        <Component
          key={key}
          type="monotone"
          dataKey={key}
          stroke={color}
          fill={Component === Area ? color : undefined}
          fillOpacity={
            Component === Area ? config.fillOpacity || 0.1 : undefined
          }
          strokeWidth={config.strokeWidth || 2}
          dot={false}
          connectNulls={false}
          hide={isHidden}
        />
      );
    });
  };

  // Render series for bar charts
  const renderBarSeries = () => {
    return seriesKeys.map((key, index) => {
      const isHidden = hiddenSeries.has(key);
      const color = config.color || getPrimaryColor(index);

      return <Bar key={key} dataKey={key} fill={color} hide={isHidden} />;
    });
  };

  // Render chart based on type
  const renderChart = () => {
    switch (chartType) {
      case 'line':
        return (
          <LineChart {...commonProps}>
            {renderGrid()}
            {renderXAxis()}
            {renderYAxis()}
            {renderTooltip()}
            {renderLegend()}
            {renderLineSeries(Line)}
            {renderReferenceLines()}
          </LineChart>
        );

      case 'area':
        return (
          <AreaChart {...commonProps}>
            {renderGrid()}
            {renderXAxis()}
            {renderYAxis()}
            {renderTooltip()}
            {renderLegend()}
            {renderLineSeries(Area)}
            {renderReferenceLines()}
          </AreaChart>
        );

      case 'bar':
        return (
          <BarChart
            {...commonProps}
            // Use configured values for optimal bar appearance
            barCategoryGap={BAR_CHART_CONFIG.barCategoryGap}
            barGap={BAR_CHART_CONFIG.barGap}
            maxBarSize={BAR_CHART_CONFIG.maxBarSize}
          >
            {renderGrid()}
            {renderXAxis()}
            {renderYAxis()}
            {renderTooltip()}
            {renderLegend()}
            {renderBarSeries()}
            {renderReferenceLines()}
          </BarChart>
        );

      case 'scatter':
        return (
          <ScatterChart {...commonProps}>
            {renderGrid()}
            {renderXAxis()}
            {renderYAxis()}
            {renderTooltip()}
            {renderLegend()}
            {seriesKeys.map((key, index) => {
              const isHidden = hiddenSeries.has(key);
              const color = config.color || getPrimaryColor(index);

              return (
                <Scatter key={key} dataKey={key} fill={color} hide={isHidden} />
              );
            })}
            {renderReferenceLines()}
          </ScatterChart>
        );

      case 'radar':
        const radarProps = {
          data: chartData,
          margin: { top: 20, right: 30, left: 20, bottom: 20 },
          ...CHART_ANIMATIONS.line,
        };
        return (
          <RadarChart {...radarProps}>
            <PolarGrid />
            <PolarAngleAxis dataKey={config.xAxisKey || 'time'} />
            <PolarRadiusAxis />
            {renderTooltip()}
            {renderLegend()}
            {seriesKeys.map((key, index) => {
              const isHidden = hiddenSeries.has(key);
              const color = config.color || getPrimaryColor(index);

              return (
                <Radar
                  key={key}
                  dataKey={key}
                  stroke={color}
                  fill={color}
                  fillOpacity={config.fillOpacity || 0.1}
                  hide={isHidden}
                />
              );
            })}
          </RadarChart>
        );

      case 'pie':
        const pieProps = {
          data: chartData,
          margin: { top: 20, right: 30, left: 20, bottom: 20 },
          ...CHART_ANIMATIONS.line,
        };
        return (
          <PieChart {...pieProps}>
            {renderTooltip()}
            {renderLegend()}
            <Pie
              data={chartData}
              dataKey={config.dataKey || 'value'}
              nameKey={config.xAxisKey || 'site'}
              cx="50%"
              cy="50%"
              outerRadius={120}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={getPrimaryColor(index)} />
              ))}
            </Pie>
          </PieChart>
        );

      default:
        return null;
    }
  };

  if (!data || data.length === 0) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-96 text-muted-foreground',
          className
        )}
      >
        <div className="text-center">
          <p className="text-lg font-medium">No data available</p>
          <p className="text-sm">Please check your data source or try again</p>
        </div>
      </div>
    );
  }

  const Container = responsive ? ResponsiveContainer : 'div';
  // Only apply a minWidth when an explicit numeric width is provided in config.
  // Defaulting to a hard-coded min-width caused horizontal overflow on narrow
  // screens (mobile). Let the chart shrink naturally in responsive mode and
  // allow the surrounding layout to control sizing. Add `min-w-0` to the
  // wrapper so flex children can shrink.
  const explicitMinWidth =
    chartConfig.width && typeof chartConfig.width === 'number'
      ? chartConfig.width
      : undefined;

  const containerProps = responsive
    ? { width: '100%', height: chartConfig.height }
    : explicitMinWidth
      ? {
          style: {
            width: chartConfig.width || '100%',
            height: chartConfig.height,
            minWidth: explicitMinWidth,
          },
        }
      : {
          style: {
            width: chartConfig.width || '100%',
            height: chartConfig.height,
          },
        };

  const chart = renderChart();
  if (!chart) return null;

  return (
    <div
      className={cn(
        'w-full flex justify-center items-center min-h-[300px] min-w-0',
        className
      )}
    >
      <Container {...containerProps}>{chart}</Container>
    </div>
  );
};
