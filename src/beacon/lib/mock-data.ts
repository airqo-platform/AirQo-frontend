/**
 * Mock Data Module
 * Provides realistic dummy data for all pages when backend is unavailable.
 * Enabled by setting NEXT_PUBLIC_USE_MOCK_DATA=true in .env.local
 */

// ─── Toggle ───────────────────────────────────────────────────────────────────
// Set to `true` to use dummy data, `false` to use real backend APIs
const USE_MOCK_DATA = false

export function isMockMode(): boolean {
  return USE_MOCK_DATA
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100
}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

function hoursAgo(n: number): string {
  const d = new Date()
  d.setHours(d.getHours() - n)
  return d.toISOString()
}

function uuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

// ─── Mock Devices ─────────────────────────────────────────────────────────────

// Generates aq_g5401 through aq_g5512
const DEVICE_NAMES = Array.from({ length: 112 }, (_, i) => `aq_g${5401 + i}`)

const SITES = [
  { name: 'Makerere University', city: 'Kampala', country: 'Uganda', lat: 0.3291, lng: 32.5701 },
  { name: 'Nakawa Division', city: 'Kampala', country: 'Uganda', lat: 0.3157, lng: 32.6147 },
  { name: 'US Embassy', city: 'Kampala', country: 'Uganda', lat: 0.3020, lng: 32.5915 },
  { name: 'Bwaise III', city: 'Kampala', country: 'Uganda', lat: 0.3520, lng: 32.5614 },
  { name: 'Nsambya Hospital', city: 'Kampala', country: 'Uganda', lat: 0.3025, lng: 32.5854 },
  { name: 'Entebbe Airport', city: 'Entebbe', country: 'Uganda', lat: 0.0424, lng: 32.4435 },
  { name: 'Jinja Road Station', city: 'Jinja', country: 'Uganda', lat: 0.4314, lng: 33.2068 },
  { name: 'Kisumu Station', city: 'Kisumu', country: 'Kenya', lat: -0.0917, lng: 34.7680 },
  { name: 'UNBS Headquarters', city: 'Kampala', country: 'Uganda', lat: 0.2959, lng: 32.6187 },
  { name: 'Rubaga Hospital', city: 'Kampala', country: 'Uganda', lat: 0.2977, lng: 32.5553 },
  { name: 'Nairobi Station', city: 'Nairobi', country: 'Kenya', lat: -1.2921, lng: 36.8219 },
  { name: 'Dar es Salaam', city: 'Dar es Salaam', country: 'Tanzania', lat: -6.7924, lng: 39.2083 },
]

const NETWORKS = ['airqo', 'kcca', 'usembassy', 'unep']
const CATEGORIES = ['lowcost', 'bam']

export function getMockDevices(): any[] {
  return DEVICE_NAMES.map((name, i) => {
    const site = SITES[i % SITES.length]
    const isOnline = Math.random() > 0.25
    const category = i % 5 === 0 ? 'bam' : 'lowcost'
    return {
      _id: uuid(),
      name: name,
      long_name: `AirQo ${name.toUpperCase()}`,
      alias: name,
      isActive: true,
      isOnline,
      isPrimaryInLocation: i % 3 === 0,
      status: isOnline ? 'deployed' : (Math.random() > 0.5 ? 'deployed' : 'not deployed'),
      visibility: true,
      authRequired: false,
      device_number: 2084530 + i,
      serial_number: `SN-${1000 + i}`,
      device_codes: [name],
      network: NETWORKS[i % NETWORKS.length],
      category,
      mobility: false,
      height: randomBetween(2, 5),
      mountType: 'pole',
      powerType: 'solar',
      writeKey: 'mock-write-key',
      readKey: 'mock-read-key',
      createdAt: daysAgo(365 - i * 10),
      lastActive: isOnline ? hoursAgo(Math.floor(Math.random() * 3)) : daysAgo(Math.floor(Math.random() * 30) + 1),
      lastRawData: isOnline ? hoursAgo(1) : daysAgo(Math.floor(Math.random() * 14)),
      nextMaintenance: daysAgo(-Math.floor(Math.random() * 60)),
      latitude: site.lat + (Math.random() - 0.5) * 0.01,
      longitude: site.lng + (Math.random() - 0.5) * 0.01,
      groups: [],
      tags: [category],
      cohorts: [{ _id: uuid(), name: `Cohort ${Math.floor(i / 3) + 1}` }],
      grids: [],
      site: {
        _id: uuid(),
        name: site.name,
        formatted_name: site.name,
        location_name: site.name,
        search_name: site.name.toLowerCase(),
        city: site.city,
        country: site.country,
        description: '',
        approximate_latitude: site.lat,
        approximate_longitude: site.lng,
        generated_name: site.name,
      },
    }
  })
}

