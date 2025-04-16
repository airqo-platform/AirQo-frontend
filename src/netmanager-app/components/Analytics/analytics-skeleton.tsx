import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export const AnalyticsSkeleton: React.FC = () => {
  return (
    <Card className="p-4">
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 mb-6">
          <div className="col-span-1 sm:col-span-2 lg:col-span-6 mb-4 sm:mb-0">
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="col-span-1 sm:col-span-2 lg:col-span-6 flex flex-col sm:flex-row justify-start sm:justify-end items-stretch sm:items-center gap-4">
            <Skeleton className="h-10 w-32 sm:w-36" />
            <Skeleton className="h-10 w-36 sm:w-40" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>

        {/* Dashboard content skeleton */}
        <div className="space-y-4">
          {/* Chart skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-64 w-full rounded-md" />
            <Skeleton className="h-64 w-full rounded-md" />
          </div>

          {/* Table skeleton */}
          <Skeleton className="h-80 w-full rounded-md" />

          {/* Additional metrics skeletons */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-32 w-full rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

