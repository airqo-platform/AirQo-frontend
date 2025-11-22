"use client"

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  RefreshCw,
  Layers,
  Settings,
  Database,
  Search,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Pagination } from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import categoryService from '@/services/category.service';
import { CategoryWithDevices } from '@/types/category.types';

const CategoryDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const categoryName = decodeURIComponent(params?.categoryId as string);

  // Pagination and filtering state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [networkFilter, setNetworkFilter] = useState<string>("airqo");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const skip = (currentPage - 1) * pageSize;

  const {
    data: categoryData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['category', categoryName, skip, pageSize, networkFilter, debouncedSearch],
    queryFn: () => categoryService.getCategoryByName(categoryName, {
      skip,
      limit: pageSize,
      network: networkFilter && networkFilter !== "all" ? networkFilter : undefined,
      search: debouncedSearch || undefined,
    }),
    enabled: !!categoryName,
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newSize: string) => {
    setPageSize(Number(newSize));
    setCurrentPage(1); // Reset to first page
  };

  const totalPages = categoryData?.pagination?.pages || 0;
  const hasNextPage = categoryData?.pagination?.has_next || false;
  const hasPreviousPage = categoryData?.pagination?.has_previous || false;

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center py-10">
          <p className="text-red-500">Error loading category details</p>
          <Button 
            onClick={() => refetch()} 
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <Button 
            variant="ghost" 
            className="mb-2 pl-0 -ml-3" 
            onClick={() => router.push('/dashboard/category')}
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to categories
          </Button>
          <h1 className="text-2xl font-bold text-gray-800">{categoryData?.name || 'Category'}</h1>
          <p className="text-gray-600 mt-1">
            {categoryData?.description || 'Manage devices associated with this category'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" /> Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        {/* Total Devices Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {categoryData?.device_count || 0}
            </div>
            {/* <p className="text-xs text-gray-500 mt-1">
              Devices using this category
            </p> */}
          </CardContent>
        </Card>

        {/* Data Fields Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Data Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {categoryData?.fields ? Object.keys(categoryData.fields).length : 0}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {categoryData?.fields && Object.values(categoryData.fields).slice(0, 3).map((field, i) => (
                <Badge key={i} variant="outline">{field}</Badge>
              ))}
              {categoryData?.fields && Object.values(categoryData.fields).length > 3 && (
                <Badge variant="outline">+{Object.values(categoryData.fields).length - 3} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuration Parameters Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Configurations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {categoryData?.configs ? Object.keys(categoryData.configs).length : 0}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {categoryData?.configs && Object.values(categoryData.configs).slice(0, 3).map((config, i) => (
                <Badge key={i} variant="outline">{config}</Badge>
              ))}
              {categoryData?.configs && Object.values(categoryData.configs).length > 3 && (
                <Badge variant="outline">+{Object.values(categoryData.configs).length - 3} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Metadata Fields Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {categoryData?.metadata ? Object.keys(categoryData.metadata).length : 0}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {categoryData?.metadata && Object.values(categoryData.metadata).slice(0, 3).map((meta, i) => (
                <Badge key={i} variant="outline">{meta}</Badge>
              ))}
              {categoryData?.metadata && Object.values(categoryData.metadata).length > 3 && (
                <Badge variant="outline">+{Object.values(categoryData.metadata).length - 3} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search devices by name, device ID, or site ID..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* <div className="w-full md:w-48">
              <Select value={networkFilter} onValueChange={setNetworkFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by network" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Networks</SelectItem>
                  <SelectItem value="airqo">AirQo</SelectItem>
                  <SelectItem value="kcca">KCCA</SelectItem>
                  <SelectItem value="us_embassy">US Embassy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-32">
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 / page</SelectItem>
                  <SelectItem value="25">25 / page</SelectItem>
                  <SelectItem value="50">50 / page</SelectItem>
                  <SelectItem value="100">100 / page</SelectItem>
                </SelectContent>
              </Select>
            </div> */}
          </div>
        </CardContent>
      </Card>

      {/* Devices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Devices ({categoryData?.pagination?.total || 0})</CardTitle>
          <CardDescription>
            Showing {categoryData?.pagination?.returned || 0} of {categoryData?.pagination?.total || 0} devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : categoryData?.devices && categoryData.devices.length > 0 ? (
            <>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-[150px]">Device Name</TableHead>
                      <TableHead className="min-w-[100px]">Device Key</TableHead>
                      {categoryData?.configs && Object.entries(categoryData.configs).map(([key, configName]) => (
                        <TableHead key={key} className="min-w-[150px]">
                          {configName}
                        </TableHead>
                      ))}
                      <TableHead className="text-right min-w-[120px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categoryData.devices.map((device) => (
                      <TableRow key={device.device_key}>
                        <TableCell>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className={`w-2 h-2 rounded-full ${
                                      device.config_updated 
                                        ? 'bg-green-500' 
                                        : 'bg-gray-400'
                                    }`}
                                  />
                                  <span className="font-medium">{device.name}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>
                                  {device.config_updated 
                                    ? 'Configuration updated' 
                                    : 'Configuration not updated'}
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {device.device_key}
                          </code>
                        </TableCell>
                        {categoryData?.configs && Object.keys(categoryData.configs).map((configKey) => {
                          const configValue = device.recent_config?.[configKey];
                          return (
                            <TableCell key={configKey}>
                              {configValue !== null && configValue !== undefined ? (
                                <span className="text-sm">{configValue}</span>
                              ) : (
                                <span className="text-gray-400 text-sm italic">Not set</span>
                              )}
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/dashboard/devices/${device.device_id}`)}
                          >
                            View Details
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Items per page:</span>
                      <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={handlePageChange}
                      showInfo={true}
                      totalItems={categoryData?.pagination?.total || 0}
                      itemsPerPage={pageSize}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-10">
              <Database className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No devices found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || (networkFilter && networkFilter !== "all") ? "Try adjusting your filters" : "No devices are associated with this category yet"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Info Footer */}
      <Card className="mt-6">
        <CardContent className="p-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <div>
              <span className="font-medium">Created:</span> {formatDate(categoryData?.created_at || '')}
            </div>
            {categoryData?.updated_at && (
              <div>
                <span className="font-medium">Last Updated:</span> {formatDate(categoryData.updated_at)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryDetailsPage;
