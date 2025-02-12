"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, Copy, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GridSitesTable } from "@/components/grids/grid-sites";
import { DateRangePicker } from "@/components/grids/date-range-picker";
import { useGridDetails, useUpdateGridDetails } from "@/core/hooks/useGrids";
import { Grid } from "@/app/types/grids";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { toast } from "sonner";

export default function GridDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const { gridDetails, isLoading, error } = useGridDetails(id.toString());
  const {
    updateGridDetails,
    isLoading: isSaving,
    error: saveError,
  } = useUpdateGridDetails(id.toString());
  const [gridData, setGridData] = useState<Grid>({
    name: "",
    _id: "",
    visibility: false,
    admin_level: "",
    network: "",
    long_name: "",
    createdAt: "",
    sites: [],
    numberOfSites: 0,
  } as Grid);
  const [originalGridData, setOriginalGridData] = useState<Grid>({
    name: "",
    _id: "",
    visibility: false,
    admin_level: "",
    network: "",
    long_name: "",
    createdAt: "",
    sites: [],
    numberOfSites: 0,
  } as Grid);

  // Memoize gridDetails to prevent unnecessary re-renders
  const memoizedGridDetails = useMemo(() => gridDetails, [gridDetails]);

  useEffect(() => {
    if (memoizedGridDetails) {
      setGridData({ ...memoizedGridDetails });
      setOriginalGridData({ ...memoizedGridDetails });
    }
  }, [memoizedGridDetails]);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleReset = () => {
    setGridData({ ...originalGridData });
  };

  const handleSave = async () => {
    const updatedFields: Partial<Grid> = {
      name: gridData.name,
      admin_level: gridData.admin_level,
    };
    if (gridData.visibility !== originalGridData.visibility) {
      updatedFields.visibility = gridData.visibility;
    }

    try {
      await updateGridDetails(updatedFields);
      toast("Grid details updated successfully");
    } catch (error) {
      console.error(error);
      toast("Failed to update grid details");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || saveError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error?.message || saveError?.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
            <Input id="gridName" value={gridData.name || ""} readOnly />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gridId">Grid ID *</Label>
            <div className="flex gap-2">
              <Input id="gridId" value={gridData._id || ""} readOnly />
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopyToClipboard(gridData._id || "")}
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
              value={
                gridData.visibility !== undefined
                  ? gridData.visibility.toString()
                  : "false"
              }
              onValueChange={(value) =>
                setGridData({ ...gridData, visibility: value === "true" })
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
              value={gridData.admin_level || ""}
              readOnly
            />
          </div>
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
          <Button variant="outline" onClick={handleReset} disabled={isSaving}>
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            Save Changes
          </Button>
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
