/* eslint-disable jsx-a11y/alt-text */
"use client";
import { FC, useEffect, useState, useMemo } from "react";
import { Image } from "@react-pdf/renderer";
import axios from "axios";

interface BarChartProps {
  chartData: any;
  width?: number;
  height?: number;
  graphTitle?: string;
  xAxisTitle?: string;
  yAxisTitle?: string;
  setChartImageUrl?: any;
}

const getMonthColor = (label: string) => {
  const monthColors: { [key: string]: string } = {
    Jan: "rgba(128, 0, 0, 0.7)", // Dark Red
    Feb: "rgba(0, 0, 128, 0.7)", // Dark Blue
    Mar: "rgba(128, 128, 0, 0.7)", // Olive
    Apr: "rgba(0, 128, 0, 0.7)", // Dark Green
    May: "rgba(128, 0, 128, 0.7)", // Purple
    Jun: "rgba(139, 69, 19, 0.7)", // Saddle Brown
    Jul: "rgba(0, 128, 128, 0.7)", // Teal
    Aug: "rgba(184, 134, 11, 0.7)", // Dark Goldenrod
    Sep: "rgba(0, 139, 139, 0.7)", // Dark Cyan
    Oct: "rgba(85, 107, 47, 0.7)", // Dark Olive Green
    Nov: "rgba(153, 50, 204, 0.7)", // Dark Orchid
    Dec: "rgba(139, 0, 0, 0.7)", // Dark Red
  };

  const monthAbbreviation = label.split(" ")[0];
  return monthColors[monthAbbreviation] || "rgba(0, 0, 255, 0.4)";
};

export const BarChart: FC<BarChartProps> = ({
  chartData,
  width = 800,
  height = 400,
  graphTitle = "",
  xAxisTitle = "",
  yAxisTitle = "",
}) => {
  const [chartImageUrl, setChartImageUrl] = useState("");

  const chartConfig = useMemo(
    () => ({
      type: "bar",
      data: {
        ...chartData,
        datasets: chartData.datasets.map((dataset: any) => ({
          ...dataset,
          backgroundColor:
            xAxisTitle === "Date"
              ? chartData.labels.map((label: any) => getMonthColor(label))
              : "rgba(0, 0, 255, 0.4)",
        })),
      },
      options: {
        title: {
          display: true,
          text: graphTitle,
          fontSize: 20,
          fontColor: "#000000",
        },
        scales: {
          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: xAxisTitle,
                fontColor: "black",
              },
              ticks: {
                autoSkip: false,
                maxRotation: 45,
                minRotation: 45,
                fontColor: "black",
              },
            },
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: yAxisTitle,
                fontColor: "black",
              },
            },
          ],
        },
        legend: {
          display: false,
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    }),
    [chartData, graphTitle, xAxisTitle, yAxisTitle]
  );

  useEffect(() => {
    const generateChart = async () => {
      const response = await axios.post("/api/generateChart", {
        chartConfig,
        width,
        height,
      });

      setChartImageUrl(response.data.url);
    };

    generateChart();
  }, [chartConfig, width, height]);

  return chartImageUrl && <Image src={chartImageUrl} />;
};

export const LineChart: FC<BarChartProps> = ({
  chartData,
  width = 800,
  height = 300,
  graphTitle = "",
  xAxisTitle = "",
  yAxisTitle = "",
}) => {
  const [chartImageUrl, setChartImageUrl] = useState("");

  const chartConfig = useMemo(
    () => ({
      type: "line",
      data: {
        ...chartData,
        datasets: chartData.datasets.map((dataset: any) => ({
          ...dataset,
          backgroundColor: "rgba(0, 0, 255, 0.4)",
        })),
      },
      options: {
        title: {
          display: true,
          text: graphTitle,
          fontSize: 20,
          fontColor: "#000000",
        },
        scales: {
          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: xAxisTitle,
                fontColor: "black",
              },
              ticks: {
                autoSkip: false,
                maxRotation: 45,
                minRotation: 45,
                fontColor: "black",
              },
            },
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: yAxisTitle,
                fontColor: "black",
              },
            },
          ],
        },
        legend: {
          display: false,
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    }),
    [chartData, graphTitle, xAxisTitle, yAxisTitle]
  );

  useEffect(() => {
    const generateChart = async () => {
      const response = await axios.post("/api/generateChart", {
        chartConfig,
        width,
        height,
      });

      setChartImageUrl(response.data.url);
    };

    generateChart();
  }, [chartConfig, width, height]);

  return chartImageUrl && <Image src={chartImageUrl} />;
};
