export interface DeviceInfo {
  chipType: 'ESP32' | 'ESP8266' | 'Arduino' | 'Unknown';
  macAddress?: string;
  firmwareVersion?: string;
  vid?: number;
  pid?: number;
  portName?: string;
}

export interface PortInfo {
  path: string;
  manufacturer?: string;
  vendorId?: string;
  productId?: string;
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';
export type FlashingPhase = 'idle' | 'preparing' | 'erasing' | 'writing' | 'verifying' | 'completed' | 'error';

export interface FlashProgress {
  phase: FlashingPhase;
  percentage: number;
  message?: string;
}

export interface DeviceAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  flash(firmwareUrl: string, onProgress?: (progress: FlashProgress) => void): Promise<void>;
  readLogs(callback: (data: string) => void): void;
  write(data: string | Uint8Array): Promise<void>;
  reboot(): Promise<void>;
  getInfo(): Promise<DeviceInfo>;
}
