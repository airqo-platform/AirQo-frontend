"use client";

import { useState } from "react";
import { Search, Loader2, ArrowUpDown } from "lucide-react";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useRouter } from "next/navigation";
import { RouteGuard } from "@/components/layout/accessConfig/route-guard";
import { useSites } from "@/core/hooks/useSites";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Site } from "@/core/redux/slices/sitesSlice";
import { CreateSiteForm } from "./create-site-form";

const ITEMS_PER_PAGE = 8;

type SortField = "name" | "description" | "isOnline" | "createdAt";
type SortOrder = "asc" | "desc";

export default function SitesPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const { sites, isLoading, error } = useSites();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortSites = (sitesToSort: Site[]) => {
    return [...sitesToSort].sort((a, b) => {
      // Handle createdAt sorting
      if (sortField === "createdAt") {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }

      // Handle other fields as before
      let compareA = a[sortField].toString();
      let compareB = b[sortField].toString();

      if (sortField === "isOnline") {
        return sortOrder === "asc"
          ? Number(b.isOnline) - Number(a.isOnline)
          : Number(a.isOnline) - Number(b.isOnline);
      }

      if (typeof compareA === "string") {
        compareA = compareA.toLowerCase();
        compareB = compareB.toLowerCase();
      }

      if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
      if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  const filteredSites = sites.filter((site: Site) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      site.name?.toLowerCase().includes(searchLower) ||
      site.location_name?.toLowerCase().includes(searchLower) ||
      site.generated_name?.toLowerCase().includes(searchLower) ||
      site.formatted_name?.toLowerCase().includes(searchLower)
    );
  });

  const sortedSites = sortSites(filteredSites);

  // Pagination calculations
  const totalPages = Math.ceil(sortedSites.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentSites = sortedSites.slice(startIndex, endIndex);

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages is less than max visible
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show pages with ellipsis
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("ellipsis");
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push("ellipsis");
        pageNumbers.push(totalPages);
      }
    }
    return pageNumbers;
  };

  return (
    <RouteGuard 
      permission="SITE_VIEW"
      allowedContexts={['airqo-internal', 'external-org']}
    >
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Sites</h1>
          <div className="flex gap-2">
            <CreateSiteForm disabled={isLoading || !!error} />
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sites..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-2" disabled={isLoading}>
                Sort by <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleSort("createdAt")}>
                Date Created{" "}
                {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("name")}>
                Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("description")}>
                Description{" "}
                {sortField === "description" &&
                  (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("isOnline")}>
                Status{" "}
                {sortField === "isOnline" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className={error ? "" : "cursor-pointer"}
                  onClick={error ? undefined : () => handleSort("name")}
                >
                  Name{" "}
                  {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Site ID</TableHead>
                <TableHead
                  className={error ? "" : "cursor-pointer"}
                  onClick={error ? undefined : () => handleSort("description")}
                >
                  Description{" "}
                  {sortField === "description" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Country</TableHead>
                <TableHead>District</TableHead>
                <TableHead
                  className={error ? "" : "cursor-pointer"}
                  onClick={error ? undefined : () => handleSort("isOnline")}
                >
                  Status{" "}
                  {sortField === "isOnline" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                {/* <TableHead>Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentSites.map((site: Site) => (
                <TableRow
                  key={site._id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/sites/${site._id}`)}
                >
                  <TableCell>{site.name}</TableCell>
                  <TableCell>{site.generated_name}</TableCell>
                  <TableCell>{site.description}</TableCell>
                  <TableCell>{site.country}</TableCell>
                  <TableCell>{site.district}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        site.isOnline
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {site.isOnline ? "Online" : "Offline"}
                    </span>
                  </TableCell>
                  {/* <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle delete
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell> */}
                </TableRow>
              ))}
              {currentSites.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    {error ? (
                      <div className="flex flex-col items-center gap-2">
                        <ExclamationTriangleIcon className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">Unable to load sites</p>
                        <p className="text-sm text-muted-foreground">{error.message}</p>
                      </div>
                    ) : searchQuery ? (
                      "No sites found matching your search"
                    ) : (
                      "No sites available"
                    )}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {sortedSites.length > 0 && !error && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {getPageNumbers().map((pageNumber, index) => (
                  <PaginationItem key={index}>
                    {pageNumber === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNumber as number)}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </RouteGuard>
  );
}
