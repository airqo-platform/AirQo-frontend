"use client"

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import {
  Search,
  Layers,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from "@/components/ui/pagination";
import categoryService from '@/services/category.service';
import { Category } from '@/types/category.types';

const CategoriesPage = () => {
  const { toast } = useToast();
  const router = useRouter();

  // Pagination and Search States
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // Reset to first page on search
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch categories
  const { data: categoryResponse, isLoading, error } = useQuery({
    queryKey: ['categories', currentPage, pageSize, debouncedSearch],
    queryFn: () => categoryService.getAllCategories({
      page: currentPage,
      page_size: pageSize,
      name: debouncedSearch || undefined
    }),
  });

  const categories = categoryResponse?.categories || [];
  const totalPages = categoryResponse ? Math.ceil(categoryResponse.total / categoryResponse.page_size) : 0;

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Helper to count non-null fields
  const countFields = (obj: any, prefix: string) => {
    if (!obj) return 0;
    let count = 0;
    // Iterate through keys that match the prefix followed by a number
    Object.keys(obj).forEach(key => {
      if (key.startsWith(prefix) && obj[key] && !isNaN(Number(key.replace(prefix, '')))) {
        count++;
      }
    });
    return count;
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Device Categories</h1>
          <p className="text-gray-600 mt-1">Manage categories for your IoT devices</p>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search categories..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))
        ) : error ? (
          // Error state
          <div className="col-span-full text-center py-10">
            <p className="text-red-500">Error loading categories</p>
          </div>
        ) : categories.length === 0 ? (
          // Empty state
          <div className="col-span-full text-center py-10">
            <Layers className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No categories found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Try a different search term" : "No categories found"}
            </p>
          </div>
        ) : (
          // Categories list
          categories.map((category: Category) => (
            <Card
              key={category.name}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/dashboard/category/${encodeURIComponent(category.name)}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="h-8 w-8 text-blue-600" />
                    {category.level && (
                      <Badge variant="secondary" className="capitalize">
                        {category.level}
                      </Badge>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
                <CardTitle className="mt-4">{category.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {category.description || "No description provided"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Data Fields:</span>
                    <span className="font-medium">
                      {countFields(category, 'field')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Config Params:</span>
                    <span className="font-medium">
                      {countFields(category, 'config')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Metadata:</span>
                    <span className="font-medium">
                      {countFields(category, 'metadata')}
                    </span>
                  </div>
                  <div className="pt-2 border-t">
                    <span className="text-xs text-gray-500">
                      Created: {formatDate(category.created_at)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            showInfo={true}
            totalItems={categoryResponse?.total || 0}
            itemsPerPage={pageSize}
          />
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
