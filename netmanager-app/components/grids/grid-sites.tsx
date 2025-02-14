"use client";

import { useState } from "react";
import { Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Sample data
const sites = [
  {
    name: "McCarthy Square, Banjul",
    siteId: "site_495",
    parish: "",
    subCounty: "",
    city: "Serrekunda",
    district: "Bakau",
    region: "Kanifing",
    country: "The Gambia",
  },
  {
    name: "Kanifing",
    siteId: "site_496",
    parish: "",
    subCounty: "",
    city: "Serrekunda",
    district: "Bakau",
    region: "Kanifing",
    country: "The Gambia",
  },
  {
    name: "Westfield Junction",
    siteId: "site_497",
    parish: "",
    subCounty: "",
    city: "Serrekunda",
    district: "Bakau",
    region: "Kanifing",
    country: "The Gambia",
  },
];

export function GridSitesTable() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSites = sites.filter((site) =>
    Object.values(site).some((value) =>
      value.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sites..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Download className="h-4 w-4" />
        </Button>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Site Name</TableHead>
              <TableHead>Site ID</TableHead>
              <TableHead>Parish</TableHead>
              <TableHead>Sub county</TableHead>
              <TableHead>City</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Country</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSites.map((site) => (
              <TableRow key={site.siteId}>
                <TableCell>{site.name}</TableCell>
                <TableCell>{site.siteId}</TableCell>
                <TableCell>{site.parish || "—"}</TableCell>
                <TableCell>{site.subCounty || "—"}</TableCell>
                <TableCell>{site.city}</TableCell>
                <TableCell>{site.district}</TableCell>
                <TableCell>{site.region}</TableCell>
                <TableCell>{site.country}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
