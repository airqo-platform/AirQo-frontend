import { webRTCService } from './WebRTCService';
import { useCollaborationStore, PeerInfo } from '../../../store/useCollaborationStore';

interface PeerConnectionItem {
  userId: string;
  username: string;
  pc: RTCPeerConnection;
  channel: RTCDataChannel | null;
  lastActive: number;
}

export class PeerManager {
  // Map of userId -> PeerConnectionItem (used by Host)
  private peers: Map<string, PeerConnectionItem> = new Map();
  
  // Single PeerConnectionItem (used by Participant to connect to Host)
  private hostPeer: PeerConnectionItem | null = null;
  
  // Ping timers
  private pingIntervalId: NodeJS.Timeout | null = null;
  private cleanupIntervalId: NodeJS.Timeout | null = null;

  constructor() {
    // Start periodic background tasks
    if (typeof window !== 'undefined') {
      this.pingIntervalId = setInterval(() => this.runPingLatencyCheck(), 4000);
      this.cleanupIntervalId = setInterval(() => this.cleanupStaleConnections(), 10000);
    }
  }

  destroy(): void {
    if (this.pingIntervalId) clearInterval(this.pingIntervalId);
    if (this.cleanupIntervalId) clearInterval(this.cleanupIntervalId);
    this.clearAll();
  }

  // --- HOST PATH ---

  addPeer(
    userId: string,
    username: string,
    onIceCandidate: (candidate: RTCIceCandidate) => void,
    onMessage: (senderId: string, data: any) => void
  ): RTCPeerConnection {
    // If peer already exists, clean it up first
    this.removePeer(userId);

    const pc = webRTCService.createPeerConnection(
      onIceCandidate,
      (state) => this.handleHostPeerConnectionStateChange(userId, state)
    );

    // Host creates the data channel
    const channel = webRTCService.createDataChannel(
      pc,
      'device-data',
      (dataStr) => {
        try {
          const parsed = JSON.parse(dataStr);
          this.handleIncomingMessage(userId, parsed, onMessage);
        } catch (e) {
          console.error(`Host failed to parse message from Peer ${userId}:`, e);
        }
      },
      () => {
        console.log(`Host DataChannel opened with Peer ${userId}`);
        const peer = this.peers.get(userId);
        if (peer) {
          useCollaborationStore.getState().addConnectedPeer({
            userId: peer.userId,
            username: peer.username,
            controlStatus: 'none'
          });
          
          // Send initial state update to new peer
          this.sendInitialStateToPeer(peer);
        }
      },
      () => {
        console.log(`Host DataChannel closed with Peer ${userId}`);
        this.handlePeerDisconnect(userId);
      }
    );

    this.peers.set(userId, {
      userId,
      username,
      pc,
      channel,
      lastActive: Date.now()
    });

    return pc;
  }

  private handleHostPeerConnectionStateChange(userId: string, state: RTCPeerConnectionState) {
    console.log(`Host peer ${userId} connection state change: ${state}`);
    if (state === 'failed' || state === 'closed' || state === 'disconnected') {
      this.handlePeerDisconnect(userId);
    }
  }

  private handlePeerDisconnect(userId: string) {
    const peer = this.peers.get(userId);
    if (peer) {
      this.removePeer(userId);
      useCollaborationStore.getState().removeConnectedPeer(userId);
      useCollaborationStore.getState().removeJoinRequest(userId);
      useCollaborationStore.getState().addLog(`\x1b[33m[Session] Participant ${peer.username} disconnected.\x1b[0m\r\n`);
    }
  }

  removePeer(userId: string): void {
    const item = this.peers.get(userId);
    if (item) {
      try {
        if (item.channel) item.channel.close();
        item.pc.close();
      } catch (e) {}
      this.peers.delete(userId);
    }
  }

  // --- PARTICIPANT PATH ---

  setupHostConnection(
    hostUserId: string,
    hostUsername: string,
    onIceCandidate: (candidate: RTCIceCandidate) => void,
    onMessage: (senderId: string, data: any) => void,
    onReconnectAttempt: () => void
  ): RTCPeerConnection {
    this.clearHostConnection();

    const pc = webRTCService.createPeerConnection(
      onIceCandidate,
      (state) => {
        console.log(`Participant PeerConnection State: ${state}`);
        if (state === 'failed' || state === 'disconnected') {
          useCollaborationStore.getState().addLog(`\x1b[31m[WebRTC] Host connection lost. Attempting auto-reconnect...\x1b[0m\r\n`);
          onReconnectAttempt();
        }
      }
    );

    // Participant listens for remote data channel
    pc.ondatachannel = (event) => {
      const channel = event.channel;
      console.log(`Participant received DataChannel: ${channel.label}`);
      
      if (this.hostPeer) {
        this.hostPeer.channel = channel;
      }

      webRTCService.setupDataChannelListeners(
        channel,
        (dataStr) => {
          try {
            const parsed = JSON.parse(dataStr);
            this.handleIncomingMessage(hostUserId, parsed, onMessage);
          } catch (e) {
            console.error('Participant failed to parse message from Host:', e);
          }
        },
        () => {
          console.log('Participant DataChannel to Host is open.');
          useCollaborationStore.getState().setConnectionQuality('excellent');
          useCollaborationStore.getState().addLog(`\x1b[32m[WebRTC] Peer-to-peer DataChannel established with Host.\x1b[0m\r\n`);
        },
        () => {
          console.log('Participant DataChannel to Host closed.');
          this.handleHostDisconnect();
        }
      );
    };

    this.hostPeer = {
      userId: hostUserId,
      username: hostUsername,
      pc,
      channel: null,
      lastActive: Date.now()
    };

    return pc;
  }

