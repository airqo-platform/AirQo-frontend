import { beaconApi } from "./beacon-api"
import { platformApi } from "./platform-api"

/**
 * Entry point for the mock backend. `api` is "beacon" or "platform"; `path` is what follows,
 * including the API's own version prefix, which is stripped here:
 *
 *   beacon:   api/v1/devices/stats, api/v1/beacon/devices/stats  →  /devices/stats
 *   platform: api/v2/users/{id}                                   →  /users/{id}
 */
export async function handleMockRequest(
  api: string | undefined,
  method: string,
  path: string,
  query: URLSearchParams,
  body: unknown,
): Promise<Response> {
  if (api === "beacon") {
    const inner = path.replace(/^api\/v\d+\/(beacon\/)?/, "").replace(/^v\d+\//, "")
    return beaconApi.handle(method, inner, query, body)
  }

  if (api === "platform") {
    const inner = path.replace(/^api\/v\d+\//, "").replace(/^v\d+\//, "")
    return platformApi.handle(method, inner, query, body)
  }

  return Response.json({ success: false, message: `Unknown mock API "${api}"` }, { status: 404 })
}
