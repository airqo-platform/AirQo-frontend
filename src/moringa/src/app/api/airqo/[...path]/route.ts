import type { NextRequest } from "next/server"

type RouteContext = {
  params: Promise<{ path: string[] }>
}

const ALLOWED_ROUTES = [
  { method: "GET", pattern: /^devices\/readings\/map$/ },
  { method: "GET", pattern: /^devices\/grids\/summary$/ },
  { method: "GET", pattern: /^devices\/measurements\/sites\/[A-Za-z0-9_-]+\/historical$/ },
  { method: "POST", pattern: /^analytics\/data-download$/ },
  { method: "GET", pattern: /^predict\/daily-forecasting$/ },
  { method: "GET", pattern: /^predict\/hourly-forecasting$/ },
  { method: "GET", pattern: /^spatial\/categorize_site$/ },
  { method: "GET", pattern: /^spatial\/active_fires\/africa$/ },
  { method: "GET", pattern: /^spatial\/heatmaps$/ },
  { method: "GET", pattern: /^spatial\/source_metadata$/ },
  { method: "POST", pattern: /^spatial\/air_quality_report$/ },
  { method: "POST", pattern: /^spatial\/satellite_prediction$/ },
  { method: "POST", pattern: /^spatial\/site_location$/ },
]

const AIRQO_API_URL = "https://platform.airqo.net/api/v2/"

function isAllowed(method: string, path: string) {
  return ALLOWED_ROUTES.some((route) => route.method === method && route.pattern.test(path))
}

async function proxyRequest(request: NextRequest, context: RouteContext) {
  const token = process.env.API_TOKEN

  if (!token) {
    return Response.json({ message: "AirQo API token is missing." }, { status: 500 })
  }

  const { path: segments } = await context.params
  const path = segments.map(decodeURIComponent).join("/")

  if (!isAllowed(request.method, path)) {
    return Response.json({ message: "This AirQo API route is not allowed." }, { status: 404 })
  }

  const upstreamUrl = new URL(path, AIRQO_API_URL)
  request.nextUrl.searchParams.forEach((value, key) => {
    if (key !== "token" && key !== "access_token") upstreamUrl.searchParams.append(key, value)
  })
  upstreamUrl.searchParams.set("token", token)
  upstreamUrl.searchParams.set("access_token", token)

  const headers = new Headers({ Accept: request.headers.get("accept") || "application/json" })
  const contentType = request.headers.get("content-type")
  if (contentType) headers.set("Content-Type", contentType)

  try {
    let requestBody: ArrayBuffer | undefined
    if (request.method !== "GET" && request.method !== "HEAD") {
      requestBody = await request.arrayBuffer()
    }

    const fetchUpstream = () =>
      fetch(upstreamUrl, {
        method: request.method,
        headers,
        body: requestBody,
        cache: "no-store",
      })

    const upstreamResponse = await fetchUpstream()

    const responseHeaders = new Headers()
    const upstreamContentType = upstreamResponse.headers.get("content-type")
    if (upstreamContentType) responseHeaders.set("Content-Type", upstreamContentType)
    responseHeaders.set("Cache-Control", "no-store, max-age=0")

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error("AirQo API proxy request failed:", error)
    return Response.json({ message: "Unable to reach the AirQo API." }, { status: 502 })
  }
}

export const dynamic = "force-dynamic"

export const GET = proxyRequest
export const POST = proxyRequest
