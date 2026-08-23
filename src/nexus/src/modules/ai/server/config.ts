/**
 * AI assistant configuration — server-only.
 *
 * All values are read from `process.env` at module load time. The agent API
 * key is never exported to the client bundle.
 */

export interface AiConfig {
  enabled: boolean;
  agentUrl: string;
  agentApiKey: string;
  model: string;
}

export const aiConfig: AiConfig = {
  enabled: process.env.NEXT_PUBLIC_AI_ENABLED === 'true',
  agentUrl: process.env.AI_AGENT_URL || '',
  agentApiKey: process.env.AI_AGENT_API_KEY || '',
  model: 'gpt-4o-mini',
};

/** Returns true only when the AI feature has been explicitly enabled. */
export function isAiEnabled(): boolean {
  return aiConfig.enabled === true;
}