  private handleHostDisconnect() {
    this.clearHostConnection();
    useCollaborationStore.getState().setConnectionQuality('unknown');
    useCollaborationStore.getState().setDeviceStatus('disconnected');
    useCollaborationStore.getState().setCurrentControllerId(null);
    useCollaborationStore.getState().setPermissionLevel('observer');
    useCollaborationStore.getState().addLog(`\x1b[31m[WebRTC] Host disconnected or session terminated.\x1b[0m\r\n`);
  }

  clearHostConnection(): void {
    if (this.hostPeer) {
      try {
        if (this.hostPeer.channel) this.hostPeer.channel.close();
        this.hostPeer.pc.close();
      } catch (e) {}
      this.hostPeer = null;
    }
  }

  // --- GENERAL METHODS ---

  sendMessage(targetUserId: string, message: any): void {
    const jsonStr = JSON.stringify(message);
    
    // If sending to Host (as Participant)
    if (this.hostPeer && this.hostPeer.userId === targetUserId) {
      if (this.hostPeer.channel && this.hostPeer.channel.readyState === 'open') {
        this.hostPeer.channel.send(jsonStr);
      }
      return;
    }

    // If sending to Participant (as Host)
    const peer = this.peers.get(targetUserId);
    if (peer && peer.channel && peer.channel.readyState === 'open') {
      peer.channel.send(jsonStr);
    }
  }

  broadcast(message: any): void {
    const jsonStr = JSON.stringify(message);
    this.peers.forEach((peer) => {
      if (peer.channel && peer.channel.readyState === 'open') {
        peer.channel.send(jsonStr);
      }
    });
  }

  getPeersList(): PeerConnectionItem[] {
    return Array.from(this.peers.values());
  }

  getPeerPC(userId: string): RTCPeerConnection | undefined {
    return this.peers.get(userId)?.pc || (this.hostPeer?.userId === userId ? this.hostPeer.pc : undefined);
  }

  clearAll(): void {
    this.peers.forEach((peer) => {
      try {
        if (peer.channel) peer.channel.close();
        peer.pc.close();
      } catch (e) {}
    });
    this.peers.clear();
    this.clearHostConnection();
  }

  // --- INCOMING MESSAGE HANDLER (PING / PONG) ---

  private handleIncomingMessage(
    senderId: string,
    message: any,
    onMessageCallback: (senderId: string, data: any) => void
  ) {
    // Mark as active to prevent cleanup
    const peer = this.peers.get(senderId) || (this.hostPeer?.userId === senderId ? this.hostPeer : null);
    if (peer) {
      peer.lastActive = Date.now();
    }

    if (message.type === 'ping') {
      this.sendMessage(senderId, {
        type: 'pong',
        payload: { timestamp: message.payload.timestamp }
      });
      return;
    }

    if (message.type === 'pong') {
      const rtt = Date.now() - message.payload.timestamp;
      let quality: 'poor' | 'good' | 'excellent' = 'excellent';
      if (rtt > 150) {
        quality = 'poor';
      } else if (rtt > 60) {
        quality = 'good';
      }
      useCollaborationStore.getState().setConnectionQuality(quality);
      return;
    }

    // Pass through all other collaboration/telemetry/command messages
    onMessageCallback(senderId, message);
  }

  private sendInitialStateToPeer(peer: PeerConnectionItem) {
    const store = useCollaborationStore.getState();
    const stateUpdate = {
      type: 'stateUpdate',
      payload: {
        deviceStatus: store.deviceStatus,
        currentControllerId: store.currentControllerId,
        liveTelemetry: store.liveTelemetry,
        observers: store.observers
      }
    };
    if (peer.channel && peer.channel.readyState === 'open') {
      peer.channel.send(JSON.stringify(stateUpdate));
    }
  }

  // --- BACKGROUND RELIABILITY CHECKS ---

  private runPingLatencyCheck() {
    // If Host, ping all participants
    if (this.peers.size > 0) {
      this.broadcast({
        type: 'ping',
        payload: { timestamp: Date.now() }
      });
    }
    // If Participant, ping Host
    else if (this.hostPeer && this.hostPeer.channel && this.hostPeer.channel.readyState === 'open') {
      this.sendMessage(this.hostPeer.userId, {
        type: 'ping',
        payload: { timestamp: Date.now() }
      });
    }
  }

  private cleanupStaleConnections() {
    const now = Date.now();
    
    // Host checks participants
    this.peers.forEach((peer, userId) => {
      // If no messages or data channel closed for 15s, remove
      const channelClosed = !peer.channel || peer.channel.readyState !== 'open';
      const isStale = now - peer.lastActive > 15000;
      
      if (channelClosed || isStale) {
        console.log(`Cleaning up stale participant connection: ${peer.username} (${userId})`);
        this.handlePeerDisconnect(userId);
      }
    });

    // Participant checks Host
    if (this.hostPeer) {
      const channelClosed = !this.hostPeer.channel || this.hostPeer.channel.readyState !== 'open';
      const isStale = now - this.hostPeer.lastActive > 15000;
      
      if (channelClosed && isStale) {
        console.log('Cleaning up stale host connection');
        this.handleHostDisconnect();
      }
    }
  }
}

export const peerManager = new PeerManager();
