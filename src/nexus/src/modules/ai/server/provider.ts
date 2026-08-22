import type { AiMessage } from '../types';
import { aiConfig } from './config';

/**
 * Provider interface for streaming chat completions.
 */
export interface AiProvider {
  streamChat(params: {
    messages: AiMessage[];
    system: string;
    signal?: AbortSignal;
  }): AsyncIterable<string>;
}

/**
 * Create a provider that talks to any OpenAI-compatible chat completions API.
 * This is the EXTERNAL AGENT integration layer — the agent is expected to
 * expose an OpenAI-compatible `/chat/completions` streaming API.
 */
export function createOpenAICompatibleProvider(
  config: { agentUrl: string; agentApiKey: string; model: string }
): AiProvider {
  return {
    async *streamChat({ messages, system, signal }) {
      const apiMessages = [
        { role: 'system', content: system },
        ...messages.map(m => ({ role: m.role, content: m.content })),
      ];

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (config.agentApiKey) {
        headers['Authorization'] = `Bearer ${config.agentApiKey}`;
      }

      const response = await fetch(
        `${config.agentUrl}/chat/completions`,
        {
          method: 'POST',
          headers,
          body: JSON.stringify({
            model: config.model,
            messages: apiMessages,
            stream: true,
          }),
          signal,
        }
      );

      if (!response.ok) {
        const errorBody = await response.text().catch(() => 'Unknown error');
        throw new Error(
          `AI agent returned status ${response.status}: ${errorBody.slice(0, 200)}`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('AI agent returned an empty response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          // Keep the last (potentially incomplete) line in the buffer
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith('data: ')) continue;

            const data = trimmed.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data) as {
                choices?: Array<{
                  delta?: { content?: string };
                }>;
              };
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch {
              // Skip malformed SSE chunks — the provider may emit comments
            }
          }
        }

        // Process any remaining buffer
        if (buffer.trim().startsWith('data: ')) {
          const data = buffer.trim().slice(6);
          if (data !== '[DONE]') {
            try {
              const parsed = JSON.parse(data) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch {
              // Ignore malformed trailing chunk
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
  };
}

/**
 * DEV-ONLY fallback provider. Used when AI is enabled but no AI_AGENT_URL is
 * configured. Yields a short, honest message so the streaming UI is testable.
 * This is NOT real AI — it is a dev/testing aid.
 */
export function createDevFallbackProvider(): AiProvider {
  return {
    async *streamChat() {
      const fullResponse =
        'AI assistant is enabled but no AI agent endpoint is configured yet. ' +
        'Set AI_AGENT_URL in your environment to connect your AI agent API.';

      // Yield in small chunks so the streaming UI is testable
      const chunkSize = 25;
      for (let i = 0; i < fullResponse.length; i += chunkSize) {
        yield fullResponse.slice(i, i + chunkSize);
      }
    },
  };
}

/**
 * Return the appropriate provider based on the current configuration.
 */
export function getAiProvider(): AiProvider {
  if (!aiConfig.enabled) {
    throw new Error(
      'AI assistant is not enabled. Set NEXT_PUBLIC_AI_ENABLED=true in your environment.'
    );
  }

  if (aiConfig.agentUrl) {
    return createOpenAICompatibleProvider(aiConfig);
  }

  // Dev fallback: enabled but no agent URL configured
  return createDevFallbackProvider();
}
