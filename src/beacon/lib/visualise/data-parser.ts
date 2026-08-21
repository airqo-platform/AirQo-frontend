import * as XLSX from "xlsx"

export type ColumnType = "number" | "date" | "category" | "boolean"

export interface ColumnProfile {
  name: string
  type: ColumnType
  totalCount: number
  nullCount: number
  uniqueCount: number
  // Numeric stats
  min?: number
  max?: number
  mean?: number
  median?: number
  sum?: number
  // Date stats
  minDate?: string
  maxDate?: string
  // Categorical stats
  topValues?: Array<{ value: string; count: number }>
}

export interface ParsedDataset {
  name: string
  columns: string[]
  columnProfiles: Record<string, ColumnProfile>
  data: Record<string, any>[]
  rawRowCount: number
  totalFileRows?: number
  fileSizeBytes?: number
  isSampled?: boolean
  fileType: string
  fileSize?: number
}

export type AggregationType = "none" | "avg" | "sum" | "min" | "max" | "count" | "hourly" | "daily"

export type FilterOperator = "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains" | "not_null"

export interface FilterCondition {
  id: string
  column: string
  operator: FilterOperator
  value: any
}

export interface StreamProgress {
  percent: number
  bytesRead: number
  totalBytes: number
  rowsParsed: number
}

export interface StreamParseOptions {
  file?: File
  maxRows?: number
  maxSampleRows?: number
  sampleMode?: "uniform" | "first"
  onProgress?: (progress: StreamProgress) => void
}

export interface CorrelationStats {
  r: number
  r2: number
  slope: number
  intercept: number
  mae: number
  count: number
}

// Safely slice any File or Blob across different browser environments
function safeSlice(file: any, start: number, end: number): Blob {
  if (file && typeof file.slice === "function") {
    return file.slice(start, end)
  }
  if (file && typeof file.webkitSlice === "function") {
    return file.webkitSlice(start, end)
  }
  if (file && typeof file.mozSlice === "function") {
    return file.mozSlice(start, end)
  }
  if (typeof Blob !== "undefined" && typeof Blob.prototype.slice === "function") {
    return Blob.prototype.slice.call(file, start, end)
  }
  throw new Error("Target is not a sliceable File or Blob object.")
}

// Auto-detect CSV delimiter
export function detectDelimiter(sampleText: string): string {
  const commaCount = (sampleText.match(/,/g) || []).length
  const tabCount = (sampleText.match(/\t/g) || []).length
  const semicolonCount = (sampleText.match(/;/g) || []).length
  const pipeCount = (sampleText.match(/\|/g) || []).length

  if (tabCount > commaCount && tabCount > semicolonCount) return "\t"
  if (semicolonCount > commaCount && semicolonCount > tabCount) return ";"
  if (pipeCount > commaCount && pipeCount > semicolonCount) return "|"
  return ","
}

// Parse single line of CSV respecting quotes
export function parseCSVLine(line: string, delimiter: string = ","): string[] {
  const result: string[] = []
  let current = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim())
      current = ""
    } else {
      current += char
    }
  }
  result.push(current.trim())
  return result
}

// Parse whole text CSV into objects
export function parseCSVText(csvText: string): Record<string, any>[] {
  const trimmed = csvText.trim()
  if (!trimmed) return []

  const delimiter = detectDelimiter(trimmed.substring(0, 4096))
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ""
  let inQuotes = false

  for (let i = 0; i < trimmed.length; i++) {
    const char = trimmed[i]
    const nextChar = trimmed[i + 1]

    if (inQuotes) {
      if (char === '"') {
        if (nextChar === '"') {
          currentField += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        currentField += char
      }
    } else {
      if (char === '"') {
        inQuotes = true
      } else if (char === delimiter) {
        currentRow.push(currentField.trim())
        currentField = ""
      } else if (char === "\r") {
        if (nextChar === "\n") i++
        currentRow.push(currentField.trim())
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow)
        }
        currentRow = []
        currentField = ""
      } else if (char === "\n") {
        currentRow.push(currentField.trim())
        if (currentRow.some((c) => c.length > 0)) {
          rows.push(currentRow)
        }
        currentRow = []
        currentField = ""
      } else {
        currentField += char
      }
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim())
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow)
    }
  }

  if (rows.length === 0) return []

  const rawHeaders = rows[0]
  const headers = rawHeaders.map((h, idx) => (h && h.trim().length > 0 ? h.trim() : `Column_${idx + 1}`))

  const dataRows: Record<string, any>[] = []
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r]
    if (row.length === 0 || (row.length === 1 && row[0] === "")) continue
    const obj: Record<string, any> = {}
    for (let c = 0; c < headers.length; c++) {
      const header = headers[c]
      const rawVal = row[c] ?? ""
      obj[header] = rawVal === "" ? null : rawVal
    }
    dataRows.push(obj)
  }

  return dataRows
}

