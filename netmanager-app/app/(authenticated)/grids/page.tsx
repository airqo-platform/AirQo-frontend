"use client";

import { useState } from "react";
import { Search, Download } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { CreateGridForm } from "@/components/grids/create-grid";

// Sample data matching the screenshot
const grids = [
  {
    name: "gambia",
    numberOfSites: 13,
    adminLevel: "country",
    visibility: true,
    dateCreated: "2024-11-19T20:31:53.731Z",
  },
  {
    name: "rubaga",
    numberOfSites: 12,
    adminLevel: "division",
    visibility: true,
    dateCreated: "2024-09-13T22:32:30.688Z",
  },
  {
    name: "kampala_central",
    numberOfSites: 28,
    adminLevel: "division",
    visibility: true,
    dateCreated: "2024-09-13T22:27:49.771Z",
  },
  {
    name: "nakawa",
    numberOfSites: 18,
    adminLevel: "division",
    visibility: true,
    dateCreated: "2024-09-13T22:13:40.199Z",
  },
  {
    name: "fort_portal",
    numberOfSites: 9,
    adminLevel: "city",
    visibility: true,
    dateCreated: "2024-04-29T12:54:23.825Z",
  },
];

export default function GridsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 8;

  const filteredGrids = grids.filter(
    (grid) =>
      grid.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      grid.adminLevel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredGrids.length / rowsPerPage);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  // Format date to be more readable
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

  const renderPaginationNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      return pages.map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? "default" : "outline"}
          size="icon"
          onClick={() => setCurrentPage(page)}
        >
          {page}
        </Button>
      ));
    }

    // Always show first page
    pageNumbers.push(
      <Button
        key={1}
        variant={currentPage === 1 ? "default" : "outline"}
        size="icon"
        onClick={() => setCurrentPage(1)}
      >
        1
      </Button>
    );

    // Calculate start and end of middle section
    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pageNumbers.push(
        <span key="ellipsis1" className="px-2">
          ...
        </span>
      );
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="icon"
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Button>
      );
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push(
        <span key="ellipsis2" className="px-2">
          ...
        </span>
      );
    }

    // Always show last page
    if (totalPages > 1) {
      pageNumbers.push(
        <Button
          key={totalPages}
          variant={currentPage === totalPages ? "default" : "outline"}
          size="icon"
          onClick={() => setCurrentPage(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    return pageNumbers;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Grid Registry</h1>
          <p className="text-sm text-muted-foreground">
            Manage and organize your monitoring grids
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <CreateGridForm />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search grids..."
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
              <TableHead>Grid Name</TableHead>
              <TableHead className="text-right">Number of sites</TableHead>
              <TableHead>Admin level</TableHead>
              <TableHead>Visibility</TableHead>
              <TableHead>Date created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredGrids
              .slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
              .map((grid) => (
                <TableRow key={grid.name}>
                  <TableCell className="font-medium">{grid.name}</TableCell>
                  <TableCell className="text-right">
                    {grid.numberOfSites}
                  </TableCell>
                  <TableCell>{grid.adminLevel}</TableCell>
                  <TableCell>
                    <Badge variant={grid.visibility ? "default" : "secondary"}>
                      {grid.visibility ? "Visible" : "Hidden"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(grid.dateCreated)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-center space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </Button>
        <div className="flex items-center space-x-2">
          {renderPaginationNumbers()}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
