import { useCallback, useEffect, useRef, useState } from "react";
import {
  notifyManager,
  onlineManager,
  useIsFetching,
  useQueryClient,
} from "@tanstack/react-query";
import {
  HIDDEN_RECOVERY_THRESHOLD_MS,
  backoffWithJitter,
  checkApiReachable,
  countFailedQueries,
  refetchFailedQueries,
} from "@/core/utils/queryRecoveryPolicy";

const NETWORK_RECOVERED_EVENT = "vertex-network-recovered";
const PING_RETRY_BASE_MS = 1000;
const PING_RETRY_MAX_MS = 30_000;

/**
 * - offline: the browser reports no network
 * - reconnecting: the browser reports a network and it is being confirmed
 * - unreachable: the network is up but the app can't be reached yet; still checking
 * - refreshing: the app can be reached and queries are refetching
 * - restored: the app can be reached and every refetch has settled without a failure
 * - unstable: the app can be reached but some queries still fail; waiting for Retry
 */
export type ConnectionPhase =
  | "idle"
  | "offline"
  | "reconnecting"
  | "unreachable"
  | "refreshing"
  | "restored"
  | "unstable";

const isBrowserOffline = () => typeof navigator !== "undefined" && navigator.onLine === false;

/** Drives the reconnect flow for the whole app. Mount it once, inside the query provider. */
export function useConnectionRecovery() {
  const queryClient = useQueryClient();
  const activeFetches = useIsFetching();
  const [phase, setPhaseState] = useState<ConnectionPhase>(() =>
    isBrowserOffline() ? "offline" : "idle"
  );

  const phaseRef = useRef(phase);
  const recoveryRunRef = useRef(0);
  const pingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hiddenAtRef = useRef<number | null>(null);

  const setPhase = useCallback((next: ConnectionPhase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  const cancelRecovery = useCallback(() => {
    recoveryRunRef.current += 1;
    if (pingTimerRef.current) clearTimeout(pingTimerRef.current);
    pingTimerRef.current = null;
  }, []);

  const startRecovery = useCallback(() => {
    cancelRecovery();
    const run = recoveryRunRef.current;
    setPhase("reconnecting");

    const ping = async (failures: number) => {
      const reachable = await checkApiReachable();
      if (run !== recoveryRunRef.current) return;

      if (!reachable) {
        setPhase("unreachable");
        pingTimerRef.current = setTimeout(
          () => void ping(failures + 1),
          backoffWithJitter(failures, PING_RETRY_BASE_MS, PING_RETRY_MAX_MS)
        );
        return;
      }

      window.dispatchEvent(new Event(NETWORK_RECOVERED_EVENT));
      void refetchFailedQueries(queryClient);
      setPhase("refreshing");
    };

    void ping(0);
  }, [cancelRecovery, queryClient, setPhase]);

  const clearRestored = useCallback(() => {
    if (phaseRef.current === "restored") setPhase("idle");
  }, [setPhase]);

  useEffect(() => {
    if (phase !== "refreshing" || activeFetches > 0) return;
    setPhase(countFailedQueries(queryClient) > 0 ? "unstable" : "restored");
  }, [phase, activeFetches, queryClient, setPhase]);

  useEffect(() => {
    if (phase !== "unstable") return;

    // The failures can clear without Retry, by leaving the page or a refetch elsewhere.
    return queryClient.getQueryCache().subscribe(
      notifyManager.batchCalls(() => {
        if (phaseRef.current === "unstable" && countFailedQueries(queryClient) === 0) {
          setPhase("idle");
        }
      })
    );
  }, [phase, queryClient, setPhase]);

  useEffect(() => {
    const handleOffline = () => {
      cancelRecovery();
      setPhase("offline");
    };

    const handleOnline = () => {
      if (phaseRef.current === "reconnecting" || phaseRef.current === "refreshing") return;
      startRecovery();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        hiddenAtRef.current = Date.now();
        return;
      }

      const hiddenAt = hiddenAtRef.current;
      hiddenAtRef.current = null;

      // A frozen tab can miss online and offline events, so ask the browser again.
      onlineManager.setOnline(navigator.onLine);

      if (!navigator.onLine) {
        handleOffline();
      } else if (phaseRef.current === "offline") {
        startRecovery();
      } else if (hiddenAt !== null && Date.now() - hiddenAt >= HIDDEN_RECOVERY_THRESHOLD_MS) {
        void refetchFailedQueries(queryClient);
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      cancelRecovery();
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [cancelRecovery, queryClient, setPhase, startRecovery]);

  return { phase, retry: startRecovery, clearRestored };
}