// Parse Excel files (.xlsx / .xls) with hardened parsing options
export async function parseExcelFile(file: File): Promise<Record<string, any>[]> {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, {
    type: "array",
    cellFormula: false,
    cellHTML: false,
    cellText: false,
    dense: true,
  })
  const firstSheetName = workbook.SheetNames[0]
  if (!firstSheetName) return []
  const worksheet = workbook.Sheets[firstSheetName]
  const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: null })
  return jsonData
}

// Parse JSON text
export function parseJSONText(jsonText: string): Record<string, any>[] {
  const parsed = JSON.parse(jsonText)
  if (Array.isArray(parsed)) {
    return parsed
  }
  if (typeof parsed === "object" && parsed !== null) {
    for (const key of Object.keys(parsed)) {
      if (Array.isArray(parsed[key])) {
        return parsed[key]
      }
    }
    return [parsed]
  }
  return []
}

// Streaming Chunk Parser for massive files (e.g. 500MB - 1GB+)
export async function parseCSVFileStream(
  fileOrOptions: File | (StreamParseOptions & { file?: File }),
  optionsOrUndefined?: StreamParseOptions
): Promise<{
  data: Record<string, any>[]
  totalFileRows: number
  totalEstimatedRows: number
  isSampled: boolean
  headers: string[]
}> {
  let file: File
  let opts: StreamParseOptions

  // Normalize polymorphic argument calling
  if (fileOrOptions && (typeof (fileOrOptions as any).slice === "function" || fileOrOptions instanceof Blob)) {
    file = fileOrOptions as File
    opts = optionsOrUndefined || {}
  } else if (fileOrOptions && (fileOrOptions as any).file) {
    file = (fileOrOptions as any).file
    opts = fileOrOptions as StreamParseOptions
  } else {
    throw new Error("A valid File or Blob object is required for CSV parsing.")
  }

  const maxRows = opts.maxSampleRows || opts.maxRows || 50000
  const sampleMode = opts.sampleMode || "uniform"
  const CHUNK_SIZE = 2 * 1024 * 1024 // 2MB per chunk
  const fileSize = file.size || 0
  const textDecoder = new TextDecoder("utf-8")

  // Estimate total rows from first chunk
  let estimatedTotalRows = 0
  let sampleStep = 1
  let delimiter = ","

  const firstSlice = safeSlice(file, 0, Math.min(fileSize, 256 * 1024))
  const firstBuffer = await firstSlice.arrayBuffer()
  const firstText = textDecoder.decode(firstBuffer)
  delimiter = detectDelimiter(firstText)

  const sampleLines = firstText.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0)
  if (sampleLines.length > 1) {
    const avgLineLen = Math.max(20, Math.round(firstBuffer.byteLength / sampleLines.length))
    estimatedTotalRows = Math.max(sampleLines.length, Math.round(fileSize / avgLineLen))
    if (sampleMode === "uniform" && estimatedTotalRows > maxRows) {
      sampleStep = Math.max(1, Math.floor(estimatedTotalRows / maxRows))
    }
  }

  let headers: string[] | null = null
  let leftover = ""
  let inQuotes = false
  let totalRowsSeen = 0
  const collectedRows: Record<string, any>[] = []

  let offset = 0
  while (offset < fileSize) {
    const nextOffset = Math.min(fileSize, offset + CHUNK_SIZE)
    const slice = safeSlice(file, offset, nextOffset)
    const buffer = await slice.arrayBuffer()
    const chunkText = leftover + textDecoder.decode(buffer, { stream: nextOffset < fileSize })
    leftover = ""

    // Line splitting with RFC 4180 quote state tracking
    let lineStart = 0
    for (let i = 0; i < chunkText.length; i++) {
      const char = chunkText[i]
      if (char === '"') {
        if (inQuotes && chunkText[i + 1] === '"') {
          i++ // skip escaped quote ("") inside quoted field
        } else {
          inQuotes = !inQuotes
        }
      } else if (!inQuotes && (char === "\n" || char === "\r")) {
        const line = chunkText.substring(lineStart, i).trim()
        if (char === "\r" && chunkText[i + 1] === "\n") {
          i++
        }
        lineStart = i + 1

        if (line.length > 0) {
          if (!headers) {
            headers = parseCSVLine(line, delimiter).map((h, idx) =>
              h && h.trim().length > 0 ? h.trim() : `Column_${idx + 1}`
            )
          } else {
            totalRowsSeen++
            const fields = parseCSVLine(line, delimiter)
            const rowObj: Record<string, any> = {}
            for (let c = 0; c < headers.length; c++) {
              const header = headers[c]
              const val = fields[c] ?? ""
              rowObj[header] = val === "" ? null : val
            }

            if (sampleMode === "uniform") {
              // Reservoir / adaptive sampling across full file
              if (collectedRows.length < maxRows) {
                collectedRows.push(rowObj)
              } else {
                const j = Math.floor(Math.random() * totalRowsSeen)
                if (j < maxRows) {
                  collectedRows[j] = rowObj
                }
              }
            } else {
              // Head mode
              if (collectedRows.length < maxRows) {
                collectedRows.push(rowObj)
              }
            }
          }
        }
      }
    }

    if (lineStart < chunkText.length) {
      leftover = chunkText.substring(lineStart)
    }

    offset = nextOffset

    if (opts.onProgress) {
      const percent = Math.min(100, Math.round((offset / fileSize) * 100))
      opts.onProgress({
        percent,
        bytesRead: offset,
        totalBytes: fileSize,
        rowsParsed: totalRowsSeen,
      })
    }

    // Small yielding to allow UI updates
    if (offset % (CHUNK_SIZE * 4) === 0) {
      await new Promise((res) => setTimeout(res, 0))
    }
  }

  // Handle final leftover line
  if (leftover.trim().length > 0 && headers) {
    totalRowsSeen++
    const fields = parseCSVLine(leftover.trim(), delimiter)
    const rowObj: Record<string, any> = {}
    for (let c = 0; c < headers.length; c++) {
      const header = headers[c]
      const val = fields[c] ?? ""
      rowObj[header] = val === "" ? null : val
    }

    if (collectedRows.length < maxRows) {
      collectedRows.push(rowObj)
    } else if (sampleMode === "uniform") {
      const j = Math.floor(Math.random() * totalRowsSeen)
      if (j < maxRows) {
        collectedRows[j] = rowObj
      }
    }
  }

  return {
    data: collectedRows,
    totalFileRows: totalRowsSeen,
    totalEstimatedRows: totalRowsSeen,
    isSampled: totalRowsSeen > collectedRows.length,
    headers: headers || [],
  }
}

