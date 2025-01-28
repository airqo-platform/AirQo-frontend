"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GridSitesTable } from "@/components/grids/grid-sites";
import { DateRangePicker } from "@/components/grids/date-range-picker";

export default function GridDetailsPage() {
  const router = useRouter();
  const [gridData, setGridData] = useState({
    name: "gambia",
    id: "673cf5b9328bd600130351c4",
    visibility: "true",
    administrativeLevel: "country",
    description: "",
  });

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleReset = () => {
    // Reset form to original values
  };

  const handleSave = () => {
    // Save changes
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
          Grid Details
        </Button>
      </div>

      {/* Grid Details Form */}
      <div className="grid gap-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="gridName">Grid name *</Label>
            <Input
              id="gridName"
              value={gridData.name}
              onChange={(e) =>
                setGridData({ ...gridData, name: e.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gridId">Grid ID *</Label>
            <div className="flex gap-2">
              <Input id="gridId" value={gridData.id} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopyToClipboard(gridData.id)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility *</Label>
            <Select
              value={gridData.visibility}
              onValueChange={(value) =>
                setGridData({ ...gridData, visibility: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select visibility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">True</SelectItem>
                <SelectItem value="false">False</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="adminLevel">Administrative level *</Label>
            <Input
              id="adminLevel"
              value={gridData.administrativeLevel}
              onChange={(e) =>
                setGridData({
                  ...gridData,
                  administrativeLevel: e.target.value,
                })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={gridData.description}
            onChange={(e) =>
              setGridData({ ...gridData, description: e.target.value })
            }
            rows={4}
          />
        </div>

        {/* API Endpoints */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Recent Measurements API</Label>
            <div className="flex gap-2">
              <Input
                value="https://api.airqo.net/api/v2/devices/measurements"
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  handleCopyToClipboard(
                    "https://api.airqo.net/api/v2/devices/measurements"
                  )
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Historical Measurements API</Label>
            <div className="flex gap-2">
              <Input
                value="https://api.airqo.net/api/v2/devices/measurements"
                readOnly
                className="font-mono text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  handleCopyToClipboard(
                    "https://api.airqo.net/api/v2/devices/measurements"
                  )
                }
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>

        {/* Grid Sites */}
        <Card>
          <CardHeader>
            <CardTitle>Grid Sites details</CardTitle>
          </CardHeader>
          <CardContent>
            <GridSitesTable />
          </CardContent>
        </Card>

        {/* Reports Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Data Summary Report */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Grid Data Summary Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select the time period of your interest to generate the report
                for this airloud
              </p>
              <DateRangePicker />
              <Button className="w-full" variant="outline">
                Generate Data Summary Report
              </Button>
              <div className="h-32 flex items-center justify-center border rounded-md bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Grid data summary report will appear here
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Uptime Report */}
          <Card>
            <CardHeader>
              <CardTitle>Generate Grid Uptime Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Select the time period of your interest to view the uptime
                report for this airloud
              </p>
              <DateRangePicker />
              <Button className="w-full" variant="outline">
                Generate Uptime Report for the Grid
              </Button>
              <div className="h-32 flex items-center justify-center border rounded-md bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  Grid uptime report will appear here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
