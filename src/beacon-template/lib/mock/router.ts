/**
 * A tiny router for the mock backend. Routes are matched on method and path; `:name` segments
 * become params. A request no route matches fails loudly with 501, naming the method and path,
 * so a missing fixture shows up as an error instead of an empty page.
 */

export interface MockRequest {
  method: string
  /** Path inside the API, without the API prefix, e.g. "/devices/stats". */
  path: string
  params: Record<string, string>
  query: URLSearchParams
  body: any
}

export type MockResult =
  | { status?: number; body: unknown; headers?: Record<string, string> }
  | Response

export type MockHandler = (request: MockRequest) => MockResult | Promise<MockResult>

interface Route {
  method: string
  segments: string[]
  handler: MockHandler
}

export class MockRouter {
  private readonly routes: Route[] = []

  constructor(private readonly name: string) {}

  private add(method: string, pattern: string, handler: MockHandler) {
    this.routes.push({ method, segments: splitPath(pattern), handler })
    return this
  }

  get(pattern: string, handler: MockHandler) { return this.add("GET", pattern, handler) }
  post(pattern: string, handler: MockHandler) { return this.add("POST", pattern, handler) }
  put(pattern: string, handler: MockHandler) { return this.add("PUT", pattern, handler) }
  patch(pattern: string, handler: MockHandler) { return this.add("PATCH", pattern, handler) }
  delete(pattern: string, handler: MockHandler) { return this.add("DELETE", pattern, handler) }

  async handle(method: string, path: string, query: URLSearchParams, body: any): Promise<Response> {
    const requested = splitPath(path)

    for (const route of this.routes) {
      if (route.method !== method) continue
      const params = matchSegments(route.segments, requested)
      if (!params) continue

      try {
        const result = await route.handler({ method, path: `/${requested.join("/")}`, params, query, body })
        if (result instanceof Response) return result
        return Response.json(result.body, { status: result.status ?? 200, headers: result.headers })
      } catch (error: any) {
        console.error(`[mock ${this.name}] ${method} ${path} failed:`, error)
        return Response.json(
          { success: false, message: `Mock ${this.name} handler failed: ${error?.message ?? error}` },
          { status: 500 },
        )
      }
    }

    const message = `Mock ${this.name} API has no handler for ${method} /${requested.join("/")}. Add one in lib/mock/.`
    console.warn(`[mock] ${message}`)
    return Response.json({ success: false, message }, { status: 501 })
  }
}

const splitPath = (path: string) => path.split("/").filter(Boolean).map(decodeURIComponent)

function matchSegments(pattern: string[], path: string[]): Record<string, string> | null {
  const params: Record<string, string> = {}
  let i = 0
  for (; i < pattern.length; i++) {
    const segment = pattern[i]
    if (segment === "*") return params
    if (i >= path.length) return null
    if (segment.startsWith(":")) params[segment.slice(1)] = path[i]
    else if (segment !== path[i]) return null
  }
  return i === path.length ? params : null
}

/** Reads paging params the way the real APIs accept them (limit/skip or page/page_size). */
export function paginate<T>(items: T[], query: URLSearchParams, defaultLimit = 50) {
  const limit = Math.max(1, Number(query.get("limit") ?? query.get("page_size") ?? defaultLimit) || defaultLimit)
  const page = Number(query.get("page"))
  const skip = Number.isFinite(page) && page > 0 ? (page - 1) * limit : Math.max(0, Number(query.get("skip")) || 0)
  return {
    items: items.slice(skip, skip + limit),
    total: items.length,
    limit,
    skip,
    page: Math.floor(skip / limit) + 1,
    totalPages: Math.max(1, Math.ceil(items.length / limit)),
  }
}