// Infer column type
function inferColumnType(values: any[]): ColumnType {
  const nonNulls = values.filter((v) => v !== null && v !== undefined && v !== "")
  if (nonNulls.length === 0) return "category"

  let numericCount = 0
  let dateCount = 0
  let boolCount = 0

  for (const v of nonNulls.slice(0, 100)) {
    if (typeof v === "number") {
      numericCount++
      continue
    }
    if (typeof v === "boolean" || v === "true" || v === "false") {
      boolCount++
      continue
    }

    const str = String(v).trim()
    if (!isNaN(Number(str)) && str !== "") {
      numericCount++
      continue
    }

    // Check date pattern
    if (/^\d{4}[-/.]\d{1,2}[-/.]\d{1,2}/.test(str) || /^\d{1,2}[-/.]\d{1,2}[-/.]\d{4}/.test(str)) {
      const d = Date.parse(str)
      if (!isNaN(d)) {
        dateCount++
        continue
      }
    }
  }

  const sampleSize = Math.min(nonNulls.length, 100)
  if (numericCount / sampleSize > 0.8) return "number"
  if (dateCount / sampleSize > 0.8) return "date"
  if (boolCount / sampleSize > 0.8) return "boolean"
  return "category"
}

// Profile dataset to compute statistical properties
export function profileDataset(
  rawData: Record<string, any>[],
  name: string,
  fileType: string
): ParsedDataset {
  if (!rawData || rawData.length === 0) {
    return {
      name,
      columns: [],
      columnProfiles: {},
      data: [],
      rawRowCount: 0,
      fileType,
    }
  }

  // Get union of all keys across up to 5,000 sample rows
  const columnSet = new Set<string>()
  const sampleScan = rawData.slice(0, 5000)
  for (const row of sampleScan) {
    Object.keys(row).forEach((k) => columnSet.add(k))
  }
  const columns = Array.from(columnSet)

  // Unpack ExtraData if present (AirQo specific sensor format)
  const extraDataCol = columns.find((c) => /extradata|extra/i.test(c))
  let data = rawData

  if (extraDataCol) {
    data = rawData.map((row) => {
      const copy = { ...row }
      const extraStr = String(row[extraDataCol] || "")
      if (extraStr && extraStr.includes(",")) {
        const parts = extraStr.split(",")
        if (parts.length >= 10) {
          const tempVal = parseFloat(parts[8])
          const humVal = parseFloat(parts[9])
          if (!isNaN(tempVal) && !("Temperature (°C)" in copy)) {
            copy["Temperature (°C)"] = tempVal
          }
          if (!isNaN(humVal) && !("Humidity (%)" in copy)) {
            copy["Humidity (%)"] = humVal
          }
        }
      }
      return copy
    })
    if ("Temperature (°C)" in (data[0] || {}) && !columns.includes("Temperature (°C)")) {
      columns.push("Temperature (°C)")
    }
    if ("Humidity (%)" in (data[0] || {}) && !columns.includes("Humidity (%)")) {
      columns.push("Humidity (%)")
    }
  }

  // Typecast and clean values
  const columnProfiles: Record<string, ColumnProfile> = {}

  for (const col of columns) {
    const rawValues = data.map((r) => r[col])
    const colType = inferColumnType(rawValues)
    const totalCount = rawValues.length
    let nullCount = 0
    const uniqueValues = new Set<any>()

    const numericVals: number[] = []
    const dateVals: number[] = []
    const valCounts: Record<string, number> = {}

    for (let i = 0; i < data.length; i++) {
      let val = data[i][col]

      if (val === null || val === undefined || val === "") {
        nullCount++
        data[i][col] = null
        continue
      }

      if (colType === "number") {
        const num = typeof val === "number" ? val : Number(String(val).replace(/,/g, ""))
        if (isNaN(num)) {
          data[i][col] = null
          nullCount++
        } else {
          data[i][col] = num
          numericVals.push(num)
          uniqueValues.add(num)
        }
      } else if (colType === "date") {
        const timestamp = Date.parse(String(val))
        if (isNaN(timestamp)) {
          data[i][col] = String(val)
        } else {
          dateVals.push(timestamp)
          uniqueValues.add(val)
        }
      } else {
        const strVal = String(val).trim()
        data[i][col] = strVal
        uniqueValues.add(strVal)
        valCounts[strVal] = (valCounts[strVal] || 0) + 1
      }
    }

    const profile: ColumnProfile = {
      name: col,
      type: colType,
      totalCount,
      nullCount,
      uniqueCount: uniqueValues.size,
    }

    if (colType === "number" && numericVals.length > 0) {
      numericVals.sort((a, b) => a - b)
      profile.min = numericVals[0]
      profile.max = numericVals[numericVals.length - 1]
      profile.sum = Number(numericVals.reduce((a, b) => a + b, 0).toFixed(2))
      profile.mean = Number((profile.sum / numericVals.length).toFixed(2))
      const mid = Math.floor(numericVals.length / 2)
      profile.median = numericVals.length % 2 !== 0 ? numericVals[mid] : Number(((numericVals[mid - 1] + numericVals[mid]) / 2).toFixed(2))
    }

    if (colType === "date" && dateVals.length > 0) {
      dateVals.sort((a, b) => a - b)
      profile.minDate = new Date(dateVals[0]).toISOString()
      profile.maxDate = new Date(dateVals[dateVals.length - 1]).toISOString()
    }

    if (colType === "category") {
      profile.topValues = Object.entries(valCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([value, count]) => ({ value, count }))
    }

    columnProfiles[col] = profile
  }

  // Detect and create derived sensor columns
  const s1pm25Col = columns.find((c) => /sensor1.*pm2\.?5|s1.*pm2\.?5/i.test(c))
  const s2pm25Col = columns.find((c) => /sensor2.*pm2\.?5|s2.*pm2\.?5/i.test(c))

  if (s1pm25Col && s2pm25Col && !columns.includes("Sensor PM2.5 Error Margin")) {
    const derivedError = "Sensor PM2.5 Error Margin"
    const derivedAvg = "Sensor Average PM2.5"
    columns.push(derivedError, derivedAvg)

    data = data.map((r) => {
      const s1 = r[s1pm25Col]
      const s2 = r[s2pm25Col]
      const diff = typeof s1 === "number" && typeof s2 === "number" ? Number(Math.abs(s1 - s2).toFixed(2)) : null
      const avg = typeof s1 === "number" && typeof s2 === "number" ? Number(((s1 + s2) / 2).toFixed(2)) : s1 ?? s2

      return {
        ...r,
        [derivedError]: diff,
        [derivedAvg]: avg,
      }
    })

    const errorVals = new Set(data.map((r) => r[derivedError]).filter((v) => v !== null))
    const avgVals = new Set(data.map((r) => r[derivedAvg]).filter((v) => v !== null))

    columnProfiles[derivedError] = {
      name: derivedError,
      type: "number",
      totalCount: data.length,
      nullCount: data.filter((r) => r[derivedError] === null).length,
      uniqueCount: errorVals.size,
    }

    columnProfiles[derivedAvg] = {
      name: derivedAvg,
      type: "number",
      totalCount: data.length,
      nullCount: data.filter((r) => r[derivedAvg] === null).length,
      uniqueCount: avgVals.size,
    }
  }

  return {
    name,
    columns,
    columnProfiles,
    data,
    rawRowCount: data.length,
    fileType,
  }
}

