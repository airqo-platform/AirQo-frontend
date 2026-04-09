"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { MaintenanceMapItem } from "@/types/api.types"
import { config } from "@/lib/config"
import authService from "@/services/api-service"

interface StreamState {
    /** Accumulated devices from the stream */
    devices: MaintenanceMapItem[]
    /** Whether the stream is currently active */
    isStreaming: boolean
    /** Number of devices received so far */
    deviceCount: number
    /** Total devices (available after "done" event) */
    total: number | null
    /** Error message if the stream or fallback failed */
    error: string | null
    /** True if we fell back to the REST endpoint */
    isFallback: boolean
}

/**
 * Parse an SSE text chunk into individual events.
 * Each event is delimited by a blank line (\n\n).
 * Returns parsed events and any leftover partial text.
 */
function parseSSEChunk(buffer: string): { events: Array<{ event: string; data: string }>; remaining: string } {
    const events: Array<{ event: string; data: string }> = []
    // Normalize CRLF to LF so both line-ending styles are handled
    const normalized = buffer.replace(/\r\n/g, "\n")
    const blocks = normalized.split("\n\n")

    // The last block might be incomplete — keep it as remaining
    const remaining = blocks.pop() || ""

    for (const block of blocks) {
        if (!block.trim()) continue

        let eventType = "message"
        let dataLines: string[] = []

        for (const line of block.split("\n")) {
            if (line.startsWith("event:")) {
                eventType = line.slice(6).trim()
            } else if (line.startsWith("data:")) {
                dataLines.push(line.slice(5).trim())
            }
        }

        if (dataLines.length > 0) {
            events.push({ event: eventType, data: dataLines.join("\n") })
        }
    }

    return { events, remaining }
}

/**
 * Build the SSE stream URL for the maintenance map view.
 * Mirrors the pattern from ApiService.getEndpoint() + buildQueryString().
 */
function buildStreamUrl(days: number, tags?: string): string {
    const apiPrefix = config.apiPrefix || ""
    const base = config.apiUrl

    let path: string
    if (config.isLocalhost) {
        path = "/maintenance/map-view/stream"
    } else {
        path = `${apiPrefix}/beacon/maintenance/map-view/stream`
    }

    const params = new URLSearchParams()
    params.set("days", String(days))
    if (tags) params.set("tags", tags)

    return `${base}${path}?${params.toString()}`
}

/**
 * Build the REST fallback URL (existing /map-view endpoint).
 */
function buildFallbackUrl(days: number, tags?: string): string {
    const apiPrefix = config.apiPrefix || ""
    const base = config.apiUrl

    let path: string
    if (config.isLocalhost) {
        path = `/maintenance/map-view`
    } else {
        path = `${apiPrefix}/beacon/maintenance/map-view`
    }

    const params = new URLSearchParams()
    params.set("days", String(days))
    if (tags) params.set("tags", tags)

    return `${base}${path}?${params.toString()}`
}

/**
 * Custom hook for streaming maintenance map data via SSE.
 *
 * Opens a `fetch()` to the SSE endpoint with the JWT in the
 * Authorization header, parses the text stream, and accumulates
 * `MaintenanceMapItem[]` progressively.
 *
 * Falls back to the existing REST endpoint if the stream fails.
 */
