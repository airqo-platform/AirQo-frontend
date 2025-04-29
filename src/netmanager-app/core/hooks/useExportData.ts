import { useMutation } from "@tanstack/react-query"
import { devices, type ChartDataRequest } from "@/core/apis/devices"

interface ExportDataParams {
  deviceId: string
  fieldId?: string
  days: number
  timezone?: string
  format?: "csv" | "json"
  startDate?: string
  endDate?: string
}

export function useExportData() {
  return useMutation({
    mutationFn: async (params: ExportDataParams) => {
      try {
        // Get device details using the useDevice hook
        const device = await devices.getDevice(params.deviceId)

        if (!device) {
          throw new Error("Device not found")
        }

        // Calculate date range
        const endDateTime = params.endDate ? new Date(params.endDate).toISOString() : new Date().toISOString()

        const startDateTime = params.startDate
          ? new Date(params.startDate).toISOString()
          : new Date(Date.now() - params.days * 24 * 60 * 60 * 1000).toISOString()

        // Determine device category based on device_number
        const deviceCategory = device.device_number ? "lowcost" : "bam"

        // Prepare request for data export
        const request: ChartDataRequest = {
          network: device.network || "airqo",
          device_category: deviceCategory,
          device_names: [device.name],
          startDateTime,
          endDateTime,
          frequency: "raw",
        }

        // Fetch data as blob
        const blob = await devices.exportData(request)

        // Create a download link
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${device.name}_data_export.csv`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)

        return { success: true, fileName: `${device.name}_data_export.csv` }
      } catch (error) {
        console.error("Error exporting data:", error)
        throw error
      }
    },
  })
}