// Calculate Pearson Correlation, R2, Slope, Intercept, and MAE for scatter plots
export function calculateCorrelationStats(
  points: Array<{ x: number; y: number }>
): {
  r: number
  r2: number
  slope: number
  intercept: number
  mae: number
  count: number
} | null {
  const valid = points.filter(
    (p) =>
      typeof p.x === "number" &&
      typeof p.y === "number" &&
      !isNaN(p.x) &&
      !isNaN(p.y)
  )

  const n = valid.length
  if (n < 2) return null

  let sumX = 0
  let sumY = 0
  let sumXY = 0
  let sumX2 = 0
  let sumY2 = 0

  for (const p of valid) {
    sumX += p.x
    sumY += p.y
    sumXY += p.x * p.y
    sumX2 += p.x * p.x
    sumY2 += p.y * p.y
  }

  const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))
  if (denominator === 0) return null

  const r = (n * sumXY - sumX * sumY) / denominator
  const r2 = r * r

  const xVariance = n * sumX2 - sumX * sumX
  const slope = xVariance !== 0 ? (n * sumXY - sumX * sumY) / xVariance : 0
  const intercept = (sumY - slope * sumX) / n

  // Calculate Mean Absolute Error (MAE) between Sensor 1 and Sensor 2
  const mae = valid.reduce((acc, p) => acc + Math.abs(p.x - p.y), 0) / n

  return {
    r: Number(r.toFixed(4)),
    r2: Number(r2.toFixed(4)),
    slope: Number(slope.toFixed(4)),
    intercept: Number(intercept.toFixed(4)),
    mae: Number(mae.toFixed(2)),
    count: n,
  }
}

