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

interface SiteDevicesProps {
  devices: Device[];
}

export function SiteDevices({ devices }: SiteDevicesProps) {
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
