export interface ColumnMapping {
  timestampCol?: string
  deviceCol?: string
  s1Pm25Col?: string
  s2Pm25Col?: string
  s1Pm10Col?: string
  s2Pm10Col?: string
  tempCols: string[]
  humidityCols: string[]
  batteryCol?: string
  latitudeCol?: string
  longitudeCol?: string
  gpsCol?: string
  extraDataCol?: string
}

// Auto-detect column mappings using intelligent fuzzy matching
export function autoDetectColumnMapping(
  columns: string[],
  sampleRows: Record<string, any>[] = []
): ColumnMapping {
  const mapping: ColumnMapping = {
    tempCols: [],
    humidityCols: [],
  }

  // 1. Timestamp / Date
  mapping.timestampCol = columns.find((c) =>
    /^(created_at|timestamp|datetime|date_time|date|time)$/i.test(c.trim())
  ) || columns.find((c) => /created|time|date/i.test(c))

  // 2. Device Name / ID
  mapping.deviceCol = columns.find((c) =>
    /^(device_name|device_id|devicename|deviceid|device|node_id|channel_id)$/i.test(c.trim())
  ) || columns.find((c) => /device/i.test(c))

  // 3. Sensor 1 PM2.5
  mapping.s1Pm25Col = columns.find((c) =>
    /sensor1.*pm2\.?5|s1.*pm2\.?5|pm2_5_sensor1|pm2_5_s1|pm2\.5_1|pm2_5_1/i.test(c)
  ) || columns.find((c) => /^pm2_?5$/i.test(c))

  // 4. Sensor 2 PM2.5
  mapping.s2Pm25Col = columns.find((c) =>
    /sensor2.*pm2\.?5|s2.*pm2\.?5|pm2_5_sensor2|pm2_5_s2|pm2\.5_2|pm2_5_2/i.test(c)
  )

  // 5. Sensor 1 PM10
  mapping.s1Pm10Col = columns.find((c) =>
    /sensor1.*pm10|s1.*pm10|pm10_sensor1|pm10_s1|pm10_1/i.test(c)
  ) || columns.find((c) => /^pm10$/i.test(c))

  // 6. Sensor 2 PM10
  mapping.s2Pm10Col = columns.find((c) =>
    /sensor2.*pm10|s2.*pm10|pm10_sensor2|pm10_s2|pm10_2/i.test(c)
  )

  // 7. Temperature (allow multiple)
  const tempCandidates = columns.filter((c) =>
    /temp|temperature|deg_?c|celsius/i.test(c) && !/humidity|battery|error/i.test(c)
  )
  if (tempCandidates.length > 0) {
    mapping.tempCols = tempCandidates
  }

  // 8. Humidity (allow multiple)
  const humidityCandidates = columns.filter((c) =>
    /humid|humidity|rh|rel_?humidity/i.test(c) && !/temp|battery|error/i.test(c)
  )
  if (humidityCandidates.length > 0) {
    mapping.humidityCols = humidityCandidates
  }

  // 9. Battery Voltage
  mapping.batteryCol = columns.find((c) =>
    /battery|batt_?volt|voltage|vbatt/i.test(c)
  )

  // 10. Latitude & Longitude
  mapping.latitudeCol = columns.find((c) =>
    /^(latitude|lat|gps_lat|y)$/i.test(c.trim())
  ) || columns.find((c) => /latitude|lat/i.test(c))

  mapping.longitudeCol = columns.find((c) =>
    /^(longitude|long|lng|lon|gps_lng|gps_lon|x)$/i.test(c.trim())
  ) || columns.find((c) => /longitude|long|lng/i.test(c))

  // 11. GPS / ExtraData
  mapping.gpsCol = columns.find((c) => /gps/i.test(c))
  mapping.extraDataCol = columns.find((c) => /extradata|extra/i.test(c))

  // Auto-unpack ExtraData if Temperature or Humidity not found directly
  if (mapping.tempCols.length === 0 && columns.includes("Temperature (°C)")) {
    mapping.tempCols = ["Temperature (°C)"]
  }
  if (mapping.humidityCols.length === 0 && columns.includes("Humidity (%)")) {
    mapping.humidityCols = ["Humidity (%)"]
  }

  return mapping
}

export interface StandardizedRecord {
  raw: Record<string, any>
  timestamp?: Date
  timestampStr?: string
  deviceName: string
  s1Pm25: number | null
  s2Pm25: number | null
  pm25: number | null
  s1Pm10: number | null
  s2Pm10: number | null
  pm10: number | null
  errorMarginPm25: number | null
  temperatures: Record<string, number>
  primaryTemp: number | null
  humidities: Record<string, number>
  primaryHumidity: number | null
  battery: number | null
  latitude: number | null
  longitude: number | null
  aqiCategory: string
}