export function calculateCorrelation(
  data: Record<string, any>[],
  xCol: string,
  yCol: string
) {
  const points = data.map((r) => ({ x: r[xCol], y: r[yCol] }))
  return calculateCorrelationStats(points)
}

// Apply user filters
export function applyFilters(
  data: Record<string, any>[],
  filters: FilterCondition[]
): Record<string, any>[] {
  if (!filters || filters.length === 0) return data

  return data.filter((row) => {
    for (const f of filters) {
      const val = row[f.column]

      switch (f.operator) {
        case "eq":
          if (String(val).toLowerCase() !== String(f.value).toLowerCase()) return false
          break
        case "neq":
          if (String(val).toLowerCase() === String(f.value).toLowerCase()) return false
          break
        case "gt": {
          const numVal = typeof val === "number" ? val : Number(val)
          const filterNum = Number(f.value)
          if (!isNaN(numVal) && !isNaN(filterNum)) {
            if (numVal <= filterNum) return false
          } else {
            if (String(val) <= String(f.value)) return false
          }
          break
        }
        case "gte": {
          const numVal = typeof val === "number" ? val : Number(val)
          const filterNum = Number(f.value)
          if (!isNaN(numVal) && !isNaN(filterNum)) {
            if (numVal < filterNum) return false
          } else {
            if (String(val) < String(f.value)) return false
          }
          break
        }
        case "lt": {
          const numVal = typeof val === "number" ? val : Number(val)
          const filterNum = Number(f.value)
          if (!isNaN(numVal) && !isNaN(filterNum)) {
            if (numVal >= filterNum) return false
          } else {
            if (String(val) >= String(f.value)) return false
          }
          break
        }
        case "lte": {
          const numVal = typeof val === "number" ? val : Number(val)
          const filterNum = Number(f.value)
          if (!isNaN(numVal) && !isNaN(filterNum)) {
            if (numVal > filterNum) return false
          } else {
            if (String(val) > String(f.value)) return false
          }
          break
        }
        case "contains":
          if (!String(val).toLowerCase().includes(String(f.value).toLowerCase())) return false
          break
        case "not_null":
          if (val === null || val === undefined || val === "") return false
          break
      }
    }
    return true
  })
}

