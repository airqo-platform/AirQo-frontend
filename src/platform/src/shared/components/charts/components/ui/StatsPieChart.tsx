'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { getPrimaryColor } from '../../constants';

export interface StatsPieChartDataPoint {
  name: string;
  value: number;
}

interface StatsPieChartProps {
  data: StatsPieChartDataPoint[];
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  showLabel?: boolean;
  showLegend?: boolean;
  colors?: string[];
}

const StatsPieChart: React.FC<StatsPieChartProps> = ({
  data,
  height = 300,
  innerRadius = 0,
  outerRadius = 100,
  showLabel = true,
  showLegend = true,
  colors,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center text-muted-foreground" style={{ height }}>
        <p className="text-sm">No data available</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Tooltip
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
            fontSize: '12px',
            color: 'hsl(var(--card-foreground))',
          }}
        />
        {showLegend && (
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }}
          />
        )}
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          paddingAngle={2}
          label={
            showLabel
              ? (props: PieLabelRenderProps) => {
                  const name = String(props.name ?? '');
                  const percent = Number(props.percent ?? 0);
                  return `${name} (${(percent * 100).toFixed(0)}%)`;
                }
              : undefined
          }
        >
          {data.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={colors?.[index] || getPrimaryColor(index)}
              stroke="hsl(var(--background))"
              strokeWidth={2}
            />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
};

export { StatsPieChart };
export type { StatsPieChartProps };
