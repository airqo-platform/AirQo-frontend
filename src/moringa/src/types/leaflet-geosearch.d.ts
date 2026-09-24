declare module "leaflet-geosearch" {
  import { Control } from "leaflet"

  export interface SearchControlOptions {
    provider: any
    style?: "bar" | "button"
    autoComplete?: boolean
    autoCompleteDelay?: number
    position?: "topleft" | "topright" | "bottomleft" | "bottomright"
  }

  export class GeoSearchControl extends Control {
    constructor(options: SearchControlOptions)
  }

  export interface SearchResult {
    label: string
    x: number
    y: number
  }

  export class OpenStreetMapProvider {
    constructor(options?: any)
    search(options: { query: string }): Promise<SearchResult[]>
  }
}
