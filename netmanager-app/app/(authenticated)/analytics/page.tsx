import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Analytics() {
  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-foreground mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">156</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Active Sites</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">42</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Data Points Collected</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">1.2M</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
