import { useCollaborationStore, CommandLog } from '../../../store/useCollaborationStore';

export class TelemetryManager {
  private hostLogBuffer = '';

  processIncomingData(
    data: string,
    onTelemetryParsed?: (telemetry: Record<string, any>) => void
  ): { logs: string[]; telemetryList: Record<string, any>[] } {
    this.hostLogBuffer += data;
    const lines = this.hostLogBuffer.split(/\r?\n/);
    
    // Save the last incomplete line back to the buffer
    this.hostLogBuffer = lines.pop() || '';

    const logs: string[] = [];
    const telemetryList: Record<string, any>[] = [];

    const store = useCollaborationStore.getState();

    for (const line of lines) {
      if (!line.trim()) continue;

      try {
        const parsed = JSON.parse(line);
        // If it looks like structured telemetry
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          telemetryList.push(parsed);
          store.updateLiveTelemetry(parsed);
          if (onTelemetryParsed) {
            onTelemetryParsed(parsed);
          }
        } else {
          logs.push(line + '\r\n');
          store.addLog(line + '\r\n');
        }
      } catch (e) {
        // Fallback: raw line log
        logs.push(line + '\r\n');
        store.addLog(line + '\r\n');
      }
    }

    return { logs, telemetryList };
  }

  logCommand(cmdText: string, senderName: string, status: 'pending' | 'success' | 'failed' = 'pending'): string {
    const id = Math.random().toString(36).substring(2, 11);
    const store = useCollaborationStore.getState();
    const newCommand: CommandLog = {
      id,
      command: cmdText,
      sender: senderName,
      timestamp: Date.now(),
      status
    };
    store.addRecentCommand(newCommand);
    return id;
  }
}

export const telemetryManager = new TelemetryManager();
