import { config } from '@/lib/config';
import authService from '@/services/api-service';
import { useCollaborationStore } from '../../../store/useCollaborationStore';
import { peerManager } from './PeerManager';

export class PermissionManager {
  canExecuteCommand(userId: string | null): boolean {
    if (!userId) return false;
    
    const store = useCollaborationStore.getState();
    
    // Host (owner) can always execute commands
    if (store.role === 'host') return true;
    
    // Otherwise, user must be the current active controller
    return store.currentControllerId === userId;
  }

  requestControl(userId: string, username: string): void {
    const store = useCollaborationStore.getState();
    
    // Only participants need to request control
    if (store.role === 'host') return;

    store.addLog(`\x1b[90m[Permission] Requesting device control from host...\x1b[0m\r\n`);
    peerManager.sendToHost({
      type: 'requestControl',
      payload: { username }
    });
  }

  handleControlRequest(userId: string, username: string): void {
    const store = useCollaborationStore.getState();
    
    // Only host can handle control requests
    if (store.role !== 'host') return;

    store.addLog(`\x1b[36m[Permission] Control requested by participant: ${username}\x1b[0m\r\n`);
    store.updatePeerControlStatus(userId, 'requested');
  }

  async grantControl(userId: string, username: string): Promise<void> {
    const store = useCollaborationStore.getState();
    if (store.role !== 'host' || !store.sessionId) return;

    store.addLog(`\x1b[90m[Permission] Sending grant control request for: ${username}...\x1b[0m\r\n`);
    
    try {
      const res = await fetch(`${config.apiUrl}/api/v1/webrtc/sessions/${store.sessionId}/control/grant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authService.getToken() || '',
        },
        body: JSON.stringify({
          participant_id: userId
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to grant control on backend: ${res.statusText}`);
      }

      // Locally update the UI status immediately; signaling WS will broadcast controlGranted too.
      store.setCurrentControllerId(userId);
      store.updatePeerControlStatus(userId, 'granted');
      store.addLog(`\x1b[32m[Permission] Granted control to: ${username}\x1b[0m\r\n`);
    } catch (e: any) {
      console.error(e);
      store.addLog(`\x1b[31m[Error] Failed to grant control: ${e.message}\x1b[0m\r\n`);
    }
  }

  async revokeControl(userId: string, username: string): Promise<void> {
    const store = useCollaborationStore.getState();
    if (store.role !== 'host' || !store.sessionId) return;

    store.addLog(`\x1b[90m[Permission] Sending revoke control request for: ${username}...\x1b[0m\r\n`);
    
    try {
      const res = await fetch(`${config.apiUrl}/api/v1/webrtc/sessions/${store.sessionId}/control/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authService.getToken() || '',
        },
        body: JSON.stringify({
          controller_id: userId
        })
      });

      if (!res.ok) {
        throw new Error(`Failed to revoke control on backend: ${res.statusText}`);
      }

      // Locally update the UI status immediately
      store.setCurrentControllerId(null);
      store.updatePeerControlStatus(userId, 'none');
      store.addLog(`\x1b[33m[Permission] Revoked control from: ${username}\x1b[0m\r\n`);
    } catch (e: any) {
      console.error(e);
      store.addLog(`\x1b[31m[Error] Failed to revoke control: ${e.message}\x1b[0m\r\n`);
    }
  }

  releaseControl(userId: string, username: string): void {
    const store = useCollaborationStore.getState();
    
    if (store.role === 'host') {
      store.setCurrentControllerId(null);
      store.addLog(`\x1b[33m[Permission] Host released control.\x1b[0m\r\n`);
      peerManager.broadcast({
        type: 'stateUpdate',
        payload: { currentControllerId: null }
      });
    } else if (store.currentControllerId === userId) {
      store.setCurrentControllerId(null);
      store.setPermissionLevel('observer');
      store.addLog(`\x1b[33m[Permission] Released control of device.\x1b[0m\r\n`);
      peerManager.sendToHost({
        type: 'releaseControl',
        payload: { username }
      });
    }
  }
}

export const permissionManager = new PermissionManager();
