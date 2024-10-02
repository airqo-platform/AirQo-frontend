/* eslint-disable jsx-a11y/alt-text */
'use client';

import { Image } from '@react-pdf/renderer';
import axios from 'axios';
import React, { FC, useEffect, useState, useMemo } from 'react';

interface ChartProps {
  chartData: any;
  width?: number;
  height?: number;
  graphTitle?: string;
  xAxisTitle?: string;
  yAxisTitle?: string;
}

// Function to assign colors based on month abbreviations
const getMonthColor = (label: string): string => {
  const monthColors: { [key: string]: string } = {
    Jan: 'rgba(128, 0, 0, 0.7)', // Dark Red
    Feb: 'rgba(0, 0, 128, 0.7)', // Dark Blue
    Mar: 'rgba(128, 128, 0, 0.7)', // Olive
    Apr: 'rgba(0, 128, 0, 0.7)', // Dark Green
    May: 'rgba(128, 0, 128, 0.7)', // Purple
    Jun: 'rgba(139, 69, 19, 0.7)', // Saddle Brown
    Jul: 'rgba(0, 128, 128, 0.7)', // Teal
    Aug: 'rgba(184, 134, 11, 0.7)', // Dark Goldenrod
    Sep: 'rgba(0, 139, 139, 0.7)', // Dark Cyan
    Oct: 'rgba(85, 107, 47, 0.7)', // Dark Olive Green
    Nov: 'rgba(153, 50, 204, 0.7)', // Dark Orchid
    Dec: 'rgba(139, 0, 0, 0.7)', // Dark Red
  };

  const monthAbbreviation = label.split(' ')[0];
  return monthColors[monthAbbreviation] || 'rgba(0, 0, 255, 0.4)';
};

// Function to determine maxTicksLimit based on number of labels
const determineMaxTicksLimit = (labelsCount: number, desiredMaxTicks: number = 20): number => {
  if (labelsCount <= desiredMaxTicks) return labelsCount;
  return desiredMaxTicks;
};

// Function to generate chart configuration
const generateChartConfig = (
  type: 'bar' | 'line',
  chartData: any,
  graphTitle: string,
  xAxisTitle: string,
  yAxisTitle: string,
) => {
  const maxTicksLimit = determineMaxTicksLimit(chartData.labels.length, 20);

  const baseConfig = {
    data: {
      ...chartData,
      datasets: chartData.datasets.map((dataset: any) => ({
        ...dataset,
        backgroundColor:
          xAxisTitle === 'Date'
            ? chartData.labels.map((label: any) => getMonthColor(label))
            : type === 'bar'
              ? 'rgba(0, 0, 255, 0.4)'
              : 'rgba(0, 0, 255, 0.4)',
        borderColor: type === 'line' ? 'rgba(0, 0, 255, 1)' : undefined,
        fill: type === 'line' ? true : undefined,
      })),
    },
    options: {
      title: {
        display: !!graphTitle,
        text: graphTitle,
        fontSize: 20,
        fontColor: '#000000',
      },
      scales: {
        xAxes: [
          {
            scaleLabel: {
              display: xAxisTitle !== '',
              labelString: xAxisTitle,
              fontColor: 'black',
            },
            ticks: {
              autoSkip: true,
              maxTicksLimit: maxTicksLimit,
              maxRotation: 45,
              minRotation: 45,
              fontColor: 'black',
              fontSize: 10, // Reduced tick size for x-axis
            },
          },
        ],
        yAxes: [
          {
            scaleLabel: {
              display: yAxisTitle !== '',
              labelString: yAxisTitle,
              fontColor: 'black',
            },
            ticks: {
              beginAtZero: true,
              fontColor: 'black',
              fontSize: 10, // Reduced tick size for y-axis
            },
          },
        ],
      },
      legend: {
        display: false,
      },
      responsive: false,
      maintainAspectRatio: false,
    },
  };

  return {
    type,
    data: baseConfig.data,
    options: baseConfig.options,
  };
};

// Generic Chart Component
const Chart: FC<ChartProps & { type: 'bar' | 'line' }> = ({
  type,
  chartData,
  width = 530,
  height = 400,
  graphTitle = '',
  xAxisTitle = '',
  yAxisTitle = '',
}) => {
  const [chartImageUrl, setChartImageUrl] = useState<string>('');

  const chartConfig = useMemo(
    () => generateChartConfig(type, chartData, graphTitle, xAxisTitle, yAxisTitle),
    [type, chartData, graphTitle, xAxisTitle, yAxisTitle],
  );

  useEffect(() => {
    const generateChart = async () => {
      try {
        const response = await axios.post('/reports/api/generateChart', {
          chartConfig,
          width,
          height,
        });

        if (response.data.url) {
          setChartImageUrl(response.data.url);
        } else {
          console.error('Chart image URL not returned');
        }
      } catch (error) {
        console.error('Error generating chart:', error);
      }
    };

    generateChart();
  }, [chartConfig, width, height]);

  return chartImageUrl ? <Image src={chartImageUrl} /> : null;
};

// Specialized BarChart Component
export const BarChartComponent: FC<ChartProps> = (props) => <Chart type="bar" {...props} />;

// Specialized LineChart Component
export const LineChartComponent: FC<ChartProps> = (props) => <Chart type="line" {...props} />;
