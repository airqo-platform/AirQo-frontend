import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

// Mock data for chart configurations
const mockChartConfigs = [
  {
    _id: "chart-1",
    deviceId: "device-1",
    fieldId: 1,
    title: "PM2.5 Levels",
    xAxisLabel: "Time",
    yAxisLabel: "PM2.5 (μg/m³)",
    color: "#d62020",
    backgroundColor: "#ffffff",
    chartType: "Line",
    days: 7,
    results: 100,
    showLegend: true,
    showGrid: true,
    referenceLines: [
      {
        value: 35,
        label: "WHO Guideline",
        color: "#FF0000",
        style: "dashed",
      },
    ],
  },
  {
    _id: "chart-2",
    deviceId: "device-1",
    fieldId: 2,
    title: "Temperature",
    xAxisLabel: "Time",
    yAxisLabel: "Temperature (°C)",
    color: "#2080d6",
    backgroundColor: "#ffffff",
    chartType: "Line",
    days: 7,
    results: 100,
    showLegend: true,
    showGrid: true,
  },
]

// This would be replaced with actual API calls in a real implementation
const chartConfigsApi = {
  getChartConfigs: async (deviceId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockChartConfigs.filter((config) => config.deviceId === deviceId)
  },

  getChartConfig: async (deviceId: string, chartId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockChartConfigs.find((config) => config.deviceId === deviceId && config._id === chartId)
  },

  createChartConfig: async (deviceId: string, chartConfig: any) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const newConfig = {
      _id: `chart-${Date.now()}`,
      deviceId,
      ...chartConfig,
    }
    mockChartConfigs.push(newConfig)
    return newConfig
  },

  updateChartConfig: async (deviceId: string, chartId: string, chartConfig: any) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const index = mockChartConfigs.findIndex((config) => config.deviceId === deviceId && config._id === chartId)
    if (index === -1) {
      throw new Error("Chart configuration not found")
    }
    mockChartConfigs[index] = {
      ...mockChartConfigs[index],
      ...chartConfig,
    }
    return mockChartConfigs[index]
  },

  deleteChartConfig: async (deviceId: string, chartId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const index = mockChartConfigs.findIndex((config) => config.deviceId === deviceId && config._id === chartId)
    if (index === -1) {
      throw new Error("Chart configuration not found")
    }
    mockChartConfigs.splice(index, 1)
    return true
  },

  copyChartConfig: async (deviceId: string, chartId: string) => {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const chartToCopy = mockChartConfigs.find((config) => config.deviceId === deviceId && config._id === chartId)
    if (!chartToCopy) {
      throw new Error("Chart configuration not found")
    }
    const newChart = {
      ...chartToCopy,
      _id: `chart-${Date.now()}`,
      title: `${chartToCopy.title} (Copy)`,
    }
    mockChartConfigs.push(newChart)
    return newChart
  },
}

export function useChartConfigs(deviceId: string) {
  const queryClient = useQueryClient()

  const {
    data: chartConfigs = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chartConfigs", deviceId],
    queryFn: () => chartConfigsApi.getChartConfigs(deviceId),
  })

  const deleteChartConfig = useMutation({
    mutationFn: (chartId: string) => chartConfigsApi.deleteChartConfig(deviceId, chartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chartConfigs", deviceId] })
    },
  })

  const copyChartConfig = useMutation({
    mutationFn: (chartId: string) => chartConfigsApi.copyChartConfig(deviceId, chartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chartConfigs", deviceId] })
    },
  })

  return {
    chartConfigs,
    isLoading,
    error,
    deleteChartConfig: (chartId: string) => deleteChartConfig.mutateAsync(chartId),
    copyChartConfig: (chartId: string) => copyChartConfig.mutateAsync(chartId),
  }
}

export function useChartConfig(deviceId: string, chartId: string) {
  const {
    data: chartConfig,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["chartConfig", deviceId, chartId],
    queryFn: () => chartConfigsApi.getChartConfig(deviceId, chartId),
    enabled: !!deviceId && !!chartId,
  })

  return {
    chartConfig,
    isLoading,
    error,
  }
}

export function useCreateChartConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ deviceId, chartConfig }: { deviceId: string; chartConfig: any }) =>
      chartConfigsApi.createChartConfig(deviceId, chartConfig),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chartConfigs", variables.deviceId] })
    },
  })
}

export function useUpdateChartConfig() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ deviceId, chartId, chartConfig }: { deviceId: string; chartId: string; chartConfig: any }) =>
      chartConfigsApi.updateChartConfig(deviceId, chartId, chartConfig),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["chartConfigs", variables.deviceId] })
      queryClient.invalidateQueries({ queryKey: ["chartConfig", variables.deviceId, variables.chartId] })
    },
  })
}
