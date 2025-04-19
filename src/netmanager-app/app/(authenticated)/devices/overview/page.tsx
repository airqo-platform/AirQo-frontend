"use client";

import { useState } from "react";
import { Plus, Search, Loader2, ArrowUpDown, Upload, Copy } from "lucide-react";
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDevices } from "@/core/hooks/useDevices";
import { Device } from "@/app/types/devices";
import { RouteGuard } from "@/components/route-guard";
import { toast } from "sonner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAppSelector } from "@/core/redux/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ImportDeviceForm } from "@/components/devices/import-device-form";
import { AddAirQoDeviceForm } from "@/components/devices/add-airqo-device-form";
import { useRouter } from "next/navigation";

const ITEMS_PER_PAGE = 8;

type SortField = "name" | "status" | "category" | "createdAt";
type SortOrder = "asc" | "desc";

export default function DevicesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const { devices, isLoading, error } = useDevices();
  const activeNetwork = useAppSelector((state) => state.user.activeNetwork);
  const router = useRouter();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const sortDevices = (devicesToSort: Device[]) => {
    return [...devicesToSort].sort((a, b) => {
      if (sortField === "createdAt") {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
      }

      let compareA = a[sortField]?.toString() || "";
      let compareB = b[sortField]?.toString() || "";

      if (typeof compareA === "string") {
        compareA = compareA.toLowerCase();
        compareB = compareB.toLowerCase();
      }

      if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
      if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  };

  const filteredDevices = devices.filter((device: Device) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      device.name?.toLowerCase().includes(searchLower) ||
      device.long_name?.toLowerCase().includes(searchLower) ||
      device._id?.toLowerCase().includes(searchLower) ||
      device.description?.toLowerCase().includes(searchLower) ||
      device.device_codes.some((code) =>
        code ? code.toLowerCase().includes(searchLower) : false
      )
    );
  });

  const sortedDevices = sortDevices(filteredDevices);

  // Pagination calculations
  const totalPages = Math.ceil(sortedDevices.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentDevices = sortedDevices.slice(startIndex, endIndex);

  // Add this function for pagination numbers
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

  const truncateId = (id: string) => {
    if (id.length <= 6) return id;
    return `${id.slice(0, 3)}***${id.slice(-2)}`;
  };

  const truncateText = (text: string, maxLength: number = 20) => {
    if (!text) return "";
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  const handleDeviceClick = (deviceId: string) => {
    router.push(`/devices/${deviceId}`);
  };

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
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <RouteGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_DEVICES">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Device Registry</h1>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Device
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Import Existing Device</DialogTitle>
                  <DialogDescription>
                    Enter the details of an existing device to import it into the system.
                  </DialogDescription>
                </DialogHeader>
                <ImportDeviceForm />
              </DialogContent>
            </Dialog>

            {activeNetwork?.net_name === "airqo" && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add AirQo Device
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add AirQo Device</DialogTitle>
                    <DialogDescription>
                      Register a new AirQo device in the system.
                    </DialogDescription>
                  </DialogHeader>
                  <AddAirQoDeviceForm />
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search devices..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-2">
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
              <DropdownMenuItem onClick={() => handleSort("status")}>
                Status{" "}
                {sortField === "status" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("category")}>
                Category{" "}
                {sortField === "category" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  Device Name{" "}
                  {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Device ID</TableHead>
                <TableHead>Site</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  Status{" "}
                  {sortField === "status" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  Deployment Date{" "}
                  {sortField === "createdAt" &&
                    (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentDevices.map((device: Device) => (
                <TableRow 
                  key={device._id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleDeviceClick(device._id)}
                >
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="font-medium uppercase">
                              {truncateText(device.long_name, 25)}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="uppercase">{device.long_name}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <span
                        className="text-sm text-muted-foreground max-w-[200px] truncate lowercase"
                        title={device.description}
                      >
                        {device.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="uppercase font-mono">
                        {truncateId(device._id)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigator.clipboard.writeText(device._id);
                          toast("Device ID copied to clipboard");
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="uppercase">
                            {truncateText(device.site?.name || "Not assigned")}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="uppercase">
                            {device.site?.name || "Not assigned"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        device.status === "deployed"
                          ? "bg-green-100 text-green-800"
                          : device.status === "recalled"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {device.status === "deployed"
                        ? "Deployed"
                        : device.status === "recalled"
                        ? "Recalled"
                        : "Not Deployed"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {new Date(device.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </TableCell>
                </TableRow>
              ))}
              {currentDevices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No devices found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {sortedDevices.length > 0 && (
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
