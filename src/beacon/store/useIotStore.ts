import { create } from 'zustand';
import { ConnectionStatus, DeviceInfo, FlashProgress, PortInfo } from '@/types/iot';
import { DeviceAdapter } from '@/services/iot/adapters/ESPAdapter'; // Generic interface

interface IotState {
  // Agent Status
  isLocalAgentRunning: boolean;
  availablePorts: PortInfo[];

  // Connection
  status: ConnectionStatus;
  deviceInfo: DeviceInfo | null;
  adapter: DeviceAdapter | null;
  
  // Terminal
  logs: string[];
  autoScroll: boolean;
  baudRate: number;
  
  // Flashing
  flashProgress: FlashProgress | null;
  
  // Actions
  setIsLocalAgentRunning: (isRunning: boolean) => void;
  setAvailablePorts: (ports: PortInfo[]) => void;
  setStatus: (status: ConnectionStatus) => void;
  setDeviceInfo: (info: DeviceInfo | null) => void;
  setAdapter: (adapter: DeviceAdapter | null) => void;
  
  addLog: (log: string) => void;
  clearLogs: () => void;
  setAutoScroll: (auto: boolean) => void;
  setBaudRate: (baud: number) => void;
  
  setFlashProgress: (progress: FlashProgress | null) => void;
}

export const useIotStore = create<IotState>((set) => ({
  isLocalAgentRunning: false,
  availablePorts: [],
  
  status: 'disconnected',
  deviceInfo: null,
  adapter: null,
  
  logs: [],
  autoScroll: true,
  baudRate: 115200,
  
  flashProgress: null,
  
  setIsLocalAgentRunning: (isRunning) => set({ isLocalAgentRunning: isRunning }),
  setAvailablePorts: (ports) => set({ availablePorts: ports }),
  setStatus: (status) => set({ status }),
  setDeviceInfo: (deviceInfo) => set({ deviceInfo }),
  setAdapter: (adapter) => set({ adapter }),
  
  addLog: (log) => set((state) => ({ 
    logs: state.logs.length > 1000 ? [...state.logs.slice(100), log] : [...state.logs, log] 
  })),
  clearLogs: () => set({ logs: [] }),
  setAutoScroll: (autoScroll) => set({ autoScroll }),
  setBaudRate: (baudRate) => set({ baudRate }),
  
  setFlashProgress: (flashProgress) => set({ flashProgress }),
}));
