import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin } from "lucide-react"

export default function Loading() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Offline Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Device Locations Across Africa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] w-full rounded-lg border bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Loading map of Africa...</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Device List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-32" />
            </div>
            <div className="space-y-2">
              {Array(5)
                .fill(0)
                .map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

