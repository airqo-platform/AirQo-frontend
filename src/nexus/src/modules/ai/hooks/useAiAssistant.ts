'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  AiFeatureId,
  AiMessage,
  AiStreamEvent,
} from '../types';

/* -------------------------------------------------------------------------- */
/*  Config shape returned by GET /api/ai/assistant                            */
/* -------------------------------------------------------------------------- */

type FeatureConfig = {
  label: string;
  suggestedPrompts: string[];
};

interface AiAssistantConfig {
  enabled: boolean;
  features: Record<AiFeatureId, FeatureConfig>;
}

/* -------------------------------------------------------------------------- */
/*  Build-time enabled flag (inlined from NEXT_PUBLIC_AI_ENABLED)             */
/* -------------------------------------------------------------------------- */

const AI_ENABLED: boolean =
  process.env.NEXT_PUBLIC_AI_ENABLED === 'true';

/* -------------------------------------------------------------------------- */
/*  Hook                                                                       */
/* -------------------------------------------------------------------------- */

interface UseAiAssistantOptions {
  feature?: AiFeatureId;
  context?: unknown;
}

interface UseAiAssistantReturn {
  messages: AiMessage[];
  sendMessage: (content: string) => Promise<void>;
  isStreaming: boolean;
  error: string | null;
  stop: () => void;
  reset: () => void;
  isEnabled: boolean;
  config: AiAssistantConfig | null;
}

let nextId = 1;
function generateId(): string {
  return `ai-${Date.now()}-${nextId++}`;
}

export function useAiAssistant(
  options?: UseAiAssistantOptions
): UseAiAssistantReturn {
  const { feature, context } = options ?? {};

  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<AiAssistantConfig | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<AiMessage[]>([]);
  messagesRef.current = messages;

  /* -------- Load feature suggestions from the server when enabled -------- */
  useEffect(() => {
    if (!AI_ENABLED) return;

    const controller = new AbortController();

    fetch('/api/ai/assistant', { signal: controller.signal })
      .then(async res => {
        if (!res.ok) return;
        const data: AiAssistantConfig = await res.json();
        setConfig(data);
      })
      .catch(() => {
        // Silently ignore — suggestions stay empty
      });

    return () => controller.abort();
  }, []);

  /* -------- Send a message -------- */
  const sendMessage = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || isStreaming) return;

      setError(null);

      const userMessage: AiMessage = {
        id: generateId(),
        role: 'user',
        content: trimmed,
        createdAt: Date.now(),
      };

      const assistantMessage: AiMessage = {
        id: generateId(),
        role: 'assistant',
        content: '',
        createdAt: Date.now(),
      };

      setMessages(prev => [...prev, userMessage, assistantMessage]);
      setIsStreaming(true);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        // Build full message history for context
        const requestMessages = [...messagesRef.current, userMessage].map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content,
        }));

        const response = await fetch('/api/ai/assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: requestMessages,
            feature,
            context,
          }),
          signal: controller.signal,
        });

        // Handle disabled response (200 with disabled flag)
        if (response.ok) {
          const contentType = response.headers.get('content-type') ?? '';
          if (contentType.includes('application/json')) {
            const body = await response.json();
            if (body.disabled) {
              setMessages(prev =>
                prev.map(m =>
                  m.id === assistantMessage.id
                    ? { ...m, content: body.message ?? 'AI assistant is not available.' }
                    : m
                )
              );
              setIsStreaming(false);
              return;
            }
          }
        }

        if (response.status === 401) {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMessage.id
                ? { ...m, content: 'Please sign in to use the AI assistant.' }
                : m
            )
          );
          setIsStreaming(false);
          return;
        }

        if (response.status === 429) {
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMessage.id
                ? {
                    ...m,
                    content:
                      "You've sent too many requests. Please wait a moment and try again.",
                  }
                : m
            )
          );
          setIsStreaming(false);
          return;
        }

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        // Read the SSE stream
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('No response stream');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let accumulated = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;

            try {
              const event: AiStreamEvent = JSON.parse(trimmed.slice(6));
              if (event.type === 'delta') {
                accumulated += event.content;
                const snapshot = accumulated;
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMessage.id
                      ? { ...m, content: snapshot }
                      : m
                  )
                );
              } else if (event.type === 'error') {
                setError(event.message);
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMessage.id
                      ? {
                          ...m,
                          content: m.content || `Error: ${event.message}`,
                        }
                      : m
                  )
                );
              } else if (event.type === 'done') {
                // Stream complete
              }
            } catch {
              // Skip malformed lines
            }
          }
        }
      } catch (err) {
        if (
          controller.signal.aborted ||
          (err instanceof DOMException && err.name === 'AbortError')
        ) {
          // User stopped — remove the empty assistant message
          setMessages(prev => prev.filter(m => m.id !== assistantMessage.id));
        } else {
          const message =
            err instanceof Error
              ? err.message
              : 'Something went wrong. Please try again.';
          setError(message);
          setMessages(prev =>
            prev.map(m =>
              m.id === assistantMessage.id
                ? {
                    ...m,
                    content: m.content || `Sorry, I couldn't respond. ${message}`,
                  }
                : m
            )
          );
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [isStreaming, feature, context]
  );

  /* -------- Stop streaming -------- */
  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  /* -------- Reset chat -------- */
  const reset = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    messagesRef.current = [];
    setError(null);
    setIsStreaming(false);
  }, []);

  return {
    messages,
    sendMessage,
    isStreaming,
    error,
    stop,
    reset,
    isEnabled: AI_ENABLED,
    config,
  };
}
