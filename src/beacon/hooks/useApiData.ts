import { useState, useEffect, useCallback, useRef } from 'react'

interface UseApiDataOptions {
  enabled?: boolean
  refetchInterval?: number
  onSuccess?: (data: any) => void
  onError?: (error: Error) => void
  retryCount?: number
  retryDelay?: number
}

interface UseApiDataReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  isRefetching: boolean
}

export function useApiData<T>(
  fetcher: () => Promise<T>,
  dependencies: any[] = [],
  options: UseApiDataOptions = {}
): UseApiDataReturn<T> {
  const {
    enabled = true,
    refetchInterval,
    onSuccess,
    onError,
    retryCount = 3,
    retryDelay = 1000
  } = options

  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isRefetching, setIsRefetching] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()
  const retriesRef = useRef(0)
  const isMountedRef = useRef(true)

  const fetchData = useCallback(async (isRefetch = false) => {
    if (!enabled) return

    try {
      if (isRefetch) {
        setIsRefetching(true)
      } else {
        setLoading(true)
      }
      setError(null)
      
      const result = await fetcher()
      
      if (isMountedRef.current) {
        setData(result)
        retriesRef.current = 0
        
        if (onSuccess) {
          onSuccess(result)
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred')
      
      if (isMountedRef.current) {
        // Retry logic
        if (retriesRef.current < retryCount) {
          retriesRef.current++
          console.log(`Retrying... Attempt ${retriesRef.current} of ${retryCount}`)
          
          setTimeout(() => {
            if (isMountedRef.current) {
              fetchData(isRefetch)
            }
          }, retryDelay * retriesRef.current)
          
          return
        }
        
        setError(error)
        retriesRef.current = 0
        
        if (onError) {
          onError(error)
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
        setIsRefetching(false)
      }
    }
  }, [enabled, fetcher, onSuccess, onError, retryCount, retryDelay])

  const refetch = useCallback(async () => {
    await fetchData(true)
  }, [fetchData])

  useEffect(() => {
    isMountedRef.current = true
    
    if (enabled) {
      fetchData(false)
    }

    // Set up refetch interval if specified
    if (refetchInterval && refetchInterval > 0) {
      intervalRef.current = setInterval(() => {
        fetchData(true)
      }, refetchInterval)
    }

    return () => {
      isMountedRef.current = false
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [...dependencies, enabled])

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