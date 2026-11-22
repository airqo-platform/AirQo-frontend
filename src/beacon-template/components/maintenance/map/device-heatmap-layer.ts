import L from "leaflet"
import {
  MAX_RADIUS_KM,
  metersPerPixel,
  paintHeatmap,
  type ActiveHeatmapMode,
  type HeatmapPoint,
} from "@/lib/device-heatmap"

export * from "@/lib/device-heatmap"

// types/leaflet.d.ts declares the leaflet module as `any`, so there are no Leaflet types to import.
type LeafletMap = any

/** Pixels covered by a device's full reach at the current view (used to hint when zoomed out too far to see it). */
export const maxRadiusPixels = (map: LeafletMap): number =>
  (MAX_RADIUS_KM * 1000) / metersPerPixel(map.getCenter().lat, map.getZoom())

/** The heatmap in `lib/device-heatmap` as a Leaflet layer, redrawn whenever the map moves. */
export class DeviceHeatmapLayer extends L.Layer {
  private points: HeatmapPoint[]
  private mode: ActiveHeatmapMode
  private canvas: HTMLCanvasElement | null = null
  private frame: number | null = null

  constructor(points: HeatmapPoint[], mode: ActiveHeatmapMode) {
    super()
    this.points = points
    this.mode = mode
  }

  setData(points: HeatmapPoint[], mode: ActiveHeatmapMode) {
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

    paintHeatmap(ctx, this.points, this.mode, {
      width: size.x,
      height: size.y,
      zoom: map.getZoom(),
      centerLat: map.getCenter().lat,
      project: (point) => map.latLngToContainerPoint([point.lat, point.lng]),
    })
  }
}
