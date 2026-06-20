'use client';

import { useEffect } from 'react';
import { useIotStore } from '@/store/useIotStore';
import { localAgent } from '@/services/iot/LocalAgentClient';

export function useLocalAgentWatcher(pingIntervalMs = 5000) {
  const setIsLocalAgentRunning = useIotStore((state) => state.setIsLocalAgentRunning);
  const setAvailablePorts = useIotStore((state) => state.setAvailablePorts);
  const isLocalAgentRunning = useIotStore((state) => state.isLocalAgentRunning);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const checkAgent = async () => {
      try {
        // Try to connect to the agent
        await localAgent.connect();
        setIsLocalAgentRunning(true);
        
        // Fetch ports
        const ports = await localAgent.listPorts();
        setAvailablePorts(ports);
      } catch (e) {
        setIsLocalAgentRunning(false);
        setAvailablePorts([]);
      }

      // Schedule next check
      timeoutId = setTimeout(checkAgent, pingIntervalMs);
    };

    // Initial check
    checkAgent();

    return () => {
      clearTimeout(timeoutId);
    };
  }, [setIsLocalAgentRunning, setAvailablePorts, pingIntervalMs]);
}
