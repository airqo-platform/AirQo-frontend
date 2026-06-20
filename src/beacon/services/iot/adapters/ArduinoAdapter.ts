import { DeviceAdapter, DeviceInfo, FlashProgress } from '@/types/iot';
import { localAgent } from '../LocalAgentClient';

export class ArduinoAdapter implements DeviceAdapter {
  private portName: string;
  private logListener: ((data: any) => void) | null = null;
  private userLogCallback: ((data: string) => void) | null = null;

  constructor(portName: string) {
    this.portName = portName;
  }

  async connect(): Promise<void> {
    await localAgent.connect();
    
    // Request agent to open serial port
    await localAgent.request({
      type: 'connect_port',
      port: this.portName,
      baudRate: 115200 // default or configurable
    }, 'port_connected');

    // Setup global log listener for this port
    this.logListener = localAgent.onMessage((msg) => {
      if (msg.type === 'serial_data' && msg.port === this.portName) {
        if (this.userLogCallback) {
          this.userLogCallback(msg.data);
        }
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.logListener) {
      this.logListener(); // unsubscribe
      this.logListener = null;
    }
    
    await localAgent.request({
      type: 'disconnect_port',
      port: this.portName
    }, 'port_disconnected');
  }

  async flash(firmwareUrl: string, onProgress?: (progress: FlashProgress) => void): Promise<void> {
    if (onProgress) {
      onProgress({ phase: 'preparing', percentage: 0 });
    }

    const flashListener = localAgent.onMessage((msg) => {
      if (msg.type === 'flash_progress' && onProgress) {
        onProgress(msg.progress);
      }
    });

    try {
      await localAgent.request({
        type: 'flash_hex',
        port: this.portName,
        board: 'mega', // Defaulting to mega for current user hardware
        firmwareUrl: firmwareUrl
      }, 'flash_completed', 120000); // 2 minute timeout for flashing
    } finally {
      flashListener(); // unsubscribe
    }
  }

  readLogs(callback: (data: string) => void): void {
    this.userLogCallback = callback;
  }

  async write(data: string | Uint8Array): Promise<void> {
    // Convert Uint8Array to string for WebSocket transmission if needed, or send as binary array
    const payload = typeof data === 'string' ? data : Array.from(data);
    
    localAgent.send({
      type: 'write_serial',
      port: this.portName,
      data: payload
    });
  }

  async reboot(): Promise<void> {
    await localAgent.request({
      type: 'reboot_device',
      port: this.portName
    }, 'device_rebooted');
  }

  async getInfo(): Promise<DeviceInfo> {
    const res = await localAgent.request({
      type: 'get_device_info',
      port: this.portName
    }, 'device_info');
    
    return {
      chipType: 'Arduino',
      portName: this.portName,
      ...res.info
    };
  }
}
