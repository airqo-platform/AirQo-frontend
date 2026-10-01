export type AiRole = 'user' | 'assistant' | 'system';

export interface AiMessage {
  id?: string;
  role: AiRole;
  content: string;
  createdAt?: number;
  actions?: AiAssistantAction[];
}

export type AiAssistantActionId =
  | 'open-map'
  | 'compare-locations'
  | 'open-saved-charts'
  | 'upload-dataset'
  | 'configure-export'
  | 'view-rankings';

export interface AiAssistantAction {
  id: AiAssistantActionId;
  label: string;
  href: string;
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
  | { type: 'action'; action: AiAssistantAction }
  | { type: 'done' }
  | { type: 'error'; message: string };
