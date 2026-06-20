import { DeviceAdapter, DeviceInfo, FlashProgress } from '@/types/iot';

export class ESPAdapter implements DeviceAdapter {
  private port: SerialPort | null = null;
  private reader: ReadableStreamDefaultReader | null = null;
  private writer: WritableStreamDefaultWriter | null = null;
  private logCallback: ((data: string) => void) | null = null;
  private isReading = false;

  async connect(): Promise<void> {
    if (!('serial' in navigator)) {
      throw new Error('Web Serial API is not supported in this browser.');
    }

    try {
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate: 115200 });
      
      // Start reading loop
      this.startReading();
    } catch (error) {
      console.error('Failed to connect to ESP', error);
      throw error;
    }
  }

  private async startReading() {
    if (!this.port || !this.port.readable) return;
    
    this.isReading = true;
    const decoder = new TextDecoderStream();
    const readableStreamClosed = this.port.readable.pipeTo(decoder.writable);
    this.reader = decoder.readable.getReader();

    try {
      while (this.isReading) {
        const { value, done } = await this.reader.read();
        if (done) break;
        if (value && this.logCallback) {
          this.logCallback(value);
        }
      }
    } catch (error) {
      console.error('Error reading from serial port', error);
    } finally {
      this.reader.releaseLock();
    }
  }

  async disconnect(): Promise<void> {
    this.isReading = false;
    
    if (this.reader) {
      await this.reader.cancel();
      this.reader = null;
    }

    if (this.writer) {
      await this.writer.close();
      this.writer = null;
    }

    if (this.port) {
      await this.port.close();
      this.port = null;
    }
  }

  async flash(firmwareData: string | Uint8Array, onProgress?: (progress: FlashProgress) => void): Promise<void> {
    // 1. Pause reading
    this.isReading = false;
    if (this.reader) {
      await this.reader.cancel();
      this.reader = null;
    }

    if (onProgress) {
      onProgress({ phase: 'preparing', percentage: 0 });
    }

    try {
      // 2. Here we would instantiate esptool-js and pass `this.port`
      // For example:
      // const esptool = new ESPLoader(this.port, { ... });
      // await esptool.main_fn();
      // await esptool.flash_id();
      // await esptool.write_flash({ fileArray: [{ data: firmwareData, address: 0x10000 }] });
      
      // Simulating flash for now
      if (onProgress) onProgress({ phase: 'writing', percentage: 50 });
      await new Promise(r => setTimeout(r, 2000));
      if (onProgress) onProgress({ phase: 'completed', percentage: 100 });
      
    } catch (error) {
      console.error('Flashing failed', error);
      if (onProgress) onProgress({ phase: 'error', percentage: 0, message: (error as Error).message });
      throw error;
    } finally {
      // 3. Resume reading
      this.startReading();
    }
  }

  readLogs(callback: (data: string) => void): void {
    this.logCallback = callback;
  }

  async write(data: string | Uint8Array): Promise<void> {
    if (!this.port || !this.port.writable) throw new Error('Port not writable');
    
    const encoder = new TextEncoderStream();
    const writableStreamClosed = encoder.readable.pipeTo(this.port.writable);
    this.writer = encoder.writable.getWriter();
    
    try {
      await this.writer.write(typeof data === 'string' ? data : new TextDecoder().decode(data));
    } finally {
      this.writer.releaseLock();
    }
  }

  async reboot(): Promise<void> {
    if (!this.port) return;
    
    // Pulse DTR/RTS to reset ESP32/ESP8266
    await this.port.setSignals({ dataTerminalReady: false, requestToSend: true });
    await new Promise(resolve => setTimeout(resolve, 100));
    await this.port.setSignals({ dataTerminalReady: true, requestToSend: false });
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  async getInfo(): Promise<DeviceInfo> {
    return {
      chipType: 'ESP32', // In reality, we'd query esptool.read_mac() or similar
      portName: 'Web Serial Port'
    };
  }
}
