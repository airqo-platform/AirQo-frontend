"use client"
import { useRouter } from "next/navigation"
import { Edit, Expand, MoreHorizontal, Trash2, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { SensorChart } from "@/components/charts/sensor-chart"
import { toast } from "sonner"
import { useChartConfigs } from "@/core/hooks/useChartConfigs"

interface ChartGridProps {
  deviceId: string
}

export function ChartGrid({ deviceId }: ChartGridProps) {
  const router = useRouter()
  const { chartConfigs, isLoading, error, deleteChartConfig, copyChartConfig } = useChartConfigs(deviceId)

  const handleDeleteChart = async (chartId: string) => {
    try {
      await deleteChartConfig(chartId)
      toast("Chart deleted successfully")
    } catch (error) {
      toast("Failed to delete chart", {
        description: (error as Error).message,
      })
    }
  }

  const handleCopyChart = async (chartId: string) => {
    try {
      await copyChartConfig(chartId)
      toast("Chart copied successfully")
    } catch (error) {
      toast("Failed to copy chart", {
        description: (error as Error).message,
      })
    }
  }

  const handleExpandChart = (chartId: string) => {
    router.push(`/devices/${deviceId}/charts/${chartId}`)
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2 animate-pulse">
              <div className="h-6 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent className="pb-2">
              <div className="h-[200px] w-full bg-muted rounded animate-pulse"></div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2">
              <div className="h-9 bg-muted rounded w-24 animate-pulse"></div>
              <div className="h-9 bg-muted rounded w-24 animate-pulse"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
        Error loading charts: {error.message}
      </div>
    )
  }

  if (chartConfigs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <div className="mb-4 text-muted-foreground">No charts found for this device</div>
        <Button onClick={() => router.push(`/devices/${deviceId}/charts/new`)}>Create Your First Chart</Button>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {chartConfigs.map((config) => (
        <Card key={config._id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-lg">
              {config.title}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Chart Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => router.push(`/devices/${deviceId}/charts/${config._id}/edit`)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Chart
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExpandChart(config._id)}>
                    <Expand className="mr-2 h-4 w-4" />
                    Expand Chart
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCopyChart(config._id)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Chart
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteChart(config._id)}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Chart
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="h-[200px] w-full">
              <SensorChart config={config} deviceId={deviceId} />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/devices/${deviceId}/charts/${config._id}/edit`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Customize
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExpandChart(config._id)}>
              <Expand className="mr-2 h-4 w-4" />
              Expand
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
