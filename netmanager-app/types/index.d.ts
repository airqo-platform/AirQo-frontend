declare type ExportType = 'sites' | 'devices' | 'airqlouds' | 'regions'

declare type FormData = {
    startDate: string
    endDate: string
    frequency: string
    fileType: string
    outputFormat: string
    site?: string
    device?: string
    airqloud?: string
    region?: string
}