// ─── Device Stats ─────────────────────────────────────────────────────────────

export function getMockDeviceStats() {
  return {
    summary: { total: 156, active: 142, inactive: 14, online: 128, offline: 28 },
    deployment: { deployed: 134, not_deployed: 18, recalled: 4 },
    status_breakdown: { deployed: 134, 'not deployed': 18, recalled: 4 },
    percentages: { active_rate: 91.0, online_rate: 82.1, deployment_rate: 85.9 },
    networks: { airqo: 98, kcca: 32, usembassy: 16, unep: 10 },
    categories: { lowcost: 138, bam: 18 },
    maintenance: { upcoming_30_days: 12, percentage: 7.7 },
    timestamp: new Date().toISOString(),
  }
}

export function getMockDeviceSummary() {
  return {
    total_devices: 156,
    active_airqlouds: 24,
    tracked_devices: 142,
    deployed_devices: 134,
    tracked_online: 128,
    tracked_offline: 14,
  }
}

// ─── Dashboard Summary ────────────────────────────────────────────────────────

export function getMockDashboardSummary() {
  return {
    total_devices: 156,
    total_sites: 48,
    active_networks: 4,
    data_completeness: 87.3,
    devices_online: 128,
    devices_offline: 28,
    uptime_percent: 91.2,
    last_24h_readings: 45320,
    health_indicators: {
      good: 102,
      moderate: 36,
      poor: 18,
    },
    network_distribution: {
      airqo: 98,
      kcca: 32,
      usembassy: 16,
      unep: 10,
    },
    device_categories: {
      lowcost: 138,
      bam: 18,
    },
  }
}

export function getMockSystemHealth() {
  return {
    status: 'healthy',
    api_latency_ms: 42,
    database_status: 'connected',
    cache_hit_rate: 94.2,
    error_rate: 0.3,
    uptime_hours: 720,
    components: {
      api: { status: 'healthy', latency: 42 },
      database: { status: 'healthy', latency: 8 },
      cache: { status: 'healthy', hit_rate: 94.2 },
      messaging: { status: 'healthy', queue_size: 12 },
    },
  }
}

export function getMockDataTransmission() {
  const days = 7
  const daily: any[] = []
  for (let i = days - 1; i >= 0; i--) {
    daily.push({
      date: daysAgo(i).split('T')[0],
      readings_count: Math.floor(randomBetween(5000, 8000)),
      devices_reporting: Math.floor(randomBetween(100, 140)),
      completeness: randomBetween(80, 98),
    })
  }
  return {
    period_days: days,
    total_readings: daily.reduce((s, d) => s + d.readings_count, 0),
    avg_daily_readings: Math.floor(daily.reduce((s, d) => s + d.readings_count, 0) / days),
    daily_breakdown: daily,
  }
}

export function getMockNetworkPerformance() {
  return {
    networks: [
      { name: 'airqo', device_count: 98, online: 86, uptime: 93.2, data_completeness: 89.1 },
      { name: 'kcca', device_count: 32, online: 28, uptime: 91.5, data_completeness: 87.3 },
      { name: 'usembassy', device_count: 16, online: 14, uptime: 96.8, data_completeness: 94.2 },
      { name: 'unep', device_count: 10, online: 8, uptime: 88.4, data_completeness: 82.6 },
    ],
    overall: {
      total_devices: 156,
      avg_uptime: 92.5,
      avg_completeness: 88.3,
    },
  }
}

export function getMockOfflineDevices() {
  const devices = getMockDevices()
    .filter((_, i) => i % 4 === 0)
    .map(d => ({
      device_id: d._id,
      device_key: d.readKey,
      device_name: d.name,
      network: d.network,
      category: d.category,
      last_updated: daysAgo(Math.floor(Math.random() * 14) + 1),
      status: d.status,
      is_online: false,
      is_active: d.isActive,
    }))
  return {
    threshold_hours: 24,
    count: devices.length,
    devices,
  }
}

