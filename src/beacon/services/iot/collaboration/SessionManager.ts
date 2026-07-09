import { config } from '@/lib/config';
import authService from '@/services/api-service';
import { useCollaborationStore, JoinRequest } from '../../../store/useCollaborationStore';
import { peerManager } from './PeerManager';
import { webRTCService } from './WebRTCService';
import { deviceGateway } from './DeviceGateway';
import { permissionManager } from './PermissionManager';
import { useIotStore } from '../../../store/useIotStore';

export class SessionManager {
  private ws: WebSocket | null = null;
  private sid: string | null = null;
  private currentUsername: string = '';

  // --- API METHODS ---

  async createHostSession(deviceId: string, username: string): Promise<string> {
    this.currentUsername = username;
    const store = useCollaborationStore.getState();
    store.setIsConnecting(true);
    store.setRole('host');
    store.setUsername(username);
    store.clearLogs();
    store.addLog(`\x1b[90mCreating collaboration session for device: ${deviceId}...\x1b[0m\r\n`);

    try {
      const res = await fetch(`${config.apiUrl}/api/v1/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authService.getToken() || '',
        },
        body: JSON.stringify({
          device_id: deviceId,
          session_type: 'DEBUGGING',
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to initialize session: ${res.statusText}`);
      }

      const sessionData = await res.json();
      const sid = sessionData.id || sessionData.session_id;
      if (!sid) throw new Error('Invalid session data returned');

      this.sid = sid;
      store.setSessionId(sid);
      store.addLog(`\x1b[32m[Session Created] Collaboration Session ID: ${sid}\x1b[0m\r\n`);
      store.addLog(`\x1b[90mConnecting to signaling channel...\x1b[0m\r\n`);

      // Connect to WebSocket signaling server
      await this.connectSignaling(sid);
      
      // Hook up local device gateway
      const localAdapter = useIotStore.getState().adapter;
      if (localAdapter && useIotStore.getState().status === 'connected') {
        await deviceGateway.connectDevice(localAdapter);
      } else {
        store.addLog(`\x1b[33m[Warning] Local device is not connected. Connect it via USB to stream telemetry.\x1b[0m\r\n`);
      }

      store.setIsConnecting(false);
      return sid;
    } catch (e: any) {
      console.error(e);
      store.setIsConnecting(false);
      store.setRole(null);
      store.addLog(`\x1b[31m[Error] Failed to create session: ${e.message}\x1b[0m\r\n`);
      throw e;
    }
  }

  async joinParticipantSession(sid: string, username: string): Promise<void> {
    this.currentUsername = username;
    const store = useCollaborationStore.getState();
    store.setIsConnecting(true);
    store.setRole('participant');
    store.setUsername(username);
    store.clearLogs();
    store.addLog(`\x1b[90mJoining collaboration session: ${sid}...\x1b[0m\r\n`);

    try {
      this.sid = sid;
      store.setSessionId(sid);

      // Connect to WebSocket signaling server
      await this.connectSignaling(sid);
    } catch (e: any) {
      console.error(e);
      store.setIsConnecting(false);
      store.setRole(null);
      store.addLog(`\x1b[31m[Error] Failed to join session: ${e.message}\x1b[0m\r\n`);
      throw e;
    }
  }

  async disconnectSession(): Promise<void> {
    const store = useCollaborationStore.getState();
    const activeSid = this.sid;

    // Disconnect physical device gateway if host
    if (store.role === 'host') {
      await deviceGateway.disconnectDevice();
    }

    // Clean up peer connections
    peerManager.clearAll();

    // Close WebSocket signaling channel
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    // Terminate session via API if host
    if (activeSid && store.role === 'host') {
      try {
        await fetch(`${config.apiUrl}/api/v1/sessions/${activeSid}`, {
          method: 'DELETE',
          headers: {
            Authorization: authService.getToken() || '',
          },
        });
      } catch (err) {
        console.error('Failed to terminate session on backend:', err);
      }
    }

    this.sid = null;
    store.reset();
  }

  // --- SIGNALING WS METHODS ---

  private async connectSignaling(sid: string): Promise<void> {
    const store = useCollaborationStore.getState();
    const token = authService.getToken() || '';
    const cleanToken = token.startsWith('JWT ') ? token.split(' ')[1] : token;

    let wsBase = config.apiUrl.replace(/^http/, 'ws');
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      wsBase = wsBase.replace(/^ws:/, 'wss:');
    }
    const wsUrl = `${wsBase}/api/v1/ws/sessions/${sid}?token=${encodeURIComponent(cleanToken)}`;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          store.addLog(`\x1b[32m[Signaling] Connected to signaling channel.\x1b[0m\r\n`);
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleSignalingMessage(event.data);
        };

        this.ws.onclose = () => {
          store.addLog(`\x1b[33m[Signaling] Connection closed.\x1b[0m\r\n`);
          this.ws = null;
          if (store.role === 'participant' && store.sessionId) {
            // Auto reconnect participant WebRTC
            this.handleSignalingDisconnect();
          }
        };

        this.ws.onerror = (err) => {
          console.error('Signaling WS error:', err);
          reject(new Error('Signaling channel connection failed'));
        };
      } catch (e) {
        reject(e);
      }
    });
  }

  private handleSignalingDisconnect() {
    const store = useCollaborationStore.getState();
    store.addLog(`\x1b[33m[Signaling] Reconnecting in 3 seconds...\x1b[0m\r\n`);
    setTimeout(() => {
      if (this.sid && store.sessionId) {
        this.connectSignaling(this.sid).catch(() => {});
      }
    }, 3000);
  }

  private handleSignalingMessage(dataStr: string) {
    try {
      const msg = JSON.parse(dataStr);
      const store = useCollaborationStore.getState();

      switch (msg.type || msg.event) {
        case 'joined':
          store.setUserId(msg.user_id);
          
          if (store.role === 'host') {
            this.sendSignalingMessage({
              type: 'register',
              user_id: msg.user_id,
              username: this.currentUsername
            });
            store.addLog(`\x1b[32m[Session] Registered as Host (ID: ${msg.user_id})\x1b[0m\r\n`);
          } else {
            this.sendSignalingMessage({
              type: 'join_request',
              user_id: msg.user_id,
              username: this.currentUsername
            });
            store.addLog(`\x1b[90m[Session] Sent join request (ID: ${msg.user_id})...\x1b[0m\r\n`);
          }
          break;

        case 'join_request':
          if (store.role === 'host') {
            store.addJoinRequest({
              userId: msg.user_id,
              username: msg.username || 'Anonymous Participant'
            });
            store.addLog(`\x1b[36m[Session] Join request from: ${msg.username || msg.user_id}\x1b[0m\r\n`);
          }
          break;

        case 'join_accepted':
          if (store.role === 'participant' && msg.user_id === store.userId) {
            store.addLog(`\x1b[32m[Session] Join request APPROVED! Establishing WebRTC...\x1b[0m\r\n`);
            this.initiateParticipantWebRTC(msg.host_id, msg.host_username);
          }
          break;

        case 'join_rejected':
          if (store.role === 'participant' && msg.user_id === store.userId) {
            store.addLog(`\x1b[31m[Session] Join request REJECTED by Host.\x1b[0m\r\n`);
            store.setIsConnecting(false);
            this.disconnectSession();
          }
          break;

        case 'signal':
          // Route signaling offer/answer/candidate
          this.routeWebRTCSignal(msg);
          break;

        case 'observer_joined':
          // Keep list of session observers
          store.setObservers(msg.observers || []);
          break;

        default:
          break;
      }
    } catch (e) {
      console.error('Failed to parse signaling message:', e);
    }
  }

  // --- HOST APPROVAL ACTIONS ---

  acceptJoinRequest(req: JoinRequest): void {
    const store = useCollaborationStore.getState();
    if (store.role !== 'host' || !store.userId) return;

    store.removeJoinRequest(req.userId);
    store.addLog(`\x1b[32m[Session] Accepted join request from: ${req.username}\x1b[0m\r\n`);

    // Notify participant that request was accepted
    this.sendSignalingMessage({
      type: 'join_accepted',
      user_id: req.userId,
      host_id: store.userId,
      host_username: this.currentUsername
    });

    // Host starts WebRTC negotiation with participant
    this.initiateHostWebRTC(req.userId, req.username);
  }

  rejectJoinRequest(req: JoinRequest): void {
    const store = useCollaborationStore.getState();
    if (store.role !== 'host') return;

    store.removeJoinRequest(req.userId);
    store.addLog(`\x1b[33m[Session] Rejected join request from: ${req.username}\x1b[0m\r\n`);

    // Notify participant
    this.sendSignalingMessage({
      type: 'join_rejected',
      user_id: req.userId
    });
  }

  // --- WEBRTC NEGOTIATION INITIATION ---

  private initiateHostWebRTC(participantId: string, participantName: string) {
    // 1. Add peer configuration
    const pc = peerManager.addPeer(
      participantId,
      participantName,
      (candidate) => {
        // Send ICE candidate to participant
        this.sendSignalingMessage({
          type: 'signal',
          targetId: participantId,
          senderId: useCollaborationStore.getState().userId,
          payload: {
            type: 'ice-candidate',
            candidate
          }
        });
      },
      (senderId, data) => this.handleWebRTCDataMessage(senderId, data)
    );

    // 2. Host creates & sends offer
    webRTCService.createOffer(pc).then((offer) => {
      this.sendSignalingMessage({
        type: 'signal',
        targetId: participantId,
        senderId: useCollaborationStore.getState().userId,
        payload: {
          type: 'offer',
          sdp: offer
        }
      });
    }).catch((err) => {
      console.error('Failed to create WebRTC offer:', err);
    });
  }

  private initiateParticipantWebRTC(hostId: string, hostName: string) {
    const store = useCollaborationStore.getState();
    store.setIsConnecting(false);

    // 1. Add peer connection to Host
    peerManager.setupHostConnection(
      hostId,
      hostName,
      (candidate) => {
        // Send ICE candidate to Host
        this.sendSignalingMessage({
          type: 'signal',
          targetId: hostId,
          senderId: store.userId,
          payload: {
            type: 'ice-candidate',
            candidate
          }
        });
      },
      (senderId, data) => this.handleWebRTCDataMessage(senderId, data),
      () => {
        // Auto-reconnect trigger: re-request join
        this.sendSignalingMessage({
          type: 'join_request',
          user_id: store.userId,
          username: this.currentUsername
        });
      }
    );
  }

  // --- ROUTE SIGNALING MESSAGES ---

  private routeWebRTCSignal(msg: any) {
    const store = useCollaborationStore.getState();
    
    // Ensure we are the target of this signal
    if (msg.targetId !== store.userId) return;

    const senderId = msg.senderId;
    const payload = msg.payload;

    const pc = peerManager.getPeerPC(senderId);
    if (!pc) {
      console.warn(`No peer connection found for sender: ${senderId}`);
      return;
    }

    if (payload.type === 'ice-candidate') {
      webRTCService.addIceCandidate(pc, payload.candidate).catch((err) => {
        console.error('Error adding ICE candidate:', err);
      });
    } 
    else if (payload.type === 'offer') {
      // Participant receives offer, sets it, creates and sends answer
      webRTCService.createAnswer(pc, payload.sdp).then((answer) => {
        this.sendSignalingMessage({
          type: 'signal',
          targetId: senderId,
          senderId: store.userId,
          payload: {
            type: 'answer',
            sdp: answer
          }
        });
      }).catch((err) => {
        console.error('Failed to create WebRTC answer:', err);
      });
    } 
    else if (payload.type === 'answer') {
      // Host receives answer, sets description
      webRTCService.setRemoteDescription(pc, payload.sdp).catch((err) => {
        console.error('Failed to set remote description answer:', err);
      });
    }
  }

  // --- ROUTE WEBRTC DATA CHANNEL MESSAGES ---

  private handleWebRTCDataMessage(senderId: string, msg: any) {
    const store = useCollaborationStore.getState();

    switch (msg.type) {
      case 'stateUpdate':
        // Participant receives sync state from Host
        if (store.role === 'participant') {
          if (msg.payload.deviceStatus !== undefined) store.setDeviceStatus(msg.payload.deviceStatus);
          if (msg.payload.currentControllerId !== undefined) store.setCurrentControllerId(msg.payload.currentControllerId);
          if (msg.payload.liveTelemetry !== undefined) store.updateLiveTelemetry(msg.payload.liveTelemetry);
          if (msg.payload.observers !== undefined) store.setObservers(msg.payload.observers);
        }
        break;

      case 'telemetry':
        // Participant receives live telemetry
        if (store.role === 'participant') {
          store.updateLiveTelemetry(msg.payload);
        }
        break;

      case 'serial_log':
        // Participant receives console/logs stream
        if (store.role === 'participant') {
          store.addLog(msg.payload.log);
        }
        break;

      case 'deviceConnected':
        if (store.role === 'participant') {
          store.setDeviceStatus('connected');
          store.addLog(`\x1b[32m[Session] Physical device reconnected by Host.\x1b[0m\r\n`);
        }
        break;

      case 'deviceDisconnected':
        if (store.role === 'participant') {
          store.setDeviceStatus('disconnected');
          store.addLog(`\x1b[33m[Session] Physical device disconnected by Host.\x1b[0m\r\n`);
        }
        break;

      case 'command':
        // Host receives command execution request from Participant
        if (store.role === 'host') {
          deviceGateway.executeCommand(msg.payload.command, msg.payload.senderId, msg.payload.senderUsername);
        }
        break;

      case 'commandExecuted':
        // Participant receives logs of executed commands
        if (store.role === 'participant') {
          store.addRecentCommand({
            id: msg.payload.id,
            command: msg.payload.command,
            sender: msg.payload.sender,
            timestamp: Date.now(),
            status: msg.payload.status
          });
        }
        break;

      case 'requestControl':
        if (store.role === 'host') {
          permissionManager.handleControlRequest(senderId, msg.payload.username);
        }
        break;

      case 'grantControl':
        if (store.role === 'participant') {
          store.setCurrentControllerId(store.userId);
          store.setPermissionLevel('controller');
          store.addLog(`\x1b[32m[Permission] Host granted control. You can now execute commands!\x1b[0m\r\n`);
        }
        break;

      case 'revokeControl':
        if (store.role === 'participant') {
          store.setCurrentControllerId(null);
          store.setPermissionLevel('observer');
          store.addLog(`\x1b[33m[Permission] Host revoked your control access.\x1b[0m\r\n`);
        }
        break;

      case 'releaseControl':
        if (store.role === 'host') {
          permissionManager.releaseControl(senderId, msg.payload.username);
          // Broadcast update
          peerManager.broadcast({
            type: 'stateUpdate',
            payload: { currentControllerId: null }
          });
        }
        break;

      default:
        break;
    }
  }

  // --- HELPER METHOD ---

  private sendSignalingMessage(payload: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }
}

export const sessionManager = new SessionManager();
