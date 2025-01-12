import React from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import ChartOne from "@/components/Charts/ChartOne";
// import ChartTwo from "@/components/Charts/Charttwo";
import {ChartThree} from "@/components/Charts/ChartThree";
import { ChartFour } from "@/components/Charts/ChartFour";
import { PieCharts } from "@/components/Charts/Pie";
import { Speed } from "@/components/Charts/Speed";
import { PMchart } from "@/components/Charts/PMchart";

export default function Analytics() {
  return (
      <div className="p-2">
        <h1 className="text-2xl font-semibold text-foreground mb-6">Dashboard</h1>
        <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
          <ChartThree />
          <ChartFour />
        </div>
        <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
          <PieCharts />
          <Speed />
          <PMchart />
        </div>

      </div>
  );
}