export function getMockUpcomingMaintenance() {
  const devices = getMockDevices().slice(0, 5)
  return devices.map(d => ({
    device_id: d._id,
    device_name: d.name,
    maintenance_type: ['Routine Check', 'Filter Replacement', 'Calibration', 'Battery Replacement', 'Sensor Cleaning'][Math.floor(Math.random() * 5)],
    scheduled_date: daysAgo(-Math.floor(Math.random() * 30)),
    priority: ['high', 'medium', 'low'][Math.floor(Math.random() * 3)],
    location: d.site?.name || 'Unknown',
  }))
}

// ─── Map Data ─────────────────────────────────────────────────────────────────

export function getMockMapData() {
  return getMockDevices().map(d => ({
    device_id: d._id,
    device_name: d.name,
    latitude: d.latitude,
    longitude: d.longitude,
    is_online: d.isOnline,
    category: d.category,
    network: d.network,
    last_active: d.lastActive,
    site_name: d.site?.name,
  }))
}

// ─── AirQlouds / Cohorts ──────────────────────────────────────────────────────

const COHORT_NAMES = [
  'KCCA Urban Network', 'AirQo Kampala', 'US Embassy Monitors',
  'Jinja Deployment', 'UNEP East Africa', 'Nairobi Cluster',
  'Entebbe Airport', 'Bwaise Community', 'Makerere Research',
  'Industrial Zone A',
]

export function getMockCohorts() {
  const cohorts = COHORT_NAMES.map((name, i) => {
    const deviceCount = Math.floor(randomBetween(3, 15))
    const cohortUptime = randomBetween(0.75, 0.99) // 0-1 decimal as API returns
    const devices = getMockDevices().slice(0, deviceCount).map(d => {
      // 14 days * 24 hours = 336 hourly points
      const hourlyData = Array.from({ length: 336 }, (_, h) => {
        const dt = new Date()
        dt.setHours(dt.getHours() - h)
        return {
          datetime: dt.toISOString(),
          s1_pm2_5: randomBetween(10, 60),
          s2_pm2_5: randomBetween(10, 60),
        }
      })

      return {
        _id: d._id,
        name: d.name,
        long_name: d.long_name,
        description: null,
        device_number: d.device_number,
        isActive: d.isActive,
        isOnline: d.isOnline,
        rawOnlineStatus: d.isOnline,
        lastRawData: d.lastRawData,
        lastActive: d.lastActive,
        last_active: d.lastActive,
        status: d.status,
        network: d.network,
        createdAt: d.createdAt,
        uptime: randomBetween(0.70, 0.99),
        data_completeness: randomBetween(0.70, 0.98),
        sensor_error_margin: randomBetween(1, 8),
        data: hourlyData, // Required for analytics detail page
      }
    })

    // Generate daily uptime data for the history graph (last 14 days)
    const dailyData = Array.from({ length: 14 }, (_, j) => ({
      date: daysAgo(13 - j).split('T')[0],
      uptime: randomBetween(0.65, 0.99), // 0-1 decimal
      data_completeness: randomBetween(0.60, 0.98),
      error_margin: randomBetween(1, 8),
    }))

    return {
      _id: uuid(),
      name,
      network: NETWORKS[i % NETWORKS.length],
      createdAt: daysAgo(200 - i * 15),
      numberOfDevices: deviceCount,
      devices,
      groups: [],
      cohort_tags: ['hardware', 'duplicate', 'organizational', 'inlab', 'misc'],
      cohort_codes: [],
      visibility: true,
      uptime: cohortUptime, // 0-1 decimal — processAirQloudData multiplies by 100
      data_completeness: randomBetween(0.75, 0.98),
      sensor_error_margin: randomBetween(1, 6),
      error_margin: randomBetween(1, 6),
      data: dailyData, // daily uptime history for the mini bar graph
      freq: Array.from({ length: 14 }, () => randomBetween(70, 100)),
      timestamp: Array.from({ length: 14 }, (_, j) => daysAgo(13 - j).split('T')[0]),
    }
  })

  return {
    cohorts,
    meta: {
      total: cohorts.length,
      page: 1,
      totalPages: 1,
      limit: 100,
      skip: 0,
    },
  }
}

