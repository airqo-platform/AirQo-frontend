import L from "leaflet"

// types/leaflet.d.ts declares the leaflet module as `any`, so there are no Leaflet types to import.
type LeafletMap = any

/**
 * Canvas heatmap of device uptime, sensor error margin or spatial coverage, drawn to real-world scale.
 *
 * Each device is assumed to represent the area within FULL_RADIUS_KM of it fully, and
 * less the further out, reaching nothing at MAX_RADIUS_KM (smoothstep in between).
 *
 * With wᵢ a device's weight at a point and uᵢ its uptime (0–1):
 *
 * - coverage: 1 - Π(1 - wᵢ). How well the point is covered by at least one installed device,
 *             online or not.
 * - uptime:   (1 - Π(1 - wᵢuᵢ)) / coverage. How much of that coverage is actually delivering data:
 *             an offline device next to an online one leaves the place served (green); red means
 *             no working device reaches it. A single device scores its own uptime at any distance.
 * - sensor:   quality of the data that actually arrives. Each device's error-margin score is weighted
 *             by wᵢuᵢ (an offline device delivers no data, so its sensor does not matter) and weighted up
 *             when poor, because one bad sensor among online devices lowers the area's data quality.
 *             Drawn only where online devices with an error margin reach.
 *
 * Uptime and sensor are faded out by coverage so areas without devices stay clear.
 */

export type HeatmapMode = "off" | "uptime" | "sensor" | "coverage"
type ActiveMode = Exclude<HeatmapMode, "off">

export const FULL_RADIUS_KM = 1
export const MAX_RADIUS_KM = 5

export interface HeatmapPoint {
  lat: number
  lng: number
  /** 0–100 */
  uptimePct: number
  /** 0–100 from sensorScore; null when the device reports no error margin (left out of the sensor mode) */
  sensorPct: number | null
}

// Error margin (±) mapped onto the same 0–100 bands as uptime, matching the marker rings:
// ≤10 good (≥85), 10–20 moderate (50–85), >20 critical (<50), nothing left by 40.
const ERROR_MARGIN_STOPS: [number, number][] = [
  [0, 100],
  [10, 85],
  [20, 50],
  [40, 0],
]

/** Error margin as a 0–100 score on the same bands as uptime; null when there is no error margin. */
export const sensorScore = (errorMargin: number | null | undefined): number | null => {
  if (errorMargin === null || errorMargin === undefined) return null
  const value = Number(errorMargin)
  if (!Number.isFinite(value)) return null
  return errorMarginToScore(value)
}

const errorMarginToScore = (errorMargin: number): number => {
  if (errorMargin <= 0) return 100
  for (let i = 1; i < ERROR_MARGIN_STOPS.length; i++) {
    const [e1, s1] = ERROR_MARGIN_STOPS[i]
    if (errorMargin <= e1) {
      const [e0, s0] = ERROR_MARGIN_STOPS[i - 1]
      return s0 + ((s1 - s0) * (errorMargin - e0)) / (e1 - e0)
    }
  }
  return 0
}

// In the sensor blend, a sensor scoring 0 counts this many times more than one scoring 100.
const PROBLEM_WEIGHT = 3

/** Per-cell running totals; one entry per grid cell. */
interface Accumulators {
  miss: Float32Array // Π(1 - w): coverage
  missServed: Float32Array // Π(1 - w·u): delivering data
  missSensor: Float32Array // Π(1 - w·u) over devices with an error margin
  sensorWeight: Float32Array // Σ w·u·problemWeight
  sensorSum: Float32Array // Σ w·u·problemWeight·score
}

const createAccumulators = (size: number): Accumulators => ({
  miss: new Float32Array(size).fill(1),
  missServed: new Float32Array(size).fill(1),
  missSensor: new Float32Array(size).fill(1),
  sensorWeight: new Float32Array(size),
  sensorSum: new Float32Array(size),
})

const accumulate = (acc: Accumulators, i: number, w: number, point: HeatmapPoint) => {
  const delivered = w * (Math.max(0, Math.min(100, point.uptimePct)) / 100)
  acc.miss[i] *= 1 - w
  acc.missServed[i] *= 1 - delivered
  if (point.sensorPct !== null) {
    const problemWeight = 1 + (PROBLEM_WEIGHT - 1) * (1 - point.sensorPct / 100)
    acc.missSensor[i] *= 1 - delivered
    acc.sensorWeight[i] += delivered * problemWeight
    acc.sensorSum[i] += delivered * problemWeight * point.sensorPct
  }
}

