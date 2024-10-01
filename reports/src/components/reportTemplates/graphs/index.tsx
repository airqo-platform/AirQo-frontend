/* eslint-disable jsx-a11y/alt-text */
'use client';

import { Image, Text, StyleSheet } from '@react-pdf/renderer';
import axios, { CancelTokenSource } from 'axios';
import React, { FC, useEffect, useState, useMemo } from 'react';

// TypeScript Interfaces

interface ChartProps {
  chartData: ChartData;
  width?: number;
  height?: number;
  graphTitle?: string;
  xAxisTitle?: string;
  yAxisTitle?: string;
  chartType: 'bar' | 'line';
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  fill?: boolean;
}

// Helper Function to Get Month Color

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

const getMonthColor = (label: string): string => {
  const monthAbbreviation = label.split(' ')[0];
  return monthColors[monthAbbreviation] || 'rgba(0, 0, 255, 0.4)';
};

// Generic Chart Component

const Chart: FC<ChartProps> = ({
  chartData,
  width = 800,
  height = 400,
  graphTitle = '',
  xAxisTitle = '',
  yAxisTitle = '',
  chartType,
}) => {
  const [chartImageUrl, setChartImageUrl] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Memoize Chart Configuration
  const chartConfig = useMemo(() => {
    const datasets = chartData.datasets.map((dataset) => {
      let backgroundColor = dataset.backgroundColor;
      // let borderColor = dataset.borderColor;

      // Apply dynamic background colors for bar charts with 'Date' x-axis
      if (chartType === 'bar' && xAxisTitle === 'Date') {
        backgroundColor = chartData.labels.map((label) => getMonthColor(label));
      } else if (chartType === 'bar' && !Array.isArray(dataset.backgroundColor)) {
        backgroundColor = 'rgba(0, 0, 255, 0.4)';
      }

      return {
        ...dataset,
        backgroundColor,
        borderColor: dataset.borderColor || 'rgba(0, 0, 0, 1)',
        fill: chartType === 'line' ? false : undefined,
      };
    });

    return {
      type: chartType,
      data: {
        labels: chartData.labels,
        datasets,
      },
      options: {
        title: {
          display: Boolean(graphTitle),
          text: graphTitle,
          fontSize: 20,
          fontColor: '#000000',
        },
        scales: {
          xAxes: [
            {
              scaleLabel: {
                display: Boolean(xAxisTitle),
                labelString: xAxisTitle,
                fontColor: 'black',
              },
              ticks: {
                autoSkip: chartData.labels.length > 20, // Enable autoSkip for large datasets
                maxTicksLimit: 20, // Limit the number of ticks
                autoSkipPadding: 10,
                maxRotation: 45,
                minRotation: 45,
                fontColor: 'black',
              },
            },
          ],
          yAxes: [
            {
              scaleLabel: {
                display: Boolean(yAxisTitle),
                labelString: yAxisTitle,
                fontColor: 'black',
              },
              ticks: {
                beginAtZero: true,
                fontColor: 'black',
              },
            },
          ],
        },
        legend: {
          display: false,
        },
        responsive: false, // Disable responsiveness for PDF rendering
        maintainAspectRatio: false,
      },
    };
  }, [chartData, graphTitle, xAxisTitle, yAxisTitle, chartType]);

  // Effect to Generate Chart Image
  useEffect(() => {
    let cancelTokenSource: CancelTokenSource;

    const generateChart = async () => {
      try {
        cancelTokenSource = axios.CancelToken.source();
        const response = await axios.post(
          '/reports/api/generateChart',
          {
            chartConfig,
            width,
            height,
          },
          {
            cancelToken: cancelTokenSource.token,
          },
        );

        if (response.data.url) {
          setChartImageUrl(response.data.url);
        } else {
          setError('Chart image URL not received');
        }
      } catch (err: any) {
        if (axios.isCancel(err)) {
          console.log('Chart generation cancelled');
        } else {
          console.error('Error generating chart:', err);
          setError('Failed to generate chart');
        }
      }
    };

    generateChart();

    // Cleanup to cancel the request if the component unmounts or dependencies change
    return () => {
      if (cancelTokenSource) {
        cancelTokenSource.cancel('Operation canceled by the user.');
      }
    };
  }, [chartConfig, width, height]);

  // Render Error Message if Any
  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  // Render Loading Indicator
  if (!chartImageUrl) {
    return <Text style={styles.loadingText}>Loading chart...</Text>;
  }

  // Render the Chart Image
  return <Image src={chartImageUrl} style={{ width, height }} />;
};

// Specific Chart Type Components

export const BarChart: FC<Omit<ChartProps, 'chartType'> & { chartType?: 'bar' }> = ({
  chartType = 'bar',
  ...props
}) => <Chart {...props} chartType={chartType} />;

export const LineChart: FC<Omit<ChartProps, 'chartType'> & { chartType?: 'line' }> = ({
  chartType = 'line',
  ...props
}) => <Chart {...props} chartType={chartType} />;

// Stylesheet

const styles = StyleSheet.create({
  errorText: {
    color: 'red',
    fontSize: 12,
    textAlign: 'center',
    margin: 10,
  },
  loadingText: {
    color: 'gray',
    fontSize: 12,
    textAlign: 'center',
    margin: 10,
  },
});
