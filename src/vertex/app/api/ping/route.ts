// Cheap reachability check used by connection recovery (core/utils/queryRecoveryPolicy.ts).
// It doesn't call the backend, so it answers as fast as this server can.

export const dynamic = "force-dynamic";

const headers = { "Cache-Control": "no-store" };

export function GET() {
  return new Response(null, { status: 204, headers });
}

export function HEAD() {
  return new Response(null, { status: 204, headers });
}
