"use client";

import { Device } from "@/app/types/sites";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CircuitBoard } from "lucide-react";

interface SiteDevicesProps {
  devices: Device[];
}

export function SiteDevices({ devices }: SiteDevicesProps) {
  if (!devices.length) {
    return (
      <div className="border rounded-lg p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <CircuitBoard className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No devices found</h3>
          <p className="text-sm text-gray-500">
            There are no devices deployed at this site yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Site</TableHead>
            <TableHead>Is Primary</TableHead>
            <TableHead>Is Co-located</TableHead>
            <TableHead>Added On</TableHead>
            <TableHead>Deployment status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {devices.map((device) => (
            <TableRow key={device.name}>
              <TableCell>{device.name}</TableCell>
              <TableCell>{device.description || "N/A"}</TableCell>
              <TableCell>{device.site || "N/A"}</TableCell>
              <TableCell>
                <Badge variant={device.isPrimary ? "default" : "secondary"}>
                  {device.isPrimary ? "Yes" : "No"}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={device.isCoLocated ? "default" : "secondary"}>
                  {device.isCoLocated ? "Yes" : "No"}
                </Badge>
              </TableCell>
              <TableCell>{device.registrationDate}</TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