// Convert AQI PM2.5 to standard AQI Category
export function getAQICategory(pm25: number | null): { category: string; color: string; label: string } {
  if (pm25 === null || isNaN(pm25)) {
    return { category: "Unknown", color: "#94a3b8", label: "No Data" }
  }
  if (pm25 <= 12.0) {
    return { category: "Good", color: "#45ae03", label: "Good (0-12)" }
  }
  if (pm25 <= 35.4) {
    return { category: "Moderate", color: "#e5cc16", label: "Moderate (12.1-35.4)" }
  }
  if (pm25 <= 55.4) {
    return { category: "Sensitive", color: "#ff9800", label: "Unhealthy for Sensitive (35.5-55.4)" }
  }
  if (pm25 <= 150.4) {
    return { category: "Unhealthy", color: "#d32f2f", label: "Unhealthy (55.5-150.4)" }
  }
  if (pm25 <= 250.4) {
    return { category: "Very Unhealthy", color: "#8e24aa", label: "Very Unhealthy (150.5-250.4)" }
  }
  return { category: "Hazardous", color: "#5d4037", label: "Hazardous (250.5+)" }
}

// Standardize data rows according to column mapping
export function standardizeData(
  data: Record<string, any>[],
  mapping: ColumnMapping
): StandardizedRecord[] {
  return data.map((row) => {
    // Timestamp
    let timestamp: Date | undefined = undefined
    let timestampStr: string | undefined = undefined
    if (mapping.timestampCol && row[mapping.timestampCol]) {
      const parsed = new Date(row[mapping.timestampCol])
      if (!isNaN(parsed.getTime())) {
        timestamp = parsed
        timestampStr = parsed.toISOString()
      } else {
        timestampStr = String(row[mapping.timestampCol])
      }
    }

    // Device
    const deviceName = mapping.deviceCol && row[mapping.deviceCol]
      ? String(row[mapping.deviceCol])
      : "Default Device"

    // PM2.5
    const s1Pm25 = mapping.s1Pm25Col && typeof row[mapping.s1Pm25Col] === "number"
      ? row[mapping.s1Pm25Col]
      : null
    const s2Pm25 = mapping.s2Pm25Col && typeof row[mapping.s2Pm25Col] === "number"
      ? row[mapping.s2Pm25Col]
      : null
    const pm25 = s1Pm25 !== null && s2Pm25 !== null
      ? Number(((s1Pm25 + s2Pm25) / 2).toFixed(2))
      : s1Pm25 ?? s2Pm25

    const errorMarginPm25 = s1Pm25 !== null && s2Pm25 !== null
      ? Number(Math.abs(s1Pm25 - s2Pm25).toFixed(2))
      : null

    // PM10
    const s1Pm10 = mapping.s1Pm10Col && typeof row[mapping.s1Pm10Col] === "number"
      ? row[mapping.s1Pm10Col]
      : null
    const s2Pm10 = mapping.s2Pm10Col && typeof row[mapping.s2Pm10Col] === "number"
      ? row[mapping.s2Pm10Col]
      : null
    const pm10 = s1Pm10 !== null && s2Pm10 !== null
      ? Number(((s1Pm10 + s2Pm10) / 2).toFixed(2))
      : s1Pm10 ?? s2Pm10

    // Temperatures
    const temperatures: Record<string, number> = {}
    let primaryTemp: number | null = null
    mapping.tempCols.forEach((col) => {
      const v = row[col]
      if (typeof v === "number") {
        temperatures[col] = v
        if (primaryTemp === null) primaryTemp = v
      }
    })

    // Humidities
    const humidities: Record<string, number> = {}
    let primaryHumidity: number | null = null
    mapping.humidityCols.forEach((col) => {
      const v = row[col]
      if (typeof v === "number") {
        humidities[col] = v
        if (primaryHumidity === null) primaryHumidity = v
      }
    })

    // Battery
    const battery = mapping.batteryCol && typeof row[mapping.batteryCol] === "number"
      ? row[mapping.batteryCol]
      : null

    // Lat / Long
    const lat = mapping.latitudeCol && typeof row[mapping.latitudeCol] === "number"
      ? row[mapping.latitudeCol]
      : null
    const lng = mapping.longitudeCol && typeof row[mapping.longitudeCol] === "number"
      ? row[mapping.longitudeCol]
      : null

    // Clean valid coords (ignore (0,0) or invalid ranges)
    const validLat = lat !== null && lat >= -90 && lat <= 90 && Math.abs(lat) > 0.0001 ? lat : null
    const validLng = lng !== null && lng >= -180 && lng <= 180 && Math.abs(lng) > 0.0001 ? lng : null

    const aqi = getAQICategory(pm25)

    return {
      raw: row,
      timestamp,
      timestampStr,
      deviceName,
      s1Pm25,
      s2Pm25,
      pm25,
      s1Pm10,
      s2Pm10,
      pm10,
      errorMarginPm25,
      temperatures,
      primaryTemp,
      humidities,
      primaryHumidity,
      battery,
      latitude: validLat,
      longitude: validLng,
      aqiCategory: aqi.category,
    }
  })
}
