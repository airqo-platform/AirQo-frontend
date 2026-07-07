import React from 'react';

function createChartComponent(name: string) {
  const Component = React.forwardRef(function MockComponent(
    props: any,
    ref: any,
  ) {
    return React.createElement('div', {
      ref,
      'data-testid': name.toLowerCase(),
      ...props,
    });
  });
  Component.displayName = name;
  return Component;
}

const line = createChartComponent('Line');
const area = createChartComponent('Area');
const bar = createChartComponent('Bar');
const pie = createChartComponent('Pie');
const cell = createChartComponent('Cell');
const xAxis = createChartComponent('XAxis');
const yAxis = createChartComponent('YAxis');
const cartesianGrid = createChartComponent('CartesianGrid');
const tooltip = createChartComponent('Tooltip');
const legend = createChartComponent('Legend');
const responsiveContainer = createChartComponent('ResponsiveContainer');

const RechartsMock = {
  LineChart: createChartComponent('LineChart'),
  Line: line,
  BarChart: createChartComponent('BarChart'),
  Bar: bar,
  PieChart: createChartComponent('PieChart'),
  Pie: pie,
  Cell: cell,
  AreaChart: createChartComponent('AreaChart'),
  Area: area,
  XAxis: xAxis,
  YAxis: yAxis,
  CartesianGrid: cartesianGrid,
  Tooltip: tooltip,
  Legend: legend,
  ResponsiveContainer: responsiveContainer,
  ReferenceLine: createChartComponent('ReferenceLine'),
  ReferenceArea: createChartComponent('ReferenceArea'),
  ComposedChart: createChartComponent('ComposedChart'),
  Radar: createChartComponent('Radar'),
  RadarChart: createChartComponent('RadarChart'),
  ScatterChart: createChartComponent('ScatterChart'),
  Scatter: createChartComponent('Scatter'),
  Treemap: createChartComponent('Treemap'),
  Funnel: createChartComponent('Funnel'),
  FunnelChart: createChartComponent('FunnelChart'),
};

export default RechartsMock;
