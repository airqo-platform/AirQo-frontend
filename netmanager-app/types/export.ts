import { Option } from "@/components/ui/multi-select"

export type ExportType = 'sites' | 'devices' | 'airqlouds' | 'regions'

export interface FormData {
  startDateTime: string;
  endDateTime: string;
  sites?: Option[];
  devices?: Option[];
  cities?: Option[];
  regions?: Option[];
  pollutants?: Option[];
  frequency: string
  fileType: string
  outputFormat: string
  dataType: string
}
