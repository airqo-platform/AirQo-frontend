import { useCollaborationStore } from '../../../store/useCollaborationStore';

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
  }

  handleControlRequest(userId: string, username: string): void {
    const store = useCollaborationStore.getState();
    
    // Only host can handle control requests
    if (store.role !== 'host') return;

    store.addLog(`\x1b[36m[Permission] Control requested by participant: ${username}\x1b[0m\r\n`);
    store.updatePeerControlStatus(userId, 'requested');
  }

  grantControl(userId: string, username: string): void {
    const store = useCollaborationStore.getState();
    if (store.role !== 'host') return;

    store.setCurrentControllerId(userId);
    store.updatePeerControlStatus(userId, 'granted');
    store.addLog(`\x1b[32m[Permission] Granted device control to participant: ${username}\x1b[0m\r\n`);
  }

  revokeControl(userId: string, username: string): void {
    const store = useCollaborationStore.getState();
    if (store.role !== 'host') return;

    store.setCurrentControllerId(null);
    store.updatePeerControlStatus(userId, 'none');
    store.addLog(`\x1b[33m[Permission] Revoked device control from participant: ${username}\x1b[0m\r\n`);
  }

  releaseControl(userId: string, username: string): void {
    const store = useCollaborationStore.getState();
    
    if (store.currentControllerId === userId) {
      store.setCurrentControllerId(null);
      if (store.role === 'host') {
        store.addLog(`\x1b[33m[Permission] Host released control.\x1b[0m\r\n`);
      } else {
        store.addLog(`\x1b[33m[Permission] Released control of device.\x1b[0m\r\n`);
      }
    }
  }
}

export const permissionManager = new PermissionManager();
