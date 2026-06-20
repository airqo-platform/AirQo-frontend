import { FlashProgress } from '@/types/iot';

export class LocalAgentClient {
  private ws: WebSocket | null = null;
  private readonly messageListeners: Set<(data: any) => void> = new Set();
  private connectionPromise: Promise<void> | null = null;
  
  // Use environment variable if available, fallback to default key
  private readonly agentKey = process.env.NEXT_PUBLIC_LOCAL_AGENT_KEY || 'airqo-local-agent-secure-key-123';
  
  constructor(private readonly url: string = 'ws://127.0.0.1:3300') {}

  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) return Promise.resolve();
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        const connectUrl = `${this.url}/?token=${this.agentKey}`;
        this.ws = new WebSocket(connectUrl);
        
        this.ws.onopen = () => {
          this.connectionPromise = null;
          resolve();
        };

        this.ws.onerror = (err) => {
          this.connectionPromise = null;
          reject(new Error('Failed to connect to local agent. Is it running or is the token correct?'));
        };

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.messageListeners.forEach(listener => listener(data));
          } catch (e) {
            console.error('Failed to parse agent message', e);
          }
        };

        this.ws.onclose = () => {
          this.ws = null;
        };
      } catch (e) {
        this.connectionPromise = null;
        reject(e);
      }
    });

    return this.connectionPromise;
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  send(payload: any): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }
    this.ws.send(JSON.stringify(payload));
  }

  onMessage(listener: (data: any) => void): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  // Helper for Request-Response patterns
  async request(payload: any, expectedResponseType: string, timeoutMs = 30000): Promise<any> {
    await this.connect();
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        cleanup();
        reject(new Error(`Request timeout for ${payload.type}`));
      }, timeoutMs);

      const handleMessage = (data: any) => {
        if (data.type === expectedResponseType) {
          cleanup();
          resolve(data);
        } else if (data.type === 'error' && data.replyTo === payload.type) {
          cleanup();
          reject(new Error(data.message));
        }
      };

      const cleanup = () => {
        clearTimeout(timeout);
        this.messageListeners.delete(handleMessage);
      };

      this.messageListeners.add(handleMessage);
      this.send(payload);
    });
  }

  async listPorts(): Promise<any[]> {
    try {
      const response = await this.request({ type: 'list_ports' }, 'ports_list', 5000);
      return response.ports || [];
    } catch (e) {
      console.error('Failed to list ports from local agent', e);
      return [];
    }
  }
}

export const localAgent = new LocalAgentClient();