/** Colour value (0–1 for coverage, 0–100 otherwise) and opacity of one cell, or null when nothing is drawn. */
const resolve = (acc: Accumulators, i: number, mode: ActiveMode): { value: number; alpha: number } | null => {
  const coverage = 1 - acc.miss[i]
  if (coverage <= 0.001) return null
  if (mode === "coverage") return { value: coverage, alpha: coverage }
  if (mode === "uptime") return { value: ((1 - acc.missServed[i]) / coverage) * 100, alpha: coverage }
  const served = 1 - acc.missSensor[i]
  if (served <= 0.001 || acc.sensorWeight[i] <= 0) return null
  return { value: acc.sensorSum[i] / acc.sensorWeight[i], alpha: served }
}

/** The value drawn at one spot, given each device's weight there. Same maths as the layer; used to check scenarios. */
export const evaluateSpot = (
  contributions: { weight: number; point: HeatmapPoint }[],
  mode: ActiveMode
): { value: number; alpha: number } | null => {
  const acc = createAccumulators(1)
  contributions.forEach(({ weight, point }) => accumulate(acc, 0, weight, point))
  return resolve(acc, 0, mode)
}

const OUTER_RADIUS_KM = MAX_RADIUS_KM
const FALLOFF_KM = MAX_RADIUS_KM - FULL_RADIUS_KM
const EARTH_CIRCUMFERENCE_M = 40075016.686
const MAX_ALPHA = 0.62

export const influence = (distanceKm: number): number => {
  if (distanceKm <= FULL_RADIUS_KM) return 1
  if (distanceKm >= OUTER_RADIUS_KM) return 0
  const t = (distanceKm - FULL_RADIUS_KM) / FALLOFF_KM
  return 1 - t * t * (3 - 2 * t)
}

const metersPerPixel = (lat: number, zoom: number) =>
  (EARTH_CIRCUMFERENCE_M * Math.cos((lat * Math.PI) / 180)) / (256 * Math.pow(2, zoom))

// Scores read like the markers: red below 50, amber to 85, green above.
const SCORE_STOPS: [number, [number, number, number]][] = [
  [0, [220, 38, 38]],
  [50, [245, 158, 11]],
  [85, [16, 185, 129]],
  [100, [5, 150, 105]],
]

// Coverage is a single-hue sequential ramp: light to dark blue.
const COVERAGE_STOPS: [number, [number, number, number]][] = [
  [0, [191, 219, 254]],
  [0.5, [59, 130, 246]],
  [1, [30, 64, 175]],
]

const interpolate = (stops: [number, [number, number, number]][], value: number): [number, number, number] => {
  if (value <= stops[0][0]) return stops[0][1]
  for (let i = 1; i < stops.length; i++) {
    const [v1, c1] = stops[i]
    if (value <= v1) {
      const [v0, c0] = stops[i - 1]
      const t = (value - v0) / (v1 - v0)
      return [0, 1, 2].map((k) => Math.round(c0[k] + (c1[k] - c0[k]) * t)) as [number, number, number]
    }
  }
  return stops[stops.length - 1][1]
}

export const heatmapGradientCss = (mode: ActiveMode): string => {
  const stops = mode === "coverage" ? COVERAGE_STOPS : SCORE_STOPS
  const max = stops[stops.length - 1][0]
  return `linear-gradient(to right, ${stops
    .map(([v, [r, g, b]]) => `rgb(${r}, ${g}, ${b}) ${(v / max) * 100}%`)
    .join(", ")})`
}

/** Pixels covered by a device's full reach at the current view (used to hint when zoomed out too far to see it). */
export const maxRadiusPixels = (map: LeafletMap): number =>
  (MAX_RADIUS_KM * 1000) / metersPerPixel(map.getCenter().lat, map.getZoom())

export class DeviceHeatmapLayer extends L.Layer {
  private points: HeatmapPoint[]
  private mode: ActiveMode
  private canvas: HTMLCanvasElement | null = null
  private frame: number | null = null

