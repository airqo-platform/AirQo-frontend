import { NextRequest, NextResponse } from "next/server"
import { beaconConfig } from "@/beacon.config"
import { handleMockRequest } from "@/lib/mock"

/**
 * The mock backend: `/api/mock/beacon/...` stands in for the Beacon API and
 * `/api/mock/platform/...` for the platform API (users, groups, preferences). lib/config.js
 * points the app at it when `api.adapter` is "mock".
 */

export const dynamic = "force-dynamic"

async function handle(request: NextRequest, { params }: { params: { path: string[] } }) {
  if (beaconConfig.api.adapter !== "mock") {
    return NextResponse.json({ success: false, message: "The mock backend is off." }, { status: 404 })
  }

  const [api, ...rest] = params.path ?? []
  let body: unknown = null
  if (request.method !== "GET" && request.method !== "HEAD") {
    const text = await request.text()
    try {
      body = text ? JSON.parse(text) : null
    } catch {
      body = text
    }
  }

  return handleMockRequest(api, request.method, rest.join("/"), request.nextUrl.searchParams, body)
}

export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE }
