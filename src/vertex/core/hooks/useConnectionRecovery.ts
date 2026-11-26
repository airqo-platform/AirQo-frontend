import { useCallback, useEffect, useRef, useState } from "react";
import { notifyManager, onlineManager, useQueryClient, type Query } from "@tanstack/react-query";
import {
  HIDDEN_RECOVERY_THRESHOLD_MS,
  backoffWithJitter,
  checkApiReachable,
  countFailedQueries,
  findFailedQueries,
  isRepaired,
  isSettled,
  refetchAfterReconnect,
} from "@/core/utils/queryRecoveryPolicy";

const NETWORK_RECOVERED_EVENT = "vertex-network-recovered";
const PING_RETRY_BASE_MS = 1000;
const PING_RETRY_MAX_MS = 30_000;

/**
 * - offline: the browser reports no network
 * - reconnecting: the browser reports a network and it is being confirmed
 * - unreachable: the network is up but the app can't be reached yet; still checking
 * - refreshing: the app can be reached and the queries this recovery started haven't all finished,
 *   counting retries paused while the tab is hidden
 * - restored: every one of those queries has finished and none failed
 * - unstable: the app can be reached but some queries still fail; waiting for Retry, or for each
 *   failed query to succeed or leave the screen
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
  const [phase, setPhaseState] = useState<ConnectionPhase>(() =>
    isBrowserOffline() ? "offline" : "idle"
  );

  const phaseRef = useRef(phase);
  const recoveryRunRef = useRef(0);
  const pingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stopWatchingRef = useRef<(() => void) | null>(null);
  const hiddenAtRef = useRef<number | null>(null);

  const setPhase = useCallback((next: ConnectionPhase) => {
    phaseRef.current = next;
    setPhaseState(next);
  }, []);

  const stopWatching = useCallback(() => {
    stopWatchingRef.current?.();
    stopWatchingRef.current = null;
  }, []);

  /** Runs `check` now and after every query cache change, until `stopWatching`. */
  const watchQueries = useCallback(
    (check: () => void) => {
      stopWatching();
      stopWatchingRef.current = queryClient.getQueryCache().subscribe(notifyManager.batchCalls(check));
      check();
    },
    [queryClient, stopWatching]
  );

  const cancelRecovery = useCallback(() => {
    recoveryRunRef.current += 1;
    if (pingTimerRef.current) clearTimeout(pingTimerRef.current);
    pingTimerRef.current = null;
    stopWatching();
  }, [stopWatching]);

  const enterUnstable = useCallback(
    (failed: Query[]) => {
      setPhase("unstable");
      // A replacement request for a failed query can fail again, so only a settled success, or the
      // query leaving the screen, clears the Retry banner.
      watchQueries(() => {
        if (phaseRef.current !== "unstable") return;
        if (!failed.every(isRepaired) || countFailedQueries(queryClient) > 0) return;
        stopWatching();
        setPhase("idle");
      });
    },
    [queryClient, setPhase, stopWatching, watchQueries]
  );

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
      const refreshing = refetchAfterReconnect(queryClient);
      setPhase("refreshing");

      watchQueries(() => {
        if (run !== recoveryRunRef.current || phaseRef.current !== "refreshing") return;
        if (!refreshing.every(isSettled)) return;
        stopWatching();
        const failed = findFailedQueries(queryClient);
        if (failed.length > 0) enterUnstable(failed);
        else setPhase("restored");
      });
    };

    void ping(0);
  }, [cancelRecovery, enterUnstable, queryClient, setPhase, stopWatching, watchQueries]);

  const clearRestored = useCallback(() => {
    if (phaseRef.current === "restored") setPhase("idle");
  }, [setPhase]);

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
        return;
      }

      const current = phaseRef.current;
      if (current === "reconnecting" || current === "refreshing") return;

      // After sleep the network can report up before it works, so a long absence with failed queries
      // goes through the same reachability check and banner as a reconnect. A background tab's
      // timers are throttled, so an unreachable check runs again now instead of waiting.
      const awayLong = hiddenAt !== null && Date.now() - hiddenAt >= HIDDEN_RECOVERY_THRESHOLD_MS;
      if (
        current === "offline" ||
        current === "unreachable" ||
        (awayLong && countFailedQueries(queryClient) > 0)
      ) {
        startRecovery();
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
