import { MAX_RADIUS_KM, heatmapGradientStops, metersPerPixel, paintHeatmap } from "@/lib/device-heatmap"
import { BAND_ORDER, SNAPSHOT_NOTE, UPTIME_BANDS, type ReportDevice } from "@/lib/reports/device-report"

/**
 * The map and logo for a report, drawn straight onto a canvas. A screenshot of the live Leaflet map
 * would bring its zoom buttons and clipped attribution with it, which is what the sample report
 * shows. Browser only, except `fitMapFrame` and `getMapNote`.
 */

const TILE_SIZE = 256
const MAX_ZOOM = 15
const TILE_TIMEOUT_MS = 8000

export const REPORT_MAP_WIDTH = 880
export const REPORT_MAP_HEIGHT = 484

// The maintenance map's default tiles. CARTO's lighter ones are stamped "API KEY REQUIRED" without a key.
const tileUrl = (zoom: number, x: number, y: number) =>
  `https://${"abc"[(x + y) % 3]}.tile.openstreetmap.org/${zoom}/${x}/${y}.png`
const TILE_ATTRIBUTION = "© OpenStreetMap contributors"
// Softens the tiles so coloured markers stand out from them
const TILE_WASH = "rgba(255, 255, 255, 0.4)"
const HEAT_KEY_BAR_WIDTH = 110
// Below this a device's heat is hidden behind its own marker. The maintenance map hints at the same size.
const MIN_VISIBLE_REACH_PX = 10

interface Point {
  latitude: number
  longitude: number
}

const worldPixels = (point: Point, zoom: number) => {
  const scale = TILE_SIZE * 2 ** zoom
  const sine = Math.sin((point.latitude * Math.PI) / 180)
  return {
    x: ((point.longitude + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sine) / (1 - sine)) / (4 * Math.PI)) * scale,
  }
}

/**
 * The closest zoom that shows every point with some margin, and the map's top-left corner there.
 * `reachKm` widens the margin to that distance on the ground, so a heatmap isn't cut off at the edge.
 */
export function fitMapFrame(points: Point[], width: number, height: number, padding = 48, reachKm = 0) {
  if (points.length === 0) return null
  const averageLatitude = points.reduce((sum, point) => sum + point.latitude, 0) / points.length

  for (let zoom = MAX_ZOOM; zoom >= 1; zoom -= 1) {
    const pixels = points.map((point) => worldPixels(point, zoom))
    const xs = pixels.map((pixel) => pixel.x)
    const ys = pixels.map((pixel) => pixel.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const margin = Math.max(padding, (reachKm * 1000) / metersPerPixel(averageLatitude, zoom))
    if (maxX - minX <= width - 2 * margin && maxY - minY <= height - 2 * margin) {
      return { zoom, left: (minX + maxX) / 2 - width / 2, top: (minY + maxY) / 2 - height / 2 }
    }
  }

  const fallback = worldPixels(points[0], 1)
  return { zoom: 1, left: fallback.x - width / 2, top: fallback.y - height / 2 }
}

const loadImage = (url: string): Promise<HTMLImageElement | null> =>
  new Promise((resolve) => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    const timer = setTimeout(() => resolve(null), TILE_TIMEOUT_MS)
    image.onload = () => {
      clearTimeout(timer)
      resolve(image)
    }
    image.onerror = () => {
      clearTimeout(timer)
      resolve(null)
    }
    image.src = url
  })

const devicesOnMap = (devices: ReportDevice[]) =>
  devices.filter((device) => device.latitude !== null && device.longitude !== null) as Array<ReportDevice & Point>

const fitReportMap = (placed: Point[], withHeatmap: boolean) =>
  fitMapFrame(placed, REPORT_MAP_WIDTH, REPORT_MAP_HEIGHT, undefined, withHeatmap ? MAX_RADIUS_KM : 0)

/** The line beside the map, which says so when the devices are too spread out for their heat to show. */
export function getMapNote(devices: ReportDevice[], withHeatmap: boolean): string {
  const placed = devicesOnMap(devices)
  const frame = fitReportMap(placed, withHeatmap)
  if (!withHeatmap || !frame) return SNAPSHOT_NOTE

  const reachPixels = (MAX_RADIUS_KM * 1000) / metersPerPixel(placed[0].latitude, frame.zoom)
  return reachPixels < MIN_VISIBLE_REACH_PX
    ? `Dots show each device's uptime. The devices are too far apart for the ${MAX_RADIUS_KM} km heatmap to show at this scale.`
    : `Dots show each device's uptime. The heatmap shows where data still arrives, up to ${MAX_RADIUS_KM} km from a device.`
}

