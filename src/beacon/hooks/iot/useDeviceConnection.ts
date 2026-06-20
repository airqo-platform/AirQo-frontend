import { useRef, useEffect } from 'react';
import { useIotStore } from '@/store/useIotStore';
import { ESPAdapter } from '@/services/iot/adapters/ESPAdapter';
import { ArduinoAdapter } from '@/services/iot/adapters/ArduinoAdapter';

export const useDeviceConnection = () => {
  const { setStatus, setAdapter, setDeviceInfo, addLog, adapter } = useIotStore();
  
  // Use refs for the buffer to avoid dependency cycles
  const logBuffer = useRef<string[]>([]);
  const flushInterval = useRef<NodeJS.Timeout | null>(null);

  // Setup periodic flush of log buffer
  useEffect(() => {
    flushInterval.current = setInterval(() => {
      if (logBuffer.current.length > 0) {
        // Join the buffer into one chunk and send to store
        const chunk = logBuffer.current.join('');
        logBuffer.current = [];
        addLog(chunk);
      }
    }, 50); // 50ms = 20 fps updates for terminal
    
    return () => {
      if (flushInterval.current) clearInterval(flushInterval.current);
    };
  }, [addLog]);

  const handleIncomingLog = (data: string) => {
    logBuffer.current.push(data);
  };

  const connectESP = async () => {
    try {
      setStatus('connecting');
      const newAdapter = new ESPAdapter();
      await newAdapter.connect();
      
      const info = await newAdapter.getInfo();
      
      setAdapter(newAdapter);
      setDeviceInfo(info);
      setStatus('connected');
      
      newAdapter.readLogs(handleIncomingLog);
      
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const connectArduino = async (portName: string) => {
    try {
      setStatus('connecting');
      const newAdapter = new ArduinoAdapter(portName);
      await newAdapter.connect();
      
      const info = await newAdapter.getInfo();
      
      setAdapter(newAdapter);
      setDeviceInfo(info);
      setStatus('connected');
      
      newAdapter.readLogs(handleIncomingLog);
      
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  const disconnect = async () => {
    if (adapter) {
      await adapter.disconnect();
      setAdapter(null);
      setDeviceInfo(null);
      setStatus('disconnected');
      
      // Flush any remaining logs
      if (logBuffer.current.length > 0) {
        addLog(logBuffer.current.join(''));
        logBuffer.current = [];
      }
    }
  };

  return { connectESP, connectArduino, disconnect };
};
