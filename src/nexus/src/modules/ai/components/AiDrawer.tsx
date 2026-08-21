'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AqTrash01,
  AqXClose,
  AqMagicWand01,
  AqArrowRight,
  AqPauseSquare,
} from '@airqo/icons-react';
import { cn } from '@/shared/lib/utils';
import type { AiMessage, AiFeatureId } from '../types';
import { FEATURE_LABELS } from '../constants';

/* -------------------------------------------------------------------------- */
/*  Shimmer skeleton                                                           */
/* -------------------------------------------------------------------------- */

const ShimmerLine: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn(
      'h-3 rounded-full bg-muted',
      'animate-pulse motion-reduce:opacity-50',
      className
    )}
  />
);

/** Shown while waiting for the first streaming delta. */
const MessageSkeleton: React.FC = () => (
  <div className="space-y-2 px-3 py-3" aria-label="Loading response">
    <ShimmerLine className="w-4/5" />
    <ShimmerLine className="w-3/5" />
    <ShimmerLine className="w-2/5" />
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Streaming indicator (typing dots)                                          */
/* -------------------------------------------------------------------------- */

const StreamingIndicator: React.FC = () => (
  <div className="flex items-center gap-1 px-3 py-2">
    <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:-0.3s]" />
    <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:-0.15s]" />
    <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" />
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Mini avatars                                                               */
/* -------------------------------------------------------------------------- */

const AssistantAvatar: React.FC = () => (
  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15">
    <AqMagicWand01 className="h-3.5 w-3.5 text-primary" />
  </div>
);

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

interface AiDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  feature: AiFeatureId;
  messages: AiMessage[];
  sendMessage: (content: string) => Promise<void>;
  isStreaming: boolean;
  error: string | null;
  stop: () => void;
  reset: () => void;
  suggestedPrompts?: string[];
}

/* -------------------------------------------------------------------------- */
/*  AiDrawer — Slack-style right panel, no animation                          */
/* -------------------------------------------------------------------------- */

export const AiDrawer: React.FC<AiDrawerProps> = ({
  isOpen,
  onClose,
  feature,
  messages,
  sendMessage,
  isStreaming,
  error,
  stop,
  reset,
  suggestedPrompts,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Track the previously focused element to restore on close
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);

  // Auto-scroll to bottom on new messages (instant)
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  }, [messages]);

  // Focus input immediately when drawer opens
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Return focus to trigger on close
  useEffect(() => {
    if (!isOpen && triggerRef.current) {
      triggerRef.current.focus();
      triggerRef.current = null;
    }
  }, [isOpen]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Escape-to-close
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isStreaming) return;
      void sendMessage(input.trim());
      setInput('');
    },
    [input, isStreaming, sendMessage]
  );

  const handleSuggestedPrompt = useCallback(
    (prompt: string) => {
      if (isStreaming) return;
      void sendMessage(prompt);
    },
    [isStreaming, sendMessage]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        void handleSubmit(e);
      }
    },
    [handleSubmit]
  );

  const handleReset = useCallback(() => {
    reset();
    setInput('');
  }, [reset]);

  const featureLabel = FEATURE_LABELS[feature] ?? 'General';
  const showSuggestions = messages.length === 0 && suggestedPrompts?.length;
  const hasUserMessages = messages.some(m => m.role === 'user');

  // Detect if the last assistant message is waiting for its first delta
  const lastMsg = messages[messages.length - 1];
  const showShimmer =
    isStreaming &&
    lastMsg?.role === 'assistant' &&
    lastMsg.content === '';

  if (!isOpen) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="false"
      aria-label="AI Assistant"
      className={cn(
        'fixed inset-1.5 z-[10001] flex flex-col overflow-hidden bg-background shadow-2xl border border-border',
        // Mobile: full-width floating panel with gap on all sides
        'rounded-lg',
        // Desktop: right-side drawer, matching the layout push breakpoint
        'md:inset-x-auto md:right-1.5 md:top-1.5 md:bottom-1.5 md:w-[400px] md:rounded-lg'
      )}
    >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <AqMagicWand01 className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-foreground">
                AI Assistant
              </h2>
              <p className="text-xs text-muted-foreground">
                {featureLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {hasUserMessages && (
              <button
                type="button"
                onClick={handleReset}
                className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Clear chat"
                title="Clear chat"
              >
                <AqTrash01 className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Close assistant"
              title="Close"
            >
              <AqXClose className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0 sm:px-5">
          {showSuggestions && (
            <div className="space-y-3">
              <p className="text-center text-xs text-muted-foreground">
                Suggested prompts
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedPrompts!.map(prompt => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSuggestedPrompt(prompt)}
                    disabled={isStreaming}
                    className={cn(
                      'rounded-full border border-border px-3 py-1.5',
                      'text-xs text-muted-foreground',
                      'transition-colors hover:bg-muted hover:text-foreground',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                      'disabled:opacity-50'
                    )}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={cn('flex gap-2', isUser ? 'justify-end' : 'justify-start')}
              >
                {/* Assistant avatar */}
                {!isUser && <AssistantAvatar />}

                <div
                  className={cn(
                    'max-w-[85%] rounded-xl px-3 py-2 text-sm',
                    isUser
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-card text-card-foreground border border-border'
                  )}
                >
                  {msg.content ? (
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                  ) : isStreaming && showShimmer ? (
                    <MessageSkeleton />
                  ) : isStreaming ? (
                    <StreamingIndicator />
                  ) : null}
                </div>
              </div>
            );
          })}

          {error && !isStreaming && (
            <p className="text-center text-xs text-destructive">{error}</p>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-border px-4 py-3 sm:px-5"
        >
          <div className="flex items-end gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about air quality..."
              rows={1}
              maxLength={4000}
              className={cn(
                'flex-1 resize-none rounded-md border border-border bg-background',
                'px-3 py-2 text-sm text-foreground',
                'placeholder:text-muted-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary',
                'max-h-24'
              )}
              aria-label="Message input"
            />
            <div className="flex gap-1">
              {isStreaming ? (
                <button
                  type="button"
                  onClick={stop}
                  className={cn(
                    'rounded-md bg-destructive p-2 text-destructive-foreground',
                    'hover:bg-destructive/90 transition-colors'
                  )}
                  aria-label="Stop generating"
                >
                  <AqPauseSquare className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!input.trim()}
                  className={cn(
                    'rounded-md bg-primary p-2 text-primary-foreground',
                    'hover:bg-primary/90 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                  aria-label="Send message"
                >
                  <AqArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </form>
    </div>,
    document.body
  );
};
