"use client"

import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import categoryService from '@/services/category.service';

const CategoryDetailsPage = () => {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const categoryName = decodeURIComponent(params?.categoryId as string);

  const {
    data: categoryData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['category', categoryName],
    queryFn: () => categoryService.getCategoryByName(categoryName),
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

  // Helper to get non-null field values
  const getFieldValues = (obj: any, prefix: string) => {
    if (!obj) return [];
    const values: string[] = [];
    // Iterate through keys that match the prefix followed by a number
    Object.keys(obj).forEach(key => {
      if (key.startsWith(prefix) && obj[key] && !isNaN(Number(key.replace(prefix, '')))) {
        values.push(obj[key]);
      }
    });
    return values;
  };

  const fields = getFieldValues(categoryData, 'field');
  const configs = getFieldValues(categoryData, 'config');
  const metadata = getFieldValues(categoryData, 'metadata');

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-64 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
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
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-800">{categoryData?.name || 'Category'}</h1>
            {categoryData?.level && (
              <Badge variant="secondary" className="capitalize">
                {categoryData.level}
              </Badge>
            )}
          </div>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Data Fields Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Data Fields</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {fields.length}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {fields.slice(0, 3).map((field, i) => (
                <Badge key={i} variant="outline">{field}</Badge>
              ))}
              {fields.length > 3 && (
                <Badge variant="outline">+{fields.length - 3} more</Badge>
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
              {configs.length}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {configs.slice(0, 3).map((config, i) => (
                <Badge key={i} variant="outline">{config}</Badge>
              ))}
              {configs.length > 3 && (
                <Badge variant="outline">+{configs.length - 3} more</Badge>
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
              {metadata.length}
            </div>
            <div className="flex flex-wrap gap-1 mt-2">
              {metadata.slice(0, 3).map((meta, i) => (
                <Badge key={i} variant="outline">{meta}</Badge>
              ))}
              {metadata.length > 3 && (
                <Badge variant="outline">+{metadata.length - 3} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

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