export function getMockCohortPerformance(ids: string[]) {
  return ids.map(id => {
    const name = COHORT_NAMES[Math.floor(Math.random() * COHORT_NAMES.length)]
    const deviceCount = Math.floor(randomBetween(3, 10))
    return {
      id,
      name,
      uptime: randomBetween(80, 99),
      data_completeness: randomBetween(75, 98),
      sensor_error_margin: randomBetween(1, 6),
      error_margin: Array.from({ length: 24 * 7 }, () => randomBetween(0.5, 8)),
      freq: Array.from({ length: 24 * 7 }, () => randomBetween(60, 100)),
      timestamp: Array.from({ length: 24 * 7 }, (_, i) => {
        const d = new Date()
        d.setHours(d.getHours() - (24 * 7 - i))
        return d.toISOString()
      }),
      numberOfDevices: deviceCount,
      devices: getMockDevices().slice(0, deviceCount).map(d => ({
        _id: d._id,
        name: d.name,
        long_name: d.long_name,
        uptime: randomBetween(75, 99),
        data_completeness: randomBetween(70, 98),
        sensor_error_margin: randomBetween(1, 8),
      })),
    }
  })
}

// ─── Firmware ─────────────────────────────────────────────────────────────────

export function getMockFirmwareVersions() {
  return [
    {
      id: uuid(), firmware_version: 'v2.3.1', firmware_string: 'mock-bin-data',
      firmware_string_hex: 'mock-hex-data', firmware_string_bootloader: null,
      firmware_type: 'stable', description: 'Production release with improved PM sensor calibration',
      crc32: 'A1B2C3D4', firmware_bin_size: 524288,
      change1: 'Improved PM2.5 sensor calibration accuracy',
      change2: 'Fixed WiFi reconnection in weak-signal areas',
      change3: 'Optimized power consumption during sleep mode',
      created_at: daysAgo(5), updated_at: daysAgo(3),
    },
    {
      id: uuid(), firmware_version: 'v2.3.0', firmware_string: 'mock-bin-data',
      firmware_string_hex: 'mock-hex-data', firmware_string_bootloader: 'mock-boot-data',
      firmware_type: 'stable', description: 'Major update with OTA improvements',
      crc32: 'E5F6G7H8', firmware_bin_size: 512000,
      change1: 'New OTA update mechanism', change2: 'Added battery health reporting',
      created_at: daysAgo(30), updated_at: daysAgo(15),
    },
    {
      id: uuid(), firmware_version: 'v2.4.0-beta', firmware_string: 'mock-bin-data',
      firmware_string_hex: null, firmware_string_bootloader: null,
      firmware_type: 'beta', description: 'Beta firmware with new humidity compensation',
      crc32: null, firmware_bin_size: 540672,
      change1: 'New humidity compensation algorithm',
      change2: 'Experimental mesh networking support',
      created_at: daysAgo(2), updated_at: daysAgo(1),
    },
    {
      id: uuid(), firmware_version: 'v2.2.5', firmware_string: 'mock-bin-data',
      firmware_string_hex: 'mock-hex-data', firmware_string_bootloader: null,
      firmware_type: 'deprecated', description: 'Legacy firmware — please upgrade',
      crc32: 'I9J0K1L2', firmware_bin_size: 495616,
      change1: 'Security patch for TLS vulnerability',
      created_at: daysAgo(90), updated_at: daysAgo(60),
    },
    {
      id: uuid(), firmware_version: 'v2.1.3', firmware_string: 'mock-bin-data',
      firmware_string_hex: 'mock-hex-data', firmware_string_bootloader: null,
      firmware_type: 'legacy', description: 'Old firmware version',
      crc32: 'M3N4O5P6', firmware_bin_size: 471040,
      change1: 'Initial stable release for GS5 hardware',
      created_at: daysAgo(180), updated_at: null,
    },
  ]
}

// ─── Stock ────────────────────────────────────────────────────────────────────

