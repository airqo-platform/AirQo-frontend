// Export main components
export { DynamicChart } from './components/charts/DynamicChart';
export { ChartContainer } from './components/ChartContainer';

// Export UI components
export {
  CustomTooltip,
  AirQualityIndicator,
} from './components/ui/CustomTooltip';
export {
  CustomLegend,
  CompactLegend,
  InteractiveLegend,
} from './components/ui/CustomLegend';
export { StatsPieChart } from './components/ui/StatsPieChart';
export type {
  StatsPieChartDataPoint,
  StatsPieChartProps,
} from './components/ui/StatsPieChart';

// Export hooks
export { useChartExport } from './hooks/useChartExport';
export {
  useChartData,
  useResponsiveChart,
  useChartPerformance,
} from './hooks/useChartData';

// Export utilities
export * from './utils';

// Export constants
export * from './constants';

// Export color resolution (fixed palette vs active-theme shades)
export * from './colors';

// Export types
export * from './types';
