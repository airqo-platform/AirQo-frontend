// Cheap reachability check used by the client network monitor (lib/network-status.ts).
// Unlike /health, it doesn't call the backend, so it answers as fast as the server can.

export const dynamic = "force-dynamic"

const headers = { "Cache-Control": "no-store" }

export function GET() {
  return new Response(null, { status: 204, headers })
}

export function HEAD() {
  return new Response(null, { status: 204, headers })
}