export function getMockStockItems() {
  const items = [
    { name: 'PM2.5 Sensors (PMS5003)', stock: 245, unit: 'pieces', change: 20, last_stock_addition: 50 },
    { name: 'NodeMCU ESP32 Boards', stock: 186, unit: 'pieces', change: -12, last_stock_addition: 30 },
    { name: 'Solar Panels (6W)', stock: 67, unit: 'pieces', change: 0, last_stock_addition: null },
    { name: 'Lithium Batteries (3.7V 6000mAh)', stock: 312, unit: 'pieces', change: 100, last_stock_addition: 100 },
    { name: 'Weatherproof Enclosures', stock: 89, unit: 'pieces', change: -3, last_stock_addition: 20 },
    { name: 'SIM Cards (MTN IoT)', stock: 420, unit: 'pieces', change: 50, last_stock_addition: 50 },
    { name: 'Mounting Brackets', stock: 156, unit: 'pieces', change: 0, last_stock_addition: null },
    { name: 'USB Cables (Type-C 2m)', stock: 78, unit: 'pieces', change: -8, last_stock_addition: 20 },
    { name: 'Temperature Sensors (DHT22)', stock: 198, unit: 'pieces', change: 15, last_stock_addition: 30 },
    { name: 'Antenna (4G LTE)', stock: 54, unit: 'pieces', change: -2, last_stock_addition: 10 },
  ].map((item, i) => ({
    ...item,
    id: uuid(),
    created_date: daysAgo(300 - i * 20),
    updated_at: daysAgo(Math.floor(Math.random() * 14)),
    last_stocked_at: item.last_stock_addition ? daysAgo(Math.floor(Math.random() * 30)) : null,
    stock_after_last_addition: item.last_stock_addition ? item.stock : null,
  }))

  return {
    items,
    total: items.length,
    page: 1,
    page_size: 100,
    has_next: false,
  }
}

// ─── Categories ───────────────────────────────────────────────────────────────

export function getMockCategories() {
  const categories = [
    {
      name: 'lowcost', description: 'Low-cost air quality monitoring sensors', level: 'standard',
      field1: 's1_pm2_5', field2: 's2_pm2_5', field3: 's1_pm10', field4: 's2_pm10',
      field5: 'temperature', field6: 'humidity', field7: 'battery_voltage',
      config1: 'sampling_interval', config2: 'upload_interval', config3: 'wifi_ssid',
      metadata1: 'hardware_version', metadata2: 'pcb_version',
    },
    {
      name: 'bam', description: 'Beta Attenuation Monitor — reference grade', level: 'reference',
      field1: 'pm2_5', field2: 'pm10', field3: 'temperature', field4: 'pressure',
      field5: 'humidity', field6: 'flow_rate',
      config1: 'calibration_date', config2: 'flow_rate_setpoint',
      metadata1: 'manufacturer', metadata2: 'model_number', metadata3: 'certification',
    },
    {
      name: 'gaseous', description: 'Gaseous pollutant sensors (NO2, O3, CO)', level: 'standard',
      field1: 'no2', field2: 'o3', field3: 'co', field4: 'temperature', field5: 'humidity',
      config1: 'sampling_interval', config2: 'calibration_date',
      metadata1: 'sensor_manufacturer',
    },
  ].map(cat => ({
    ...cat,
    created_at: daysAgo(400),
    updated_at: daysAgo(10),
  }))

  return {
    categories,
    total: categories.length,
    page: 1,
    page_size: 25,
    has_next: false,
  }
}

// ─── Users ────────────────────────────────────────────────────────────────────

export function getMockUsers() {
  return [
    { id: 1, first_name: 'Joel', last_name: 'Ssematimba', email: 'joel@airqo.net', role: 'administrator', status: 'active', created_at: daysAgo(365), phone: '+256700100100' },
    { id: 2, first_name: 'Deo', last_name: 'Okure', email: 'deo@airqo.net', role: 'administrator', status: 'active', created_at: daysAgo(350) },
    { id: 3, first_name: 'Martin', last_name: 'Bbaale', email: 'martin@airqo.net', role: 'data_analyst', status: 'active', created_at: daysAgo(200) },
    { id: 4, first_name: 'Richard', last_name: 'Sserunjogi', email: 'richard@airqo.net', role: 'field_technician', status: 'active', created_at: daysAgo(150) },
    { id: 5, first_name: 'Gloria', last_name: 'Namulindwa', email: 'gloria@airqo.net', role: 'data_analyst', status: 'active', created_at: daysAgo(120) },
    { id: 6, first_name: 'Isaac', last_name: 'Wampamba', email: 'isaac@airqo.net', role: 'field_technician', status: 'active', created_at: daysAgo(90) },
    { id: 7, first_name: 'Sarah', last_name: 'Nantongo', email: 'sarah@airqo.net', role: 'viewer', status: 'active', created_at: daysAgo(60) },
    { id: 8, first_name: 'Peter', last_name: 'Mukwaya', email: 'peter@airqo.net', role: 'field_technician', status: 'inactive', created_at: daysAgo(300) },
  ]
}