/** A JPEG data URL of the devices on a map, or null if there's nothing to place or no map loads. */
export async function renderDeviceMap(devices: ReportDevice[], withHeatmap = false): Promise<string | null> {
  const placed = devicesOnMap(devices)
  const frame = fitReportMap(placed, withHeatmap)
  if (!frame) return null

  const canvas = document.createElement("canvas")
  const pixelRatio = 2
  canvas.width = REPORT_MAP_WIDTH * pixelRatio
  canvas.height = REPORT_MAP_HEIGHT * pixelRatio
  const context = canvas.getContext("2d")
  if (!context) return null
  context.scale(pixelRatio, pixelRatio)
  context.fillStyle = "#eef2f6"
  context.fillRect(0, 0, REPORT_MAP_WIDTH, REPORT_MAP_HEIGHT)

  const { zoom, left, top } = frame
  const tilesAcross = 2 ** zoom
  const tiles: Array<{ x: number; y: number; column: number; row: number }> = []
  for (let column = Math.floor(left / TILE_SIZE); column <= Math.floor((left + REPORT_MAP_WIDTH) / TILE_SIZE); column += 1) {
    for (let row = Math.floor(top / TILE_SIZE); row <= Math.floor((top + REPORT_MAP_HEIGHT) / TILE_SIZE); row += 1) {
      if (row >= 0 && row < tilesAcross) {
        tiles.push({ column, row, x: ((column % tilesAcross) + tilesAcross) % tilesAcross, y: row })
      }
    }
  }

  const images = await Promise.all(tiles.map((tile) => loadImage(tileUrl(zoom, tile.x, tile.y))))
  if (images.every((image) => image === null)) return null
  images.forEach((image, index) => {
    if (!image) return
    const { column, row } = tiles[index]
    context.drawImage(image, column * TILE_SIZE - left, row * TILE_SIZE - top, TILE_SIZE, TILE_SIZE)
  })
  context.fillStyle = TILE_WASH
  context.fillRect(0, 0, REPORT_MAP_WIDTH, REPORT_MAP_HEIGHT)

  if (withHeatmap) {
    const heatPoints = placed.map((device) => ({
      lat: device.latitude,
      lng: device.longitude,
      uptimePct: device.uptime ?? 0,
      sensorPct: null,
    }))
    paintHeatmap(context, heatPoints, "uptime", {
      width: REPORT_MAP_WIDTH,
      height: REPORT_MAP_HEIGHT,
      zoom,
      centerLat: placed[0].latitude,
      project: (point) => {
        const pixel = worldPixels({ latitude: point.lat, longitude: point.lng }, zoom)
        return { x: pixel.x - left, y: pixel.y - top }
      },
    })
  }

  // Worst last, so a struggling device is never hidden behind a healthy neighbour
  const drawOrder = [...BAND_ORDER]
  drawOrder.forEach((band) => {
    placed
      .filter((device) => device.band === band)
      .forEach((device) => {
        const pixel = worldPixels(device, zoom)
        context.beginPath()
        context.arc(pixel.x - left, pixel.y - top, 7, 0, 2 * Math.PI)
        context.fillStyle = UPTIME_BANDS[band].color
        context.fill()
        context.lineWidth = 2
        context.strokeStyle = "#ffffff"
        context.stroke()
      })
  })

  context.font = "11px Inter, Arial, Helvetica, sans-serif"
  context.textBaseline = "middle"

  // Key, listing only what's on this map
  const bandsShown = BAND_ORDER.filter((band) => placed.some((device) => device.band === band))
  const bandsWidth = 14 + bandsShown.reduce((sum, band) => sum + context.measureText(UPTIME_BANDS[band].label).width + 28, 0)
  const heatLabel = "Uptime heatmap 0%"
  const heatEndLabel = "100%"
  const heatKeyWidth = withHeatmap
    ? context.measureText(heatLabel).width + HEAT_KEY_BAR_WIDTH + context.measureText(heatEndLabel).width + 22
    : 0
  context.fillStyle = "rgba(255, 255, 255, 0.92)"
  context.fillRect(10, REPORT_MAP_HEIGHT - 34, bandsWidth + heatKeyWidth, 24)
  let keyX = 22
  bandsShown.forEach((band) => {
    context.beginPath()
    context.arc(keyX, REPORT_MAP_HEIGHT - 22, 5, 0, 2 * Math.PI)
    context.fillStyle = UPTIME_BANDS[band].color
    context.fill()
    context.fillStyle = "#1c1d20"
    context.fillText(UPTIME_BANDS[band].label, keyX + 10, REPORT_MAP_HEIGHT - 22)
    keyX += context.measureText(UPTIME_BANDS[band].label).width + 28
  })
  if (withHeatmap) {
    const labelX = keyX - 5
    const barX = labelX + context.measureText(heatLabel).width + 6
    const gradient = context.createLinearGradient(barX, 0, barX + HEAT_KEY_BAR_WIDTH, 0)
    heatmapGradientStops("uptime").forEach(({ offset, color }) => gradient.addColorStop(offset, color))
    context.fillText(heatLabel, labelX, REPORT_MAP_HEIGHT - 22)
    context.fillText(heatEndLabel, barX + HEAT_KEY_BAR_WIDTH + 6, REPORT_MAP_HEIGHT - 22)
    context.fillStyle = gradient
    context.fillRect(barX, REPORT_MAP_HEIGHT - 26, HEAT_KEY_BAR_WIDTH, 8)
  }

  // Tile providers require this, so it's drawn in full rather than left to get clipped
  const attributionWidth = context.measureText(TILE_ATTRIBUTION).width + 12
  context.fillStyle = "rgba(255, 255, 255, 0.85)"
  context.fillRect(REPORT_MAP_WIDTH - attributionWidth, REPORT_MAP_HEIGHT - 18, attributionWidth, 18)
  context.fillStyle = "#475569"
  context.fillText(TILE_ATTRIBUTION, REPORT_MAP_WIDTH - attributionWidth + 6, REPORT_MAP_HEIGHT - 9)

  return canvas.toDataURL("image/jpeg", 0.82)
}

/** The AirQo logo as a PNG data URL, because jsPDF can't embed SVG. */
export async function loadReportLogo(): Promise<string | null> {
  const image = await loadImage("/icons/airqo_logo.svg")
  if (!image) return null
  const canvas = document.createElement("canvas")
  canvas.width = 282
  canvas.height = 192
  const context = canvas.getContext("2d")
  if (!context) return null
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL("image/png")
}
