import { useEffect, useState, useSyncExternalStore } from "react"
import {
  getConnectionState,
  getServerConnectionState,
  onConnectionRestored,
  startNetworkMonitor,
  subscribe,
  type ConnectionState,
} from "@/lib/network-status"

export interface NetworkStatus {
  state: ConnectionState
  /** False while offline or while the server can't be reached. */
  isOnline: boolean
}

/** Current connectivity. SSR-safe: the server always renders "online". */
export function useNetworkStatus(): NetworkStatus {
  const state = useSyncExternalStore(subscribe, getConnectionState, getServerConnectionState)
  return { state, isOnline: state === "online" || state === "restored" }
}

/**
 * A number that changes each time the connection comes back after read
 * requests failed during the outage. Use it as a `key` to remount content
 * that fetches in `useEffect` and has no retry of its own.
 */
export function useConnectionRecoveryKey(): number {
  const [key, setKey] = useState(0)

  useEffect(() => {
    startNetworkMonitor()
    return onConnectionRestored(({ lostRequests }) => {
      if (lostRequests) setKey((k) => k + 1)
    })
  }, [])

  return key
}