export function getMockProfile() {
  return {
    id: 1,
    first_name: 'Demo',
    last_name: 'User',
    email: 'demo@airqo.net',
    phone: '+256700000000',
    role: 'administrator',
    created_at: daysAgo(365),
  }
}

// ─── Alerts ───────────────────────────────────────────────────────────────────

export function getMockAlertDevices() {
  const devices = getMockDevices()
  const maintenanceTypes = ['Offline', 'Restored', 'Low Battery', 'Temperature Warning']
  const descriptions = [
    'Device went offline unexpectedly — possible power failure',
    'Device connectivity restored after maintenance',
    'Battery voltage dropped below 3.2V threshold',
    'Internal temperature exceeded 55°C warning limit',
  ]

  return {
    devices: devices.slice(0, 6).map(d => ({
      device: { id: d._id, name: d.name },
      location: {
        name: d.site?.name,
        city: d.site?.city,
        country: d.site?.country,
      },
      maintenance_history: Array.from({ length: Math.floor(Math.random() * 5) + 1 }, (_, i) => {
        const typeIdx = Math.floor(Math.random() * maintenanceTypes.length)
        return {
          maintenance_type: maintenanceTypes[typeIdx],
          description: descriptions[typeIdx],
          timestamp: daysAgo(Math.floor(Math.random() * 30)),
        }
      }),
    })),
  }
}

// ─── Maintenance Map ──────────────────────────────────────────────────────────

export function getMockMaintenanceMapData() {
  return getMockDevices().map(d => ({
    device_id: d._id,
    device_name: d.name,
    latitude: d.latitude,
    longitude: d.longitude,
    last_active: d.lastActive,
    uptime: randomBetween(60, 100),
    data_completeness: randomBetween(50, 100),
    error_margin: randomBetween(0.5, 8),
    cohorts: d.cohorts.map((c: any) => c.name),
  }))
}

// ─── Device Performance Data (for analysis pages) ─────────────────────────────

export function getMockDevicePerformanceData(deviceNames: string[]) {
  return deviceNames.map(name => {
    const hourlyPoints = 24 * 7
    return {
      device_name: name,
      performance: {
        freq: Array.from({ length: hourlyPoints }, () => randomBetween(60, 100)),
        error_margin: Array.from({ length: hourlyPoints }, () => randomBetween(0.5, 8)),
        timestamp: Array.from({ length: hourlyPoints }, (_, i) => {
          const d = new Date()
          d.setHours(d.getHours() - (hourlyPoints - i))
          return d.toISOString()
        }),
      },
    }
  })
}

// ─── Device Metadata & Config (for device detail page) ────────────────────────

export function getMockDeviceMetadata() {
  return [
    { key: 'hardware_version', value: 'GS5 Rev 2.1', updated_at: daysAgo(30) },
    { key: 'pcb_version', value: 'PCB-v3.2', updated_at: daysAgo(30) },
    { key: 'sensor_type', value: 'PMS5003', updated_at: daysAgo(90) },
    { key: 'gsm_module', value: 'SIM7600', updated_at: daysAgo(90) },
    { key: 'antenna_type', value: '4G LTE External', updated_at: daysAgo(90) },
    { key: 'enclosure_material', value: 'UV-resistant ABS', updated_at: daysAgo(180) },
  ]
}

export function getMockDeviceConfig() {
  return [
    { config_key: 'sampling_interval', value: '60', unit: 'seconds', updated_at: daysAgo(7) },
    { config_key: 'upload_interval', value: '300', unit: 'seconds', updated_at: daysAgo(7) },
    { config_key: 'wifi_ssid', value: 'AirQo-Field', unit: '', updated_at: daysAgo(14) },
    { config_key: 'sleep_mode', value: 'enabled', unit: '', updated_at: daysAgo(14) },
    { config_key: 'gps_interval', value: '3600', unit: 'seconds', updated_at: daysAgo(30) },
  ]
}

// ─── AirQloud Basic (for maintenance cohort dropdown) ─────────────────────────

export function getMockAirQloudsBasic() {
  return getMockCohorts()
}
