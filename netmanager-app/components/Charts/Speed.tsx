"use client"

import React, { useEffect, useState } from 'react'
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"
import { useSites } from "@/core/hooks/useSites"

import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card"
import { ChartConfig, ChartContainer } from "@/components/ui/chart"



export function Speed() {

  const [siteCount, setSiteCount] = useState(0)

  const { sites } = useSites()
  useEffect(() => {
    if (sites) {
      setSiteCount(sites.length)
    }
  }, [sites])

  const chartData = [
    { name: "sites", count: siteCount, fill: "#45e50d" },
  ]

  const chartConfig = {
    sites: {
      label: "Sites",
    },
    name: {
      label: "Sites",
      color: "#45e50d",
    },
  } satisfies ChartConfig

  return (
    <Card className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-4">
      <CardHeader className="items-center pb-0">
        <h4>Devices</h4>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={0}
            endAngle={250}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar dataKey="sites" background cornerRadius={10} />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-bold"
                        >
                          {chartData[0].count.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Sites
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
