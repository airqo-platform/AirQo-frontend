"use client"

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
const chartData = [
  { month: "January", good: 186, moderate: 80, uhfsg: 200, unhealthy: 100, veryunhealthy: 150, hazadrous: 50 },
  { month: "February", good: 305, moderate: 200, uhfsg: 100, unhealthy: 80, veryunhealthy: 50, hazadrous: 40 },
  { month: "March", good: 237, moderate: 120, uhfsg: 300, unhealthy: 150, veryunhealthy: 60, hazadrous: 100 },
  { month: "April", good: 73, moderate: 190, uhfsg: 350, unhealthy: 100, veryunhealthy: 50, hazadrous: 200 },
  { month: "May", good: 209, moderate: 130, uhfsg: 170, unhealthy: 46, veryunhealthy: 70, hazadrous: 30 }, 
  { month: "June", good: 214, moderate: 140, uhfsg: 200, unhealthy: 100, veryunhealthy: 100, hazadrous: 50 },
  // { month: "July", good: 186, moderate: 80, uhfsg: 200, unhealthy: 40, veryunhealthy: 70, hazadrous: 150 },
  // { month: "August", good: 305, moderate: 200, uhfsg: 100, unhealthy: 350, veryunhealthy: 50, hazadrous: 100 },
  // { month: "September", good: 237, moderate: 120, uhfsg: 230, unhealthy: 96, veryunhealthy: 89, hazadrous: 200 },
  // { month: "October", good: 73, moderate: 190, uhfsg: 350, unhealthy: 100, veryunhealthy: 250, hazadrous: 95 },
  // { month: "November", good: 209, moderate: 130, uhfsg: 76, unhealthy: 40, veryunhealthy: 200, hazadrous: 50 },
  // { month: "December", good: 214, moderate: 140, uhfsg: 40, unhealthy: 200, veryunhealthy: 50, hazadrous: 170 },
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

export function BarCharts() {
  return (
    <div>
        <ChartContainer config={chartConfig}>
          <BarChart 
            accessibilityLayer 
            data={chartData}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="good" fill="#45e50d" radius={6} />
            <Bar dataKey="moderate" fill="#f8fe28" radius={4} />
            <Bar dataKey="uhfsg" fill="#ee8310" radius={4} />
            <Bar dataKey="unhealthy" fill="#fe0000" radius={4} />
            <Bar dataKey="veryunhealthy" fill="#8639c0" radius={4} />
            <Bar dataKey="hazadrous" fill="#81202e" radius={4} />
          </BarChart>
        </ChartContainer>
    </div>
  )
}

