"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateRangePicker } from "@/components/features/grids/date-range-picker";
import { useGridDetails } from "@/core/hooks/useGrids";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import ReusableButton from "@/components/shared/button/ReusableButton";
import { AqArrowLeft } from "@airqo/icons-react";
import GridDetailsCard from "@/components/features/grids/grid-details-card";
import GridMeasurementsApiCard from "@/components/features/grids/grid-measurements-api-card";
import EditGridDetailsDialog from "@/components/features/grids/edit-grid-details-dialog";
import SitesTable from "@/components/features/sites/sites-list-table";

export default function GridDetailsPage() {
  const router = useRouter();
  const { id } = useParams();
  const gridId = id.toString();
  const { gridDetails, isLoading, error } = useGridDetails(gridId);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  console.log(gridDetails)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error?.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!gridDetails) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>Grid with ID {gridId} not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <RouteGuard permission="SITE_VIEW">
      <div className="flex flex-col gap-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <ReusableButton variant="text" onClick={() => router.back()} Icon={AqArrowLeft}>
            Back
          </ReusableButton>
        </div>

        {/* Grid Details Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <GridDetailsCard grid={gridDetails} onEdit={() => setIsEditDialogOpen(true)} loading={isLoading} />
          </div>
          <div className="lg:col-span-1">
            <GridMeasurementsApiCard grid={gridDetails} loading={isLoading} />
          </div>
        </div>
        {/* Grid Sites */}
        <SitesTable sites={gridDetails.sites} isLoading={isLoading} error={error} />

          {/* Reports Section */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Data Summary Report */}
            <Card>
              <CardHeader>
                <CardTitle>Generate Grid Data Summary Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Select the time period of your interest to generate the
                  report for this grid.
                </p>
                <DateRangePicker />
                <ReusableButton className="w-full" variant="outlined">
                  Generate Data Summary Report
                </ReusableButton>
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
                  Select the time period of your interest to view the
                  uptime report for this grid.
                </p>
                <DateRangePicker />
                <ReusableButton className="w-full" variant="outlined">
                  Generate Uptime Report for the Grid
                </ReusableButton>
                <div className="h-32 flex items-center justify-center border rounded-md bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    Grid uptime report will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        <EditGridDetailsDialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} grid={gridDetails} />
      </div>
    </RouteGuard>
  );
}
