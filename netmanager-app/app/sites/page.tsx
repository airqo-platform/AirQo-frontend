"use client";

import { useState } from "react";
import { Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SiteForm } from "@/app/sites/site-form";
import { useRouter } from "next/navigation";

// Sample data
const sites = [
  {
    id: "site_528",
    name: "Water and Environment House, Luzira",
    description: "Water and Environment House, Luzira",
    country: "Uganda",
    district: "Kampala",
    region: "Central Region",
  },
  {
    id: "site_527",
    name: "All Saints Church, Nakasero",
    description: "All Saints Church, Nakasero, Kampala, Uganda",
    country: "Uganda",
    district: "Kampala",
    region: "Central Region",
  },
  {
    id: "site_526",
    name: "Namungona Primary school",
    description: "Namungona Primary school",
    country: "Uganda",
    district: "Kampala",
    region: "Central Region",
  },
];

export default function SitesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSites = sites.filter(
    (site) =>
      site.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      site.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Site Registry for AirQo</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Site
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Site</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new monitoring site.
              </DialogDescription>
            </DialogHeader>
            <SiteForm />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search sites..."
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
              <TableHead>Name</TableHead>
              <TableHead>Site ID</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>District</TableHead>
              <TableHead>Region</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredSites.map((site) => (
              <TableRow
                key={site.id}
                className="cursor-pointer"
                onClick={() => router.push(`/sites/${site.id}`)}
              >
                <TableCell>{site.name}</TableCell>
                <TableCell>{site.id}</TableCell>
                <TableCell>{site.description}</TableCell>
                <TableCell>{site.country}</TableCell>
                <TableCell>{site.district}</TableCell>
                <TableCell>{site.region}</TableCell>
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
  );
}
