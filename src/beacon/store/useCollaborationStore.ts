import { create } from 'zustand';

export interface CommandLog {
  id: string;
  command: string;
  sender: string;
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
}

export interface PeerInfo {
  userId: string;
  username: string;
  controlStatus: 'none' | 'requested' | 'granted';
}

export interface JoinRequest {
  userId: string;
  username: string;
}

export type CollaborationRole = 'host' | 'participant' | null;
export type ConnectionQuality = 'poor' | 'good' | 'excellent' | 'unknown';
export type PermissionLevel = 'owner' | 'controller' | 'observer';

interface CollaborationState {
  // Session details
  sessionId: string | null;
  role: CollaborationRole;
  userId: string | null;
  username: string | null;
  isConnecting: boolean;

  // Sync state
  deviceStatus: 'connected' | 'disconnected';
  connectionQuality: ConnectionQuality;
  currentControllerId: string | null;
  permissionLevel: PermissionLevel;
  liveTelemetry: Record<string, any>;
  recentCommands: CommandLog[];
  connectedPeers: PeerInfo[];
  joinRequests: JoinRequest[];
  observers: string[];

  // Logs terminal
  logs: string[];
  autoScroll: boolean;

  // Actions
  setSessionId: (id: string | null) => void;
  setRole: (role: CollaborationRole) => void;
  setUserId: (id: string | null) => void;
  setUsername: (name: string | null) => void;
  setIsConnecting: (isConnecting: boolean) => void;
  
  setDeviceStatus: (status: 'connected' | 'disconnected') => void;
  setConnectionQuality: (quality: ConnectionQuality) => void;
  setCurrentControllerId: (id: string | null) => void;
  setPermissionLevel: (level: PermissionLevel) => void;
  updateLiveTelemetry: (data: Record<string, any>) => void;
  addRecentCommand: (cmd: CommandLog) => void;
  updateCommandStatus: (cmdId: string, status: 'pending' | 'success' | 'failed') => void;
  
  setConnectedPeers: (peers: PeerInfo[]) => void;
  addConnectedPeer: (peer: PeerInfo) => void;
  removeConnectedPeer: (userId: string) => void;
  updatePeerControlStatus: (userId: string, controlStatus: 'none' | 'requested' | 'granted') => void;
  
  setJoinRequests: (requests: JoinRequest[]) => void;
  addJoinRequest: (req: JoinRequest) => void;
  removeJoinRequest: (userId: string) => void;
  
  setObservers: (observers: string[]) => void;
  addLog: (log: string) => void;
  clearLogs: () => void;
  setAutoScroll: (auto: boolean) => void;

  reset: () => void;
}

const initialState: {
  sessionId: string | null;
  role: CollaborationRole;
  userId: string | null;
  username: string | null;
  isConnecting: boolean;
  deviceStatus: 'connected' | 'disconnected';
  connectionQuality: ConnectionQuality;
  currentControllerId: string | null;
  permissionLevel: PermissionLevel;
  liveTelemetry: Record<string, any>;
  recentCommands: CommandLog[];
  connectedPeers: PeerInfo[];
  joinRequests: JoinRequest[];
  observers: string[];
  logs: string[];
  autoScroll: boolean;
} = {
  sessionId: null,
  role: null,
  userId: null,
  username: null,
  isConnecting: false,
  deviceStatus: 'disconnected',
  connectionQuality: 'unknown',
  currentControllerId: null,
  permissionLevel: 'observer',
  liveTelemetry: {},
  recentCommands: [],
  connectedPeers: [],
  joinRequests: [],
  observers: [],
  logs: [],
  autoScroll: true,
};

export const useCollaborationStore = create<CollaborationState>((set) => ({
  ...initialState,

  setSessionId: (sessionId) => set({ sessionId }),
  setRole: (role) => set({ role }),
  setUserId: (userId) => set({ userId }),
  setUsername: (username) => set({ username }),
  setIsConnecting: (isConnecting) => set({ isConnecting }),

  setDeviceStatus: (deviceStatus) => set({ deviceStatus }),
  setConnectionQuality: (connectionQuality) => set({ connectionQuality }),
  setCurrentControllerId: (currentControllerId) => set({ currentControllerId }),
  setPermissionLevel: (permissionLevel) => set({ permissionLevel }),
  updateLiveTelemetry: (data) => set((state) => ({
    liveTelemetry: { ...state.liveTelemetry, ...data }
  })),
  addRecentCommand: (cmd) => set((state) => ({
    recentCommands: [cmd, ...state.recentCommands].slice(0, 50)
  })),
  updateCommandStatus: (cmdId, status) => set((state) => ({
    recentCommands: state.recentCommands.map((c) =>
      c.id === cmdId ? { ...c, status } : c
    )
  })),

  setConnectedPeers: (connectedPeers) => set({ connectedPeers }),
  addConnectedPeer: (peer) => set((state) => {
    if (state.connectedPeers.some((p) => p.userId === peer.userId)) return {};
    return { connectedPeers: [...state.connectedPeers, peer] };
  }),
  removeConnectedPeer: (userId) => set((state) => ({
    connectedPeers: state.connectedPeers.filter((p) => p.userId !== userId)
  })),
  updatePeerControlStatus: (userId, controlStatus) => set((state) => ({
    connectedPeers: state.connectedPeers.map((p) =>
      p.userId === userId ? { ...p, controlStatus } : p
    )
  })),

  setJoinRequests: (joinRequests) => set({ joinRequests }),
  addJoinRequest: (req) => set((state) => {
    if (state.joinRequests.some((r) => r.userId === req.userId)) return {};
    return { joinRequests: [...state.joinRequests, req] };
  }),
  removeJoinRequest: (userId) => set((state) => ({
    joinRequests: state.joinRequests.filter((r) => r.userId !== userId)
  })),

  setObservers: (observers) => set({ observers }),
  addLog: (log) => set((state) => ({
    logs: state.logs.length > 1000 ? [...state.logs.slice(100), log] : [...state.logs, log]
  })),
  clearLogs: () => set({ logs: [] }),
  setAutoScroll: (autoScroll) => set({ autoScroll }),

  reset: () => set(initialState),
}));
