import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChartOne from "@/components/Charts/ChartOne";
import ChartTwo from "@/components/Charts/Charttwo";

export default function Analytics() {
  return (
      <div className="p-2">
        <h1 className="text-2xl font-semibold text-foreground mb-6">Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Total Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold">156</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Active Sites</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold">42</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Data Points Collected</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-semibold">1.2M</p>
            </CardContent>
          </Card>
        </div>
        <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        <ChartOne />
        <ChartTwo />
      </div>

      </div>
  );
}
