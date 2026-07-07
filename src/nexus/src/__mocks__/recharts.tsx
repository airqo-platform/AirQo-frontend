import React from 'react';

const createStub = (name: string) => {
  const Component = ({
    children,
    ...props
  }: React.PropsWithChildren<Record<string, unknown>>) => (
    <div {...props} data-testid={`recharts-${name}`}>
      {children}
    </div>
  );
  Component.displayName = name;
  return Component;
};

export const ResponsiveContainer = createStub('ResponsiveContainer');
export const LineChart = createStub('LineChart');
export const BarChart = createStub('BarChart');
export const AreaChart = createStub('AreaChart');
export const PieChart = createStub('PieChart');
export const Line = createStub('Line');
export const Bar = createStub('Bar');
export const Area = createStub('Area');
export const Pie = createStub('Pie');
export const Cell = createStub('Cell');
export const XAxis = createStub('XAxis');
export const YAxis = createStub('YAxis');
export const CartesianGrid = createStub('CartesianGrid');
export const Tooltip = createStub('Tooltip');
export const Legend = createStub('Legend');
export const ReferenceLine = createStub('ReferenceLine');