export function useMaintenanceMapStream(days: number = 14, tags?: string): StreamState {
    const [devices, setDevices] = useState<MaintenanceMapItem[]>([])
    const [isStreaming, setIsStreaming] = useState(false)
    const [deviceCount, setDeviceCount] = useState(0)
    const [total, setTotal] = useState<number | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isFallback, setIsFallback] = useState(false)

    // Ref to track the abort controller so cleanup can cancel in-flight requests
    const abortRef = useRef<AbortController | null>(null)
    // Track a mutable device map for cohort_update merges
    const deviceMapRef = useRef<Map<string, MaintenanceMapItem>>(new Map())

    const startStream = useCallback(async (signal: AbortSignal) => {
        const token = authService.getToken()
        const url = buildStreamUrl(days, tags)

        const headers: Record<string, string> = {}
        if (token) headers["Authorization"] = token

        const response = await fetch(url, { headers, signal })

        if (!response.ok) {
            throw new Error(`SSE stream returned ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error("ReadableStream not supported")

        const decoder = new TextDecoder()
        let buffer = ""

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const { events, remaining } = parseSSEChunk(buffer)
            buffer = remaining

            for (const evt of events) {
                let payload: any
                try {
                    payload = JSON.parse(evt.data)
                } catch {
                    console.warn("SSE: unparseable data", evt.data)
                    continue
                }

                switch (evt.event) {
                    case "device": {
                        const item: MaintenanceMapItem = {
                            device_id: payload.device_id ?? "",
                            device_name: payload.device_name ?? "",
                            latitude: payload.latitude,
                            longitude: payload.longitude,
                            last_active: payload.last_active ?? null,
                            uptime: payload.uptime ?? 0,
                            data_completeness: payload.data_completeness ?? 0,
                            error_margin: payload.error_margin ?? 0,
                            cohorts: payload.cohorts ?? [],
                        }
                        const key = item.device_id || item.device_name
                        deviceMapRef.current.set(key, item)
                        // Batch state updates — spread into a new array from the map
                        setDevices(Array.from(deviceMapRef.current.values()))
                        setDeviceCount(deviceMapRef.current.size)
                        break
                    }
                    case "cohort_update": {
                        const lookupKey = payload.device_id || payload.device_name
                        const existing = deviceMapRef.current.get(lookupKey)
                        if (existing && payload.cohort) {
                            existing.cohorts = [...existing.cohorts, payload.cohort]
                            deviceMapRef.current.set(lookupKey, { ...existing })
                            setDevices(Array.from(deviceMapRef.current.values()))
                        }
                        break
                    }
                    case "done": {
                        if (payload.total !== undefined) setTotal(payload.total)
                        break
                    }
                    case "error": {
                        setError(payload.message || "Stream error")
                        break
                    }
                }
            }
        }
    }, [days, tags])

    const fallbackToRest = useCallback(async (signal: AbortSignal) => {
        const token = authService.getToken()
        const url = buildFallbackUrl(days, tags)

        const headers: Record<string, string> = {}
        if (token) headers["Authorization"] = token

        const response = await fetch(url, { headers, signal })
        if (!response.ok) throw new Error(`REST fallback returned ${response.status}`)

        const json = await response.json()
        const items: MaintenanceMapItem[] = json.data ?? json ?? []

        setIsFallback(true)
        setDevices(items)
        setDeviceCount(items.length)
        setTotal(items.length)
    }, [days, tags])

    useEffect(() => {
        // Reset state on param change
        setDevices([])
        setDeviceCount(0)
        setTotal(null)
        setError(null)
        setIsFallback(false)
        setIsStreaming(true)
        deviceMapRef.current = new Map()

        const controller = new AbortController()
        abortRef.current = controller

            ; (async () => {
                try {
                    await startStream(controller.signal)
                } catch (err: any) {
                    // If aborted, don't fallback
                    if (controller.signal.aborted) return

                    console.warn("SSE stream failed, falling back to REST:", err.message)
                    try {
                        await fallbackToRest(controller.signal)
                    } catch (fallbackErr: any) {
                        if (!controller.signal.aborted) {
                            setError(fallbackErr.message || "Failed to load map data")
                        }
                    }
                } finally {
                    if (!controller.signal.aborted) {
                        setIsStreaming(false)
                    }
                }
            })()

        return () => {
            controller.abort()
            abortRef.current = null
        }
    }, [startStream, fallbackToRest])

    return { devices, isStreaming, deviceCount, total, error, isFallback }
}