  constructor(points: HeatmapPoint[], mode: ActiveMode) {
    super()
    this.points = points
    this.mode = mode
  }

  setData(points: HeatmapPoint[], mode: ActiveMode) {
    this.points = points
    this.mode = mode
    this.scheduleDraw()
  }

  onAdd(map: LeafletMap) {
    this.canvas = L.DomUtil.create("canvas", "leaflet-zoom-hide") as HTMLCanvasElement
    this.canvas.style.pointerEvents = "none"
    map.getPanes().overlayPane.appendChild(this.canvas)
    map.on("moveend zoomend resize viewreset", this.scheduleDraw, this)
    this.draw()
    return this
  }

  onRemove(map: LeafletMap) {
    map.off("moveend zoomend resize viewreset", this.scheduleDraw, this)
    if (this.frame !== null) cancelAnimationFrame(this.frame)
    this.canvas?.remove()
    this.canvas = null
    return this
  }

  private scheduleDraw() {
    if (this.frame !== null) cancelAnimationFrame(this.frame)
    this.frame = requestAnimationFrame(() => {
      this.frame = null
      this.draw()
    })
  }

  private draw() {
    const map = this._map
    const canvas = this.canvas
    if (!map || !canvas) return

    const size = map.getSize()
    const topLeft = map.containerPointToLayerPoint([0, 0])
    L.DomUtil.setPosition(canvas, topLeft)
    canvas.width = size.x
    canvas.height = size.y
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, size.x, size.y)
    // The map container can still be unsized when the layer is added; the resize event redraws it.
    if (this.points.length === 0 || size.x <= 0 || size.y <= 0) return

    const zoom = map.getZoom()
    // Finer cells when the radius is small on screen, coarser when large; the result is smoothed on upscale.
    const outerPxAtCenter = (OUTER_RADIUS_KM * 1000) / metersPerPixel(map.getCenter().lat, zoom)
    const cell = Math.max(2, Math.min(6, Math.round(outerPxAtCenter / 8)))
    const cols = Math.ceil(size.x / cell)
    const rows = Math.ceil(size.y / cell)

    const acc = createAccumulators(cols * rows)

    for (const point of this.points) {
      const p = map.latLngToContainerPoint([point.lat, point.lng])
      const kmPerPx = metersPerPixel(point.lat, zoom) / 1000
      const outerPx = OUTER_RADIUS_KM / kmPerPx
      if (p.x < -outerPx || p.y < -outerPx || p.x > size.x + outerPx || p.y > size.y + outerPx) continue

      const c0 = Math.max(0, Math.floor((p.x - outerPx) / cell))
      const c1 = Math.min(cols - 1, Math.floor((p.x + outerPx) / cell))
      const r0 = Math.max(0, Math.floor((p.y - outerPx) / cell))
      const r1 = Math.min(rows - 1, Math.floor((p.y + outerPx) / cell))

      for (let r = r0; r <= r1; r++) {
        const dy = (r + 0.5) * cell - p.y
        for (let c = c0; c <= c1; c++) {
          const dx = (c + 0.5) * cell - p.x
          const w = influence(Math.sqrt(dx * dx + dy * dy) * kmPerPx)
          if (w <= 0) continue
          accumulate(acc, r * cols + c, w, point)
        }
      }
    }

    const grid = document.createElement("canvas")
    grid.width = cols
    grid.height = rows
    const gctx = grid.getContext("2d")
    if (!gctx) return
    const image = gctx.createImageData(cols, rows)

    for (let i = 0; i < cols * rows; i++) {
      const cellValue = resolve(acc, i, this.mode)
      if (!cellValue) continue
      const [red, green, blue] = interpolate(this.mode === "coverage" ? COVERAGE_STOPS : SCORE_STOPS, cellValue.value)
      const o = i * 4
      image.data[o] = red
      image.data[o + 1] = green
      image.data[o + 2] = blue
      image.data[o + 3] = Math.round(cellValue.alpha * MAX_ALPHA * 255)
    }
    gctx.putImageData(image, 0, 0)

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = "high"
    ctx.drawImage(grid, 0, 0, cols * cell, rows * cell)
  }
}
