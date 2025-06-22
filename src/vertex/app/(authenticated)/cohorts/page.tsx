"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { CreateCohortDialog } from "@/components/features/cohorts/create-cohort";

// Sample data
const cohorts = [
  {
    name: "victoria_sugar",
    numberOfDevices: 5,
    visibility: true,
    dateCreated: "2024-12-13T06:29:54.490Z",
  },
  {
    name: "nairobi_mobile",
    numberOfDevices: 4,
    visibility: false,
    dateCreated: "2024-10-27T18:10:41.672Z",
  },
  {
    name: "car_free_day_demo",
    numberOfDevices: 3,
    visibility: true,
    dateCreated: "2024-09-07T07:00:00.956Z",
  },
  {
    name: "nimr",
    numberOfDevices: 4,
    visibility: false,
    dateCreated: "2024-01-31T05:32:52.642Z",
  },
  {
    name: "map",
    numberOfDevices: 10,
    visibility: true,
    dateCreated: "2024-01-23T09:42:50.735Z",
  },
];

export default function CohortsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCohorts = cohorts.filter((cohort) =>
    cohort.name.toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Cohort Registry</h1>
          <p className="text-sm text-muted-foreground">
            Manage and organize your device cohorts
          </p>
        </div>
        <CreateCohortDialog />
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cohorts..."
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
              <TableHead>Cohort Name</TableHead>
              <TableHead>Number of devices</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Date created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCohorts.map((cohort) => (
              <TableRow
                key={cohort.name}
                className="cursor-pointer"
                onClick={() => router.push(`/cohorts/${cohort.name}`)}
              >
                <TableCell className="font-medium">{cohort.name}</TableCell>
                <TableCell>{cohort.numberOfDevices}</TableCell>
                <TableCell>
                  <Badge variant={cohort.visibility ? "default" : "secondary"}>
                    {cohort.visibility ? "Visible" : "Hidden"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(cohort.dateCreated)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
