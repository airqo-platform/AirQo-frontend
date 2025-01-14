"use client"

import React, { useState, useEffect } from "react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { EXCEEDANCES_DATA_URI, DEVICE_EXCEEDANCES_URI } from "@/core/urls";
import { useCohorts } from "@/core/hooks/useCohorts";
import createAxiosInstance from "@/core/apis/axiosConfig";

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { Site } from "@/app/types/sites";
import { Device } from "@/app/types/devices";
const chartData = [
  { month: "January", good: 186, moderate: 80, uhfsg: 200, unhealthy: 100, veryunhealthy: 150, hazadrous: 50 },
  { month: "February", good: 305, moderate: 200, uhfsg: 100, unhealthy: 80, veryunhealthy: 50, hazadrous: 40 },
  { month: "March", good: 237, moderate: 120, uhfsg: 300, unhealthy: 150, veryunhealthy: 60, hazadrous: 100 },
  { month: "April", good: 73, moderate: 190, uhfsg: 350, unhealthy: 100, veryunhealthy: 50, hazadrous: 200 },
  { month: "May", good: 209, moderate: 130, uhfsg: 170, unhealthy: 46, veryunhealthy: 70, hazadrous: 30 }, 
  { month: "June", good: 214, moderate: 140, uhfsg: 200, unhealthy: 100, veryunhealthy: 100, hazadrous: 50 },
  { month: "July", good: 186, moderate: 80, uhfsg: 200, unhealthy: 40, veryunhealthy: 70, hazadrous: 150 },
  { month: "August", good: 305, moderate: 200, uhfsg: 100, unhealthy: 350, veryunhealthy: 50, hazadrous: 100 },
  { month: "September", good: 237, moderate: 120, uhfsg: 230, unhealthy: 96, veryunhealthy: 89, hazadrous: 200 },
  { month: "October", good: 73, moderate: 190, uhfsg: 350, unhealthy: 100, veryunhealthy: 250, hazadrous: 95 },
  { month: "November", good: 209, moderate: 130, uhfsg: 76, unhealthy: 40, veryunhealthy: 200, hazadrous: 50 },
  { month: "December", good: 214, moderate: 140, uhfsg: 40, unhealthy: 200, veryunhealthy: 50, hazadrous: 170 },
]

const chartConfig = {
  good: {
    label: "good",
    color: "hsl(var(--chart-6))",
  },
  moderate: {
    label: "moderate",
    color: "hsl(var(--chart-7))",
  },
  uhfsg: {
    label: "uhfsg",
    color: "hsl(var(--chart-6))",
  },
  unhealthy: {
    label: "unhealthy",
    color: "hsl(var(--chart-7))",
  },
  veryunhealty: {
    label: "veryunhealty",
    color: "hsl(var(--chart-6))",
  },
  hazadrous: {
    label: "hazadrous",
    color: "hsl(var(--chart-6))",
  },
} satisfies ChartConfig

interface Filters {
  pollutant: string;
  standard: string;
  startDate: string;
  endDate: string;
}

interface LineChartsProps {
  analyticsSites: Site[];
  analyticsDevices: Device[];
  isGrids: boolean;
  isCohorts: boolean;
}

export function LineCharts({
  analyticsSites,
  isGrids,
  isCohorts,
  analyticsDevices,
}: LineChartsProps) {
  const [loading, setLoading] = useState(false);
  const [averageSites, setAverageSites] = useState<string[]>([]);
  const [averageDevices, setAverageDevices] = useState<string[]>([]);
  const { cohorts } = useCohorts();
  const [dataset, setDataset] = useState([]);
  const [pollutant, setPollutant] = useState({ value: "pm2_5", label: "PM 2.5" });
  const [standard, setStandard] = useState({ value: "aqi", label: "AQI" });

  useEffect(() => {
    setLoading(true);
    if (isGrids) {
      const siteOptions = analyticsSites.map((site) => site.id);
      setAverageSites(siteOptions);
    }
    setLoading(false);
  }, [analyticsSites, cohorts, isGrids]);

  useEffect(() => {
    setLoading(true);
    if (isCohorts) {
      const deviceOptions = analyticsDevices.map((device) => device.long_name);
      setAverageDevices(deviceOptions);
    }
    setLoading(false);
  }, [analyticsDevices, isCohorts]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const filter: Filters = {
        pollutant: pollutant.value,
        standard: standard.value,
        startDate: roundToStartOfDay(new Date()).toISOString(),
        endDate: roundToEndOfDay(new Date()).toISOString(),
      };
      try {
        const response = await createAxiosInstance().post(
          isCohorts ? DEVICE_EXCEEDANCES_URI : EXCEEDANCES_DATA_URI,
          filter
        );
        const data = response.data.data;
        setDataset(data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    if (isGrids && averageSites.length) {
      fetchData();
    } else if (isCohorts && averageDevices.length) {
      fetchData();
    }
  }, [averageSites, averageDevices, isGrids, isCohorts, pollutant, standard]);
  return (
    <div>
        <ChartContainer config={chartConfig}>
        <LineChart
            width={500}
            height={200}
            accessibilityLayer
            data={chartData}
            margin={{
            left: 12,
            right: 12,
            }}
        >
            <CartesianGrid vertical={false} />
            <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
            dataKey="good"
            type="monotone"
            stroke="#45e50d"
            strokeWidth={2}
            dot={false}
            />
            <Line
            dataKey="moderate"
            type="monotone"
            stroke="#f8fe28"
            strokeWidth={2}
            dot={false}
            />
            <Line
            dataKey="uhfsg"
            type="monotone"
            stroke="#ee8310"
            strokeWidth={2}
            dot={false}
            />
            <Line
            dataKey="unhealthy"
            type="monotone"
            stroke="#fe0000"
            strokeWidth={2}
            dot={false}
            />
            <Line
            dataKey="veryunhealthy"
            type="monotone"
            stroke="#808080"
            strokeWidth={2}
            dot={false}
            />
            <Line
            dataKey="hazadrous"
            type="monotone"
            stroke="#81202e"
            strokeWidth={2}
            dot={false}
            />
        </LineChart>
        </ChartContainer>
    </div>

  )
}

function roundToStartOfDay(date: Date): Date {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0); 
  return startOfDay;
}

function roundToEndOfDay(date: Date): Date {
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999); 
  return endOfDay;
}

