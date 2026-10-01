import { AI_ASSISTANT_ACTIONS } from '../actions';
import type { AiAssistantAction, AiFeatureId, AiMessage } from '../types';
import { aiConfig } from './config';

/**
 * Provider interface for streaming chat completions.
 */
export interface AiProvider {
  streamChat(params: {
    messages: AiMessage[];
    system: string;
    signal?: AbortSignal;
    feature?: AiFeatureId;
    context?: unknown;
  }): AsyncIterable<string>;
  getAction?(params: {
    messages: AiMessage[];
    feature?: AiFeatureId;
    context?: unknown;
  }): AiAssistantAction | undefined;
}

type PrototypeIntent = {
  response: string;
  actionId?: AiAssistantAction['id'];
};

const getLastUserMessage = (messages: AiMessage[]) =>
  [...messages]
    .reverse()
    .find(message => message.role === 'user')
    ?.content.toLowerCase() ?? '';

const EMAIL_PATTERN = /@/;

const safeCount = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : 0;

const safeLabel = (value: unknown, fallback: string, maxLength: number) => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > maxLength || EMAIL_PATTERN.test(trimmed)) {
    return fallback;
  }
  return trimmed;
};

/**
 * Keep only the fields the scripted responses interpolate. Emails, tokens,
 * site ids, and any other payload keys are dropped.
 */
export const sanitizePrototypeContext = (context: unknown) => {
  const raw =
    context && typeof context === 'object'
      ? (context as Record<string, unknown>)
      : {};
  const savedLocations = Array.isArray(raw.savedLocations)
    ? raw.savedLocations.slice(0, 3).flatMap(location => {
        if (!location || typeof location !== 'object') return [];
        const item = location as Record<string, unknown>;
        const aqiIndex =
          typeof item.aqiIndex === 'number' && Number.isFinite(item.aqiIndex)
            ? item.aqiIndex
            : null;
        return [
          {
            name: safeLabel(item.name, 'Saved location', 80),
            aqiIndex,
            aqiCategory: safeLabel(item.aqiCategory, '', 40) || null,
          },
        ];
      })
    : [];

  return {
    experienceMode:
      raw.experienceMode === 'returning' || raw.experienceMode === 'new'
        ? raw.experienceMode
        : undefined,
    chartCount: safeCount(raw.chartCount),
    comparisonCount: safeCount(raw.comparisonCount),
    savedLocations,
  };
};

