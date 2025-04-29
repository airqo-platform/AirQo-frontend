import { useQuery } from "@tanstack/react-query"
import { devices, type ChartDataRequest } from "@/core/apis/devices"
import { useDevice } from "./useDevices"

export function useSensorData(deviceId: string, fieldId: string, days = 7, results = 100) {
  const { device } = useDevice(deviceId)

  return useQuery({
    queryKey: ["sensorData", deviceId, fieldId, days, results],
    queryFn: async () => {
      try {
        if (!device) {
          throw new Error("Device not found")
        }

        // Calculate date range
        const endDateTime = new Date().toISOString()
        const startDateTime = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

        // Determine device category based on device_number
        // BAM devices typically don't have device_number, while lowcost devices do
        const deviceCategory = device.device_number ? "lowcost" : "bam"

        // Prepare request for chart data
        const request: ChartDataRequest = {
          network: device.network || "airqo",
          device_category: deviceCategory,
          device_names: [device.name],
          startDateTime,
          endDateTime,
          frequency: "raw",
        }

        // Fetch chart data
        const response = await devices.getChartData(request)

        if (!response.success || !response.data[device.name]) {
          throw new Error("Failed to fetch sensor data")
        }

        // Process the data for the chart
        const chartData = response.data[device.name]

        // Extract values and labels
        const values: number[] = []
        const labels: string[] = []

        chartData.forEach((point) => {
          // Format timestamp for label
          const date = new Date(point.timestamp)
          labels.push(date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))

          // Get value based on fieldId
          let value: number | undefined

          switch (fieldId) {
            case "pm2_5":
              value = point.pm2_5
              break
            case "pm10":
              value = point.pm10
              break
            case "battery":
              value = point.battery
              break
            // Add other fields as needed
            default:
              value = point[fieldId]
          }

          values.push(value !== undefined ? value : 0)
        })

        // Limit to requested number of results
        const limitedValues = values.slice(-results)
        const limitedLabels = labels.slice(-results)

        return { values: limitedValues, labels: limitedLabels }
      } catch (error) {
        console.error("Error fetching sensor data:", error)
        throw error
      }
    },
    enabled: !!device, // Only run query when device is available
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
