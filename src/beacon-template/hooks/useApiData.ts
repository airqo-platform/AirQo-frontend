import { useState, useEffect, useCallback, useRef } from 'react'
import { onConnectionRestored, startNetworkMonitor } from '@/lib/network-status'
import { backoffDelay, isTransientError } from '@/lib/retry'

interface UseApiDataOptions {
  enabled?: boolean
  refetchInterval?: number
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  /** Retries for transient failures (no response, timeout, 502-504). 4xx errors are never retried. */
  retryCount?: number
  /** Base delay for exponential backoff with jitter. */
  retryDelay?: number
  /** Refetch when the connection comes back, if the last attempt failed or data is stale. */
  refetchOnReconnect?: boolean
  /** Refetch when the tab becomes visible again, if the last attempt failed or data is stale. */
  refetchOnVisible?: boolean
  /** Age after which data counts as stale for reconnect/visibility refetches. */
  staleTime?: number
}

interface UseApiDataReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  isRefetching: boolean
}

type FetchMode = 'load' | 'refetch'

export function useApiData<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = [],
  options: UseApiDataOptions = {}
): UseApiDataReturn<T> {
  const {
    enabled = true,
    refetchInterval,
    retryCount = 3,
    retryDelay = 1000,
    refetchOnReconnect = true,
    refetchOnVisible = true,
    staleTime = 5 * 60 * 1000,
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isRefetching, setIsRefetching] = useState(false)

  const isMountedRef = useRef(true)
  // Incremented per request so responses from superseded requests are ignored
  const requestIdRef = useRef(0)
  const inFlightRef = useRef(false)
  // Pending retry wait; cancelling it resolves the wait so superseded calls to refetch() still settle
  const retryWaitRef = useRef<{ timer: ReturnType<typeof setTimeout>; resolve: () => void }>()
  const lastErrorRef = useRef<Error | null>(null)
  const lastSuccessAtRef = useRef(0)

  // Keep the latest callbacks without re-creating the fetch function every render
  const fetcherRef = useRef(fetcher)
  const onSuccessRef = useRef(options.onSuccess)
  const onErrorRef = useRef(options.onError)
  fetcherRef.current = fetcher
  onSuccessRef.current = options.onSuccess
  onErrorRef.current = options.onError

  const cancelRetryWait = useCallback(() => {
    const wait = retryWaitRef.current
    retryWaitRef.current = undefined
    if (wait) {
      clearTimeout(wait.timer)
      wait.resolve()
    }
  }, [])

  const fetchData = useCallback(async (mode: FetchMode) => {
    if (!enabled) return

    cancelRetryWait()
    const requestId = ++requestIdRef.current
    const isCurrent = () => isMountedRef.current && requestId === requestIdRef.current

    inFlightRef.current = true
    if (mode === 'refetch') {
      setIsRefetching(true)
    } else {
      setLoading(true)
    }

    const finish = () => {
      inFlightRef.current = false
      setLoading(false)
      setIsRefetching(false)
    }

    const attempt = async (retry: number): Promise<void> => {
      try {
        const result = await fetcherRef.current()
        if (!isCurrent()) return

        lastErrorRef.current = null
        lastSuccessAtRef.current = Date.now()
        setData(result)
        setError(null)
        finish()
        onSuccessRef.current?.(result)
      } catch (err) {
        if (!isCurrent()) return
        const failure = err instanceof Error ? err : new Error('Unknown error occurred')

        // Retrying while offline only burns attempts; the reconnect listener picks it up instead
        const offline = typeof navigator !== 'undefined' && navigator.onLine === false
        if (retry < retryCount && !offline && isTransientError(failure)) {
          await new Promise<void>((resolve) => {
            const timer = setTimeout(() => {
              retryWaitRef.current = undefined
              resolve()
            }, backoffDelay(retry, retryDelay))
            retryWaitRef.current = { timer, resolve }
          })
          if (isCurrent()) await attempt(retry + 1)
          return
        }

        // Keep previously loaded data on screen; callers decide how to show the error
        lastErrorRef.current = failure
        setError(failure)
        finish()
        onErrorRef.current?.(failure)
      }
    }

    await attempt(0)
  }, [enabled, retryCount, retryDelay, cancelRetryWait])

  const refetch = useCallback(async () => {
    await fetchData('refetch')
  }, [fetchData])

  useEffect(() => {
    isMountedRef.current = true

    if (enabled) {
      fetchData('load')
    }

    let interval: ReturnType<typeof setInterval> | undefined
    if (enabled && refetchInterval && refetchInterval > 0) {
      interval = setInterval(() => {
        fetchData('refetch')
      }, refetchInterval)
    }

    return () => {
      isMountedRef.current = false
      cancelRetryWait()
      if (interval) clearInterval(interval)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, enabled])

  // Recover from failures (and refresh stale data) when the connection returns or the tab is shown again
  useEffect(() => {
    if (!enabled || (!refetchOnReconnect && !refetchOnVisible)) return

    const refetchIfNeeded = () => {
      if (inFlightRef.current) return
      const stale = Date.now() - lastSuccessAtRef.current > staleTime
      if (lastErrorRef.current || stale) fetchData('refetch')
    }

    startNetworkMonitor()
    const unsubscribe = refetchOnReconnect ? onConnectionRestored(refetchIfNeeded) : undefined

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible' || navigator.onLine === false) return
      refetchIfNeeded()
    }
    if (refetchOnVisible) document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      unsubscribe?.()
      if (refetchOnVisible) document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [enabled, refetchOnReconnect, refetchOnVisible, staleTime, fetchData])

  return {
    data,
    loading,
    error,
    refetch,
    isRefetching
  }
}

// Specialized hook for device stats
export function useDeviceStats(options?: UseApiDataOptions) {
  const { getDeviceStatsForUI } = require('@/services/device-api.service')

  return useApiData(
    () => getDeviceStatsForUI(),
    [],
    options
  )
}

// Specialized hook for device list
export function useDeviceList(params?: any, options?: UseApiDataOptions) {
  const { getDevicesForUI } = require('@/services/device-api.service')

  return useApiData(
    () => getDevicesForUI(params),
    [JSON.stringify(params)],
    options
  )
}
