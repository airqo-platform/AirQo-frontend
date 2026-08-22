export type AiRole = 'user' | 'assistant' | 'system';

export interface AiMessage {
  id?: string;
  role: AiRole;
  content: string;
  createdAt?: number;
}

export type AiFeatureId =
  | 'home'
  | 'map'
  | 'data-export'
  | 'analytics'
  | 'data-visualizer'
  | 'rankings'
  | 'profile'
  | 'general';

export interface AiFeatureContext {
  feature: AiFeatureId;
  label: string;
  description?: string;
  suggestedPrompts: string[];
  data?: unknown;
}

export interface AiChatRequest {
  messages: AiMessage[];
  feature?: AiFeatureId;
  context?: unknown;
}

export type AiStreamEvent =
  | { type: 'delta'; content: string }
  | { type: 'done' }
  | { type: 'error'; message: string };