// Aggregate data by dimension / time bucket
export function aggregateDataset({
  data,
  xColumn,
  yColumns,
  aggregation,
}: {
  data: Record<string, any>[]
  xColumn: string
  yColumns: string[]
  aggregation: AggregationType
}): Record<string, any>[] {
  if (!xColumn || yColumns.length === 0) return []

  if (aggregation === "none") {
    // If raw data is too big for smooth charting (> 3000 points), downsample evenly
    if (data.length > 3000) {
      const step = Math.ceil(data.length / 3000)
      const sampled = []
      for (let i = 0; i < data.length; i += step) {
        sampled.push(data[i])
      }
      return sampled
    }
    return data
  }

  // Handle Hourly or Daily time bucket aggregation
  if (aggregation === "hourly" || aggregation === "daily") {
    const timeMap = new Map<string, { x: string; counts: Record<string, number>; sums: Record<string, number> }>()

    for (const row of data) {
      const rawX = row[xColumn]
      if (!rawX) continue

      let bucketKey = String(rawX)
      const parsedDate = new Date(rawX)
      if (!isNaN(parsedDate.getTime())) {
        const y = parsedDate.getUTCFullYear()
        const m = String(parsedDate.getUTCMonth() + 1).padStart(2, "0")
        const d = String(parsedDate.getUTCDate()).padStart(2, "0")
        if (aggregation === "daily") {
          bucketKey = `${y}-${m}-${d}`
        } else {
          bucketKey = `${y}-${m}-${d} ${String(parsedDate.getUTCHours()).padStart(2, "0")}:00`
        }
      }

      if (!timeMap.has(bucketKey)) {
        timeMap.set(bucketKey, { x: bucketKey, counts: {}, sums: {} })
      }
      const entry = timeMap.get(bucketKey)!

      for (const yCol of yColumns) {
        const val = row[yCol]
        if (typeof val === "number" && !isNaN(val)) {
          entry.sums[yCol] = (entry.sums[yCol] || 0) + val
          entry.counts[yCol] = (entry.counts[yCol] || 0) + 1
        }
      }
    }

    return Array.from(timeMap.values()).map((entry) => {
      const res: Record<string, any> = { [xColumn]: entry.x }
      for (const yCol of yColumns) {
        const count = entry.counts[yCol] || 0
        const sum = entry.sums[yCol] || 0
        res[yCol] = count > 0 ? Number((sum / count).toFixed(2)) : null
      }
      return res
    })
  }

  // Group by category/dimension aggregation (avg, sum, min, max, count)
  const map = new Map<string, { count: number; sums: Record<string, number>; mins: Record<string, number>; maxs: Record<string, number>; vals: Record<string, number[]> }>()

  for (const row of data) {
    const xVal = String(row[xColumn] ?? "Unknown")
    if (!map.has(xVal)) {
      map.set(xVal, { count: 0, sums: {}, mins: {}, maxs: {}, vals: {} })
    }
    const entry = map.get(xVal)!
    entry.count++

    for (const yCol of yColumns) {
      const val = row[yCol]
      if (typeof val === "number" && !isNaN(val)) {
        entry.sums[yCol] = (entry.sums[yCol] || 0) + val
        entry.mins[yCol] = yCol in entry.mins ? Math.min(entry.mins[yCol], val) : val
        entry.maxs[yCol] = yCol in entry.maxs ? Math.max(entry.maxs[yCol], val) : val
        if (!entry.vals[yCol]) entry.vals[yCol] = []
        entry.vals[yCol].push(val)
      }
    }
  }

  return Array.from(map.entries()).map(([xVal, stats]) => {
    const out: Record<string, any> = { [xColumn]: xVal }

    for (const yCol of yColumns) {
      const count = stats.vals[yCol]?.length || 0
      if (count === 0) {
        out[yCol] = null
        continue
      }

      switch (aggregation) {
        case "avg":
          out[yCol] = Number((stats.sums[yCol] / count).toFixed(2))
          break
        case "sum":
          out[yCol] = Number(stats.sums[yCol].toFixed(2))
          break
        case "min":
          out[yCol] = stats.mins[yCol]
          break
        case "max":
          out[yCol] = stats.maxs[yCol]
          break
        case "count":
          out[yCol] = count
          break
        default:
          out[yCol] = Number((stats.sums[yCol] / count).toFixed(2))
      }
    }

    return out
  })
}

