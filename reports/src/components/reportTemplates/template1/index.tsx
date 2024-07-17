/* eslint-disable jsx-a11y/alt-text */
"use client";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";

const Document1 = dynamic(
  () => import("@/components/reportTemplates/template1")
);

interface Template1Props {
  data: any;
}

export default function Template1({ data }: Template1Props) {
  const startDate = useMemo(
    () =>
      new Date(data?.period.startTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [data?.period.startTime]
  );

  const endDate = useMemo(
    () =>
      new Date(data?.period.endTime).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    [data?.period.endTime]
  );

  const tableData1 = useMemo(
    () => [
      {
        healthConcern: "Good",
        pm25: "0 - 12",
        precautions:
          "None: Air quality is satisfactory; and air pollution poses little or no risk.",
        bgColor: "#00e400",
      },
      {
        healthConcern: "Moderate",
        pm25: "12.1 - 35.4",
        precautions:
          "Unusually sensitive people should consider reducing prolonged or heavy exertion.",
        bgColor: "#ff0",
      },
      {
        healthConcern: "Unhealthy for Sensitive Groups",
        pm25: "35.5 - 55.4",
        precautions:
          "Sensitive groups should reduce prolonged or heavy exertion.",
        bgColor: "#f90",
      },
      {
        healthConcern: "Unhealthy",
        pm25: "55.5 - 150.4",
        precautions:
          "Everyone should reduce prolonged or heavy exertion, take more breaks during outdoor activities.",
        bgColor: "#f00",
      },
      {
        healthConcern: "Very Unhealthy",
        pm25: "150.5 - 250.4",
        precautions:
          "Everyone should avoid prolonged or heavy exertion, move activities indoors or reschedule.",
        bgColor: "#90f",
      },
      {
        healthConcern: "Hazardous",
        pm25: "250.5 - 500.4",
        precautions: "Everyone should avoid all physical activities outdoors.",
        bgColor: "#600",
      },
    ],
    []
  );

  const chartData1 = {
    labels: data.site_monthly_mean_pm.map((site_name: any) => {
      const monthName = format(new Date(2024, site_name.month - 1), "MMM");
      return `${site_name.site_name} (${monthName})`;
    }),
    datasets: [
      {
        label: "PM2.5 Raw Values",
        data: data.site_monthly_mean_pm.map(
          (item: { pm2_5_raw_value: number }) => item.pm2_5_raw_value
        ),
      },
    ],
  };

  const chartData2 = {
    labels: data.daily_mean_pm.map((item: { date: string }) =>
      new Date(item.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })
    ),
    datasets: [
      {
        label: "Daily Mean PM2.5",
        data: data.daily_mean_pm.map(
          (item: { pm2_5_raw_value: number }) => item.pm2_5_raw_value
        ),
      },
    ],
  };

  const chartData3 = {
    labels: data.diurnal.map((item: { hour: number }) => item.hour),
    datasets: [
      {
        label: "Diurnal PM2.5",
        data: data.diurnal.map(
          (item: { pm2_5_raw_value: number }) => item.pm2_5_raw_value
        ),
      },
    ],
  };

  const top5Locations = [...data.site_monthly_mean_pm]
    .sort((a: any, b: any) => b.pm2_5_raw_value - a.pm2_5_raw_value)
    .slice(0, 5);

  const bottom3Locations = [...data.site_monthly_mean_pm]
    .sort((a: any, b: any) => a.pm2_5_raw_value - b.pm2_5_raw_value)
    .slice(0, 3);

  const highestPM25Hour = data.diurnal.reduce(
    (max: any, item: any) =>
      item.pm2_5_raw_value > max.pm2_5_raw_value ? item : max,
    data.diurnal[0]
  );
  const lowestPM25Hour = data.diurnal.reduce(
    (min: any, item: any) =>
      item.pm2_5_raw_value < min.pm2_5_raw_value ? item : min,
    data.diurnal[0]
  );

  return (
    <Document1
      data={{
        startDate,
        endDate,
        tableData1,
        chartData1,
        chartData2,
        chartData3,
        top5Locations,
        bottom3Locations,
        highestPM25Hour,
        lowestPM25Hour,
      }}
    />
  );
}
