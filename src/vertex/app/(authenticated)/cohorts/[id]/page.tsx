"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Copy, Search, Trash2 } from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddDevicesDialog } from "@/components/features/cohorts/assign-cohort-devices";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";

// Sample cohort data
const cohortData = {
  name: "victoria_sugar",
  id: "675bd462c06188001333d4d5",
  visibility: "true",
};

// Sample devices data
const devices = [
  {
    name: "Aq_29",
    description: "AIRQO UNIT with PMS5003 Victoria S",
    site: "N/A",
    deploymentStatus: "Deployed",
    dateCreated: "2019-03-02T00:00:00.000Z",
  },
  {
    name: "Aq_34",
    description: "AIRQO UNIT with PMS5003 Victoria S",
    site: "N/A",
    deploymentStatus: "Deployed",
    dateCreated: "2019-03-14T00:00:00.000Z",
  },
  {
    name: "Aq_35",
    description: "AIRQO UNIT with PMS5003 Victoria S",
    site: "N/A",
    deploymentStatus: "Deployed",
    dateCreated: "2019-03-28T00:00:00.000Z",
  },
];

export default function CohortDetailsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [cohortDetails, setCohortDetails] = useState(cohortData);

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleReset = () => {
    setCohortDetails(cohortData);
  };

  const handleSave = () => {
    console.log("Saving changes:", cohortDetails);
  };

  const filteredDevices = devices.filter((device) =>
    Object.values(device).some((value) =>
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <RouteGuard permission="DEVICE_VIEW">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Button variant="ghost" className="gap-2" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
            Cohort Details
          </Button>
          <AddDevicesDialog />
        </div>

        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cohortName">Cohort name *</Label>
              <Input
                id="cohortName"
                value={cohortDetails.name}
                onChange={(e) =>
                  setCohortDetails({ ...cohortDetails, name: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cohortId">Cohort ID *</Label>
              <div className="flex gap-2">
                <Input id="cohortId" value={cohortDetails.id} readOnly />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyToClipboard(cohortDetails.id)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="visibility">Visibility *</Label>
            <Select
              value={cohortDetails.visibility}
              onValueChange={(value) =>
                setCohortDetails({ ...cohortDetails, visibility: value })
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

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Cohort devices</h2>
            <div className="flex items-center justify-between">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search devices..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Device Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Site</TableHead>
                    <TableHead>Deployment status</TableHead>
                    <TableHead>Date created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDevices.map((device) => (
                    <TableRow key={device.name}>
                      <TableCell className="font-medium">{device.name}</TableCell>
                      <TableCell>{device.description}</TableCell>
                      <TableCell>{device.site}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            device.deploymentStatus === "Deployed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {device.deploymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(device.dateCreated)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
