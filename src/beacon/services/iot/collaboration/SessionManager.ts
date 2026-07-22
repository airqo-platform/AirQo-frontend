import { config } from '@/lib/config';
import authService from '@/services/api-service';
import { useCollaborationStore, JoinRequest } from '../../../store/useCollaborationStore';
import { peerManager } from './PeerManager';
import { webRTCService } from './WebRTCService';
import { deviceGateway } from './DeviceGateway';
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
    store.addLog(`\x1b[90mCreating collaboration session via WebRTC backend...\x1b[0m\r\n`);

    try {
      const res = await fetch(`${config.apiUrl}/api/v1/webrtc/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authService.getToken() || '',
        },
        body: JSON.stringify({
          invitees: [] // Optional list of user IDs to invite initially
        }),
      });

      if (!res.ok) {
        throw new Error(`Failed to initialize session: ${res.statusText}`);
      }

      const sessionData = await res.json();
      const sid = sessionData.id;
      if (!sid) throw new Error('Invalid session data returned');

      this.sid = sid;
      store.setSessionId(sid);
      store.setUserId(sessionData.host_id);
      store.setPermissionLevel('owner');
      
      store.addLog(`\x1b[32m[Session Created] WebRTC Session ID: ${sid}\x1b[0m\r\n`);
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
    store.addLog(`\x1b[90mRegistering join request on backend for: ${sid}...\x1b[0m\r\n`);

    try {
      const res = await fetch(`${config.apiUrl}/api/v1/webrtc/sessions/${sid}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: authService.getToken() || '',
        }
      });

      if (!res.ok) {
        throw new Error(`Failed to join session registry: ${res.statusText}`);
      }

      const joinData = await res.json();
      this.sid = sid;
      store.setSessionId(sid);
      store.setUserId(joinData.user_id);
      store.setPermissionLevel('observer');

      store.addLog(`\x1b[32m[Registry Approved] Registered as Participant (ID: ${joinData.user_id})\x1b[0m\r\n`);
      store.addLog(`\x1b[90mConnecting to WebRTC signaling channel...\x1b[0m\r\n`);

      // Connect to WebSocket signaling server
      await this.connectSignaling(sid);
      store.setIsConnecting(false);
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
        await fetch(`${config.apiUrl}/api/v1/webrtc/sessions/${activeSid}`, {
          method: 'DELETE',
          headers: {
            Authorization: authService.getToken() || '',
          },
        });
      } catch (err) {
        console.error('Failed to close session on backend:', err);
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
    const wsUrl = `${wsBase}/api/v1/webrtc/ws/signaling/${sid}?token=${encodeURIComponent(cleanToken)}`;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          store.addLog(`\x1b[32m[Signaling] WebSocket signaling channel established.\x1b[0m\r\n`);
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleSignalingMessage(event.data);
        };

        this.ws.onclose = () => {
          store.addLog(`\x1b[33m[Signaling] WebSocket signaling disconnected.\x1b[0m\r\n`);
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
      const payload = msg.payload;

      switch (msg.type) {
        case 'peerJoined':
          // Broadcast when any user connects to signaling WebSocket
          if (msg.user_id !== store.userId) {
            store.addLog(`\x1b[36m[Session] Peer connected: ${msg.user_id} (${msg.role})\x1b[0m\r\n`);
            
            if (store.role === 'host' && msg.role === 'Participant') {
              // Add to pending approval join requests list
              store.addJoinRequest({
                userId: msg.user_id,
                username: `Peer-${msg.user_id.slice(0, 5)}`
              });
            }
          }
          break;

        case 'peerLeft':
          // Broadcast when any user disconnects
          if (msg.user_id !== store.userId) {
            store.addLog(`\x1b[33m[Session] Peer disconnected: ${msg.user_id}\x1b[0m\r\n`);
            peerManager.removePeer(msg.user_id);
            store.removeConnectedPeer(msg.user_id);
            store.removeJoinRequest(msg.user_id);
          }
          break;

        case 'offer':
          // Route offer to create WebRTC Answer
          if (msg.sender_id !== store.userId) {
            this.routeWebRTCOffer(msg.sender_id, payload.sdp);
          }
          break;

        case 'answer':
          // Route answer to set remote description on Host
          if (msg.sender_id !== store.userId) {
            const pc = peerManager.getPeerPC(msg.sender_id);
            if (pc) {
              webRTCService.setRemoteDescription(pc, { type: 'answer', sdp: payload.sdp }).catch((err) => {
                console.error('Failed to set remote description answer:', err);
              });
            }
          }
          break;

        case 'iceCandidate':
          // Route incoming ICE Candidate
          if (msg.sender_id !== store.userId) {
            const pc = peerManager.getPeerPC(msg.sender_id);
            if (pc) {
              const candidateInit: RTCIceCandidateInit = {
                candidate: payload.candidate,
                sdpMid: payload.sdpMid,
                sdpMLineIndex: payload.sdpMLineIndex
              };
              webRTCService.addIceCandidate(pc, candidateInit).catch((err) => {
                console.warn('Error adding remote ICE candidate:', err);
              });
            }
          }
          break;

        case 'grantControl':
          store.addLog(`\x1b[32m[Permission] Control granted to controller: ${msg.controller_id}\x1b[0m\r\n`);
          store.setCurrentControllerId(msg.controller_id);
          if (msg.controller_id === store.userId) {
            store.setPermissionLevel('controller');
          } else {
            store.setPermissionLevel(store.role === 'host' ? 'owner' : 'observer');
          }
          break;

        case 'revokeControl':
          store.addLog(`\x1b[33m[Permission] Control revoked from controller: ${msg.controller_id}\x1b[0m\r\n`);
          store.setCurrentControllerId(null);
          store.setPermissionLevel(store.role === 'host' ? 'owner' : 'observer');
          break;

        case 'sessionClosed':
          store.addLog(`\x1b[31m[Session] Terminated by host: ${msg.closed_by}\x1b[0m\r\n`);
          store.setIsConnecting(false);
          this.disconnectSession();
          break;

        case 'removeParticipant':
          if (msg.user_id === store.userId) {
            store.addLog(`\x1b[31m[Session] You have been removed from the session by ${msg.removed_by}\x1b[0m\r\n`);
            this.disconnectSession();
          }
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
    store.addLog(`\x1b[32m[Session] Approved join request for: ${req.username}. Initiating WebRTC P2P...\x1b[0m\r\n`);

    // Host starts WebRTC negotiation with participant by setting up connection and sending offer
    this.initiateHostWebRTC(req.userId, req.username);
  }

  async rejectJoinRequest(req: JoinRequest): Promise<void> {
    const store = useCollaborationStore.getState();
    if (store.role !== 'host' || !this.sid) return;

    store.removeJoinRequest(req.userId);
    store.addLog(`\x1b[33m[Session] Rejecting participant: ${req.username}\x1b[0m\r\n`);

    try {
      // DELETE participant endpoint removes the peer from backend session participants
      await fetch(`${config.apiUrl}/api/v1/webrtc/sessions/${this.sid}/participants/${req.userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: authService.getToken() || '',
        }
      });
    } catch (err) {
      console.error('Failed to reject/remove participant on backend:', err);
    }
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
          type: 'iceCandidate',
          target_user_id: participantId,
          payload: {
            candidate: candidate.candidate,
            sdpMid: candidate.sdpMid,
            sdpMLineIndex: candidate.sdpMLineIndex
          }
        });
      },
      (senderId, data) => this.handleWebRTCDataMessage(senderId, data)
    );

    // 2. Host creates & sends offer
    webRTCService.createOffer(pc).then((offer) => {
      this.sendSignalingMessage({
        type: 'offer',
        target_user_id: participantId,
        payload: {
          sdp: offer.sdp
        }
      });
    }).catch((err) => {
      console.error('Failed to create WebRTC offer:', err);
    });
  }

  private routeWebRTCOffer(senderId: string, sdp: string) {
    const store = useCollaborationStore.getState();
    store.addLog(`\x1b[90m[WebRTC] Incoming remote offer from Host. Configuring connection...\x1b[0m\r\n`);

    let pc = peerManager.getPeerPC(senderId);
    if (!pc) {
      // Set up host connection on participant side
      pc = peerManager.setupHostConnection(
        senderId,
        'Host',
        (candidate) => {
          this.sendSignalingMessage({
            type: 'iceCandidate',
            target_user_id: senderId,
            payload: {
              candidate: candidate.candidate,
              sdpMid: candidate.sdpMid,
              sdpMLineIndex: candidate.sdpMLineIndex
            }
          });
        },
        (sid, data) => this.handleWebRTCDataMessage(sid, data),
        () => {
          // Reconnect trigger
          this.joinParticipantSession(this.sid!, this.currentUsername).catch(() => {});
        }
      );
    }

    // Set remote description and send answer
    webRTCService.createAnswer(pc, { type: 'offer', sdp }).then((answer) => {
      this.sendSignalingMessage({
        type: 'answer',
        target_user_id: senderId,
        payload: {
          sdp: answer.sdp
        }
      });
    }).catch((err) => {
      console.error('Failed to answer offer:', err);
    });
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
        // Keep logs, control grant is triggered via Host interface utilizing REST
        if (store.role === 'host') {
          store.addLog(`\x1b[36m[Permission] Control requested by participant: ${msg.payload.username}\x1b[0m\r\n`);
          store.updatePeerControlStatus(senderId, 'requested');
        }
        break;

      case 'releaseControl':
        if (store.role === 'host') {
          const username = msg.payload?.username || senderId;
          store.addLog(`\x1b[33m[Permission] Control released by participant: ${username}\x1b[0m\r\n`);
          store.setCurrentControllerId(null);
          store.updatePeerControlStatus(senderId, 'none');

          if (store.sessionId) {
            fetch(`${config.apiUrl}/api/v1/webrtc/sessions/${store.sessionId}/control/revoke`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: authService.getToken() || '',
              },
              body: JSON.stringify({
                controller_id: senderId,
              }),
            }).catch((err) => {
              console.error('Failed to revoke control on backend after releaseControl:', err);
            });
          }
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