export const resolvePrototypeIntent = (
  messages: AiMessage[],
  context?: unknown
): PrototypeIntent => {
  const prompt = getLastUserMessage(messages);
  const safeContext = sanitizePrototypeContext(context);

  if (/rank|cities|countries|leaderboard/.test(prompt)) {
    return {
      response:
        'Use Air Quality Rankings to compare current and historical PM2.5 conditions across African countries and cities. You can switch between cleanest and most polluted views, then narrow city results by country.',
      actionId: 'view-rankings',
    };
  }

  if (/export|download|csv|xlsx|json/.test(prompt)) {
    return {
      response:
        'Start with Data Export when you need reusable source data. Choose locations, pollutant, time range, frequency, and calibrated or raw data, then preview the result before saving it in your preferred format.',
      actionId: 'configure-export',
    };
  }

  if (/upload|dataset|chart type|visuali[sz]e my/.test(prompt)) {
    return {
      response:
        'The Dataset Visualizer is the best starting point for your own files. It profiles uploaded columns, recommends chartable fields, supports multiple chart and map formats, and lets you export finished visuals as PNG or PDF.',
      actionId: 'upload-dataset',
    };
  }

  if (/compare|side.by.side|versus| vs /.test(prompt)) {
    return {
      response:
        'Open Air Quality Analysis and choose the Comparison view. Select the places you care about, review their latest AQI and pollutant readings side-by-side, and save the comparison so you can return to it later.',
      actionId: 'compare-locations',
    };
  }

  if (/aqi|categor|health implication|what does/.test(prompt)) {
    return {
      response:
        'AQI turns pollutant measurements into health-based categories, from good through hazardous. Lower values are generally safer. Open the map to see the configured category, current pollutant value, forecast, and health guidance for a specific place.',
      actionId: 'open-map',
    };
  }

  if (/saved|favo|summari[sz]e|my places|my locations/.test(prompt)) {
    const locations = Array.isArray(safeContext.savedLocations)
      ? safeContext.savedLocations.slice(0, 3)
      : [];
    if (locations.length > 0) {
      const summary = locations
        .map(location => {
          const condition =
            location.aqiCategory ||
            (typeof location.aqiIndex === 'number'
              ? `AQI ${location.aqiIndex}`
              : 'no recent reading');
          return `${location.name || 'Saved location'}: ${condition}`;
        })
        .join('; ');
      return {
        response: `Here is the latest available snapshot for your saved places: ${summary}. Open the map to inspect a place in more detail.`,
        actionId: 'open-map',
      };
    }
    return {
      response:
        'You do not have a saved-place snapshot available yet. Explore the map and choose locations you care about; Nexus can then make your home experience more useful when you return.',
      actionId: 'open-map',
    };
  }

  if (/start|explore first|recommend|what should|help me/.test(prompt)) {
    const hasWork =
      safeContext.experienceMode === 'returning' ||
      (safeContext.chartCount ?? 0) > 0 ||
      (safeContext.comparisonCount ?? 0) > 0;
    return hasWork
      ? {
          response:
            'You already have work in Nexus. I recommend reopening Air Quality Analysis first, where you can continue saved charts or comparisons before starting something new.',
          actionId: 'open-saved-charts',
        }
      : {
          response:
            'Start by exploring a place you know on the Air Quality Map. Once you find relevant locations, you can compare them, save trend charts, or export the underlying data.',
          actionId: 'open-map',
        };
  }

  return {
    response:
      'This Ask AirQo prototype currently supports saved-place summaries, AQI explanations, location comparisons, dataset visualization, data export, rankings, and recommendations on where to start. Try one of the suggested prompts to explore those workflows.',
  };
};

export function createPrototypeProvider(): AiProvider {
  return {
    async *streamChat({ messages, context }) {
      const { response } = resolvePrototypeIntent(messages, context);
      const chunkSize = 32;
      for (let index = 0; index < response.length; index += chunkSize) {
        yield response.slice(index, index + chunkSize);
      }
    },
    getAction({ messages, context }) {
      const { actionId } = resolvePrototypeIntent(messages, context);
      return actionId ? AI_ASSISTANT_ACTIONS[actionId] : undefined;
    },
  };
}

/**
 * Create a provider that talks to any OpenAI-compatible chat completions API.
 * This is the EXTERNAL AGENT integration layer — the agent is expected to
 * expose an OpenAI-compatible `/chat/completions` streaming API.
 */
export function createOpenAICompatibleProvider(config: {
  agentUrl: string;
  agentApiKey: string;
  model: string;
}): AiProvider {
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

      const response = await fetch(`${config.agentUrl}/chat/completions`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: config.model,
          messages: apiMessages,
          stream: true,
        }),
        signal,
      });

      if (!response.ok) {
        // Drain the upstream body so the connection can be reused, but never
        // embed it in the error — it may contain tokens or upstream internals
        // that must not reach logs or the browser.
        await response.text().catch(() => undefined);
        const error = new Error(
          `AI agent returned status ${response.status}`
        ) as Error & { status?: number };
        error.status = response.status;
        throw error;
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

  if (aiConfig.providerMode === 'prototype') {
    return createPrototypeProvider();
  }

  if (aiConfig.providerMode === 'external' && aiConfig.agentUrl) {
    return createOpenAICompatibleProvider(aiConfig);
  }

  throw new Error('Ask AirQo is not configured for this environment.');
}
