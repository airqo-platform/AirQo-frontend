import { readFile } from "node:fs/promises"
import path from "node:path"
import type { NextRequest } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Serve the reference map as its own document so its Leaflet styles and full-screen
// layout are preserved without inheriting the main application's CSS or navigation.
export async function GET(request: NextRequest) {
  const gridIds = request.nextUrl.searchParams.getAll("grid_id")
  if (gridIds.length !== 1 || !/^[A-Za-z0-9_-]{1,128}$/.test(gridIds[0])) {
    return new Response('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>AirQo Map</title><body style="font-family:Arial;text-align:center;padding:40px"><h1>Choose an AirQo grid</h1><p>Add a valid grid_id to the map URL: ?grid_id=YOUR_GRID_ID</p></body></html>', {
      status: 400, headers: { "Content-Type": "text/html; charset=utf-8" },
    })
  }
  const html = await readFile(path.join(process.cwd(), "src/embed/map.html"), "utf8")
  return new Response(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  })
}