// Generate histogram bins for single numeric metric with linear stack-safe min/max
export function generateHistogramData(
  data: Record<string, any>[],
  column: string,
  binCount: number = 10
): Array<{ bin: string; count: number; min: number; max: number }> {
  const numericValues = data
    .map((r) => r[column])
    .filter((v): v is number => typeof v === "number" && !isNaN(v))

  if (numericValues.length === 0) return []

  let min = numericValues[0]
  let max = numericValues[0]
  for (let i = 1; i < numericValues.length; i++) {
    const v = numericValues[i]
    if (v < min) min = v
    if (v > max) max = v
  }

  if (min === max) {
    return [{ bin: `${min}`, count: numericValues.length, min, max }]
  }

  const binWidth = (max - min) / binCount
  const bins: Array<{ bin: string; count: number; min: number; max: number }> = []

  for (let i = 0; i < binCount; i++) {
    const bMin = min + i * binWidth
    const bMax = i === binCount - 1 ? max : min + (i + 1) * binWidth
    bins.push({
      bin: `${bMin.toFixed(1)} - ${bMax.toFixed(1)}`,
      count: 0,
      min: bMin,
      max: bMax,
    })
  }

  for (const val of numericValues) {
    for (let i = 0; i < bins.length; i++) {
      if (val >= bins[i].min && (val < bins[i].max || (i === bins.length - 1 && val <= bins[i].max))) {
        bins[i].count++
        break
      }
    }
  }

  return bins
}
