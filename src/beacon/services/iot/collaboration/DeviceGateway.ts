import { useIotStore } from '../../../store/useIotStore';
import { useCollaborationStore } from '../../../store/useCollaborationStore';
import { telemetryManager } from './TelemetryManager';
import { permissionManager } from './PermissionManager';
import { peerManager } from './PeerManager';
import { DeviceAdapter } from '@/types/iot';

export class DeviceGateway {
  private activeAdapter: DeviceAdapter | null = null;
  private logBuffer: string[] = [];
  private logFlushInterval: NodeJS.Timeout | null = null;

  // --- HOST FUNCTIONS ---

  async connectDevice(adapter: DeviceAdapter): Promise<void> {
    this.activeAdapter = adapter;
    
    useCollaborationStore.getState().setDeviceStatus('connected');
    
    // Broadcast device status update to peers
    peerManager.broadcast({
      type: 'deviceConnected'
    });

    // Start reading logs from device
    adapter.readLogs((data) => {
      this.handleIncomingDeviceLogs(data);
    });

    // Start periodic log flush to screen & peers
    if (typeof window !== 'undefined') {
      this.logFlushInterval = setInterval(() => this.flushLogs(), 100);
    }
  }

  async disconnectDevice(): Promise<void> {
    if (this.logFlushInterval) {
      clearInterval(this.logFlushInterval);
      this.logFlushInterval = null;
    }

    this.activeAdapter = null;
    this.logBuffer = [];

    useCollaborationStore.getState().setDeviceStatus('disconnected');

    // Broadcast device status update to peers
    peerManager.broadcast({
      type: 'deviceDisconnected'
    });
  }

  private handleIncomingDeviceLogs(data: string) {
    // If the gateway is not actively connected, ignore incoming logs to avoid unbounded buffering.
    if (!this.activeAdapter) return;
    this.logBuffer.push(data);
  }

  private flushLogs() {
    if (this.logBuffer.length === 0) return;

    const rawChunk = this.logBuffer.join('');
    this.logBuffer = [];

    // 1. Process and update local store state & terminal logs
    const { logs, telemetryList } = telemetryManager.processIncomingData(rawChunk);

    // 2. Broadcast telemetry to all connected peers
    telemetryList.forEach((telemetry) => {
      peerManager.broadcast({
        type: 'telemetry',
        payload: telemetry
      });
    });

    // 3. Broadcast terminal logs to all connected peers
    if (logs.length > 0) {
      peerManager.broadcast({
        type: 'serial_log',
        payload: { log: logs.join('') }
      });
    }
  }

  async executeCommand(cmdText: string, senderId: string, senderUsername: string): Promise<boolean> {
    // Verify permissions
    if (!permissionManager.canExecuteCommand(senderId)) {
      useCollaborationStore.getState().addLog(`\x1b[31m[Permission] Unauthorized command attempt by ${senderUsername}.\x1b[0m\r\n`);
      return false;
    }

    // Log the command locally
    const cmdId = telemetryManager.logCommand(cmdText, senderUsername, 'pending');

    // If we have a local physical adapter, write to it
    const localAdapter = this.activeAdapter || useIotStore.getState().adapter;
    if (localAdapter && useIotStore.getState().status === 'connected') {
      try {
        await localAdapter.write(cmdText + '\r\n');
        
        // Update command status
        useCollaborationStore.getState().updateCommandStatus(cmdId, 'success');
        
        // Broadcast command execution logging to participants
        peerManager.broadcast({
          type: 'commandExecuted',
          payload: {
            id: cmdId,
            command: cmdText,
            sender: senderUsername,
            status: 'success'
          }
        });

        // Write feedback to local console
        useCollaborationStore.getState().addLog(`\r\n\x1b[36m> ${cmdText} (from ${senderUsername})\x1b[0m\r\n`);
        return true;
      } catch (err: any) {
        console.error('Failed to write command to physical device:', err);
        useCollaborationStore.getState().updateCommandStatus(cmdId, 'failed');
        
        peerManager.broadcast({
          type: 'commandExecuted',
          payload: {
            id: cmdId,
            command: cmdText,
            sender: senderUsername,
            status: 'failed'
          }
        });
        
        useCollaborationStore.getState().addLog(`\x1b[31m\r\n[Error] Command execution failed: ${err.message}\x1b[0m\r\n`);
        return false;
      }
    } else {
      useCollaborationStore.getState().addLog(`\x1b[33m\r\n[Warning] Command not executed: Physical device disconnected.\x1b[0m\r\n`);
      useCollaborationStore.getState().updateCommandStatus(cmdId, 'failed');
      return false;
    }
  }

  // --- PARTICIPANT FUNCTIONS ---

  sendParticipantCommand(cmdText: string): void {
    const store = useCollaborationStore.getState();
    if (store.role !== 'participant' || !store.sessionId || !store.userId) return;

    // Log command locally as pending
    const cmdId = telemetryManager.logCommand(cmdText, store.username || 'Participant', 'pending');

    // Send command request to Host via DataChannel
    peerManager.broadcast({
      type: 'command',
      payload: {
        id: cmdId,
        command: cmdText,
        senderId: store.userId,
        senderUsername: store.username || 'Participant'
      }
    });
  }
}

export const deviceGateway = new DeviceGateway();
