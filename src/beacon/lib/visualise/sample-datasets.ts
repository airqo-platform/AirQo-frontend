import { getAQICategory } from "./column-mapper"

export interface SampleDatasetInfo {
  id: string
  title: string
  description: string
  category: string
  rowCount: number
  csvContent: string
}

// 1. Hourly Air Quality Time Series (Kampala & Environs)
const generateAirQualityTimeseries = (): string => {
  const rows = [
    "timestamp,device_name,site_name,pm2_5,pm10,temperature,humidity,battery_voltage,aqi_category",
  ]
  const sites = [
    { device: "aq_gaba_01", site: "Ggaba Pier" },
    { device: "aq_makerere_02", site: "Makerere University" },
    { device: "aq_nakawa_03", site: "Nakawa Market" },
    { device: "aq_kololo_04", site: "Kololo Airstrip" },
    { device: "aq_jinja_05", site: "Jinja Main Street" },
  ]

  const now = new Date()
  const baseTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 3, 0, 0, 0)

  for (let hour = 0; hour < 72; hour++) {
    const curDate = new Date(baseTime.getTime() + hour * 3600 * 1000)
    const timeStr = curDate.toISOString().replace("T", " ").substring(0, 19)
    const diurnalFactor = Math.sin(((hour % 24) - 6) * (Math.PI / 12)) // Peak around 18:00 (6 PM) and 8:00 AM

    for (const s of sites) {
      const siteVariance = s.device === "aq_nakawa_03" ? 18 : s.device === "aq_kololo_04" ? -8 : 0
      const basePM25 = 28 + siteVariance + diurnalFactor * 14 + (Math.random() * 8 - 4)
      const pm2_5 = Math.max(4.5, Number(basePM25.toFixed(1)))
      const pm10 = Math.max(pm2_5 + 3, Number((pm2_5 * 1.6 + (Math.random() * 6 - 3)).toFixed(1)))
      const temp = Number((22 + Math.sin(((hour % 24) - 8) * (Math.PI / 12)) * 6 + (Math.random() * 1 - 0.5)).toFixed(1))
      const humidity = Number((82 - (temp - 20) * 4 + (Math.random() * 4 - 2)).toFixed(1))
      const battery = Number((4.12 - (hour % 24 > 18 || hour % 24 < 6 ? 0.35 : 0) + (Math.random() * 0.05)).toFixed(2))

      const aqiCategory = getAQICategory(pm2_5).category

      rows.push(
        `${timeStr},${s.device},${s.site},${pm2_5},${pm10},${temp},${humidity},${battery},${aqiCategory}`
      )
    }
  }

  return rows.join("\n")
}

// 2. Collocation Dual Sensor Comparison Data
const generateCollocationData = (): string => {
  const rows = [
    "timestamp,device_id,s1_pm2_5,s2_pm2_5,sensor_error_margin,temperature,relative_humidity,is_valid",
  ]

  const now = new Date()
  const baseTime = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 2, 0, 0, 0)

  for (let i = 0; i < 96; i++) {
    const curDate = new Date(baseTime.getTime() + i * 30 * 60 * 1000) // 30 min intervals
    const timeStr = curDate.toISOString().replace("T", " ").substring(0, 19)

    const trueValue = 35 + Math.sin(i / 8) * 16 + Math.cos(i / 3) * 5
    const s1 = Math.max(2, Number((trueValue + (Math.random() * 2.2 - 1.1)).toFixed(2)))
    const s2 = Math.max(2, Number((trueValue + (Math.random() * 2.8 - 1.4)).toFixed(2)))
    const errorMargin = Number(Math.abs(s1 - s2).toFixed(2))
    const temp = Number((24 + Math.sin(i / 10) * 5).toFixed(1))
    const rh = Number((65 + Math.cos(i / 10) * 15).toFixed(1))
    const isValid = errorMargin < 4.0

    rows.push(`${timeStr},airqo_colloc_09,${s1},${s2},${errorMargin},${temp},${rh},${isValid}`)
  }

  return rows.join("\n")
}

// 3. Regional AirQloud Performance Summary
const generateRegionalSummary = (): string => {
  return `region,city,cohort_name,total_devices,active_devices,uptime_percentage,avg_pm2_5,avg_pm10,data_completeness_pct
Central,Kampala,Kampala Urban Network,42,39,92.8,38.4,62.1,94.2
Central,Entebbe,Lake Victoria Coastal,12,11,91.6,21.3,34.8,96.0
Central,Wakiso,Greater Wakiso Residential,28,25,89.2,34.7,55.9,90.5
Eastern,Jinja,Industrial & Tourism Belt,16,15,93.7,42.1,68.4,95.1
Eastern,Mbale,Mount Elgon Foothills,10,9,90.0,18.6,29.3,88.4
Western,Mbarara,Western Corridor Hub,14,13,92.8,29.5,47.2,93.0
Western,Fort Portal,Rwenzori Tourism Belt,8,8,100.0,14.2,22.0,98.5
Northern,Gulu,Northern Regional Grid,15,13,86.6,26.8,41.9,87.2
Northern,Lira,Lango Commercial Center,9,8,88.8,31.2,49.5,89.0`
}

export const SAMPLE_DATASETS: SampleDatasetInfo[] = [
  {
    id: "air_quality_timeseries",
    title: "Air Quality Multi-Site Timeseries",
    description: "72 hours of hourly PM2.5, PM10, Temperature, Humidity & Battery across 5 monitoring stations.",
    category: "Time Series",
    rowCount: 360,
    csvContent: generateAirQualityTimeseries(),
  },
  {
    id: "collocation_sensors",
    title: "Collocation Dual Sensor Accuracy",
    description: "Inter-sensor comparison (Sensor 1 vs Sensor 2 PM2.5) with error margin and validity metrics.",
    category: "Correlation & QA",
    rowCount: 96,
    csvContent: generateCollocationData(),
  },
  {
    id: "regional_airqloud_summary",
    title: "Regional AirQloud Performance",
    description: "Regional cohort breakdown including active device count, uptime %, average PM2.5, and completeness.",
    category: "Categorical Summary",
    rowCount: 9,
    csvContent: generateRegionalSummary(),
  },
]
