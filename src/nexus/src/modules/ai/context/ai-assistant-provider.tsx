'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

/* -------------------------------------------------------------------------- */
/*  Build-time enabled flag (inlined from NEXT_PUBLIC_AI_ENABLED)             */
/* -------------------------------------------------------------------------- */

const AI_ENABLED: boolean =
  process.env.NEXT_PUBLIC_AI_ENABLED === 'true';

/* -------------------------------------------------------------------------- */
/*  Context value                                                             */
/* -------------------------------------------------------------------------- */

interface AiAssistantContextValue {
  isOpen: boolean;
  isEnabled: boolean;
  pendingPrompt: string | null;
  pendingContext: unknown;
  open: () => void;
  openWithPrompt: (prompt: string, context?: unknown) => void;
  consumePendingPrompt: () => void;
  close: () => void;
  toggle: () => void;
}

const AiAssistantContext = createContext<AiAssistantContextValue | null>(null);

/* -------------------------------------------------------------------------- */
/*  Hook                                                                       */
/* -------------------------------------------------------------------------- */

export function useAiAssistantContext(): AiAssistantContextValue {
  const ctx = useContext(AiAssistantContext);
  if (!ctx) {
    throw new Error(
      'useAiAssistantContext must be used within an <AiAssistantProvider>'
    );
  }
  return ctx;
}

/* -------------------------------------------------------------------------- */
/*  Provider                                                                   */
/* -------------------------------------------------------------------------- */

export const AiAssistantProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null);
  const [pendingContext, setPendingContext] = useState<unknown>(null);

  const open = useCallback(() => setIsOpen(true), []);
  const openWithPrompt = useCallback((prompt: string, context?: unknown) => {
    setPendingPrompt(prompt.trim());
    setPendingContext(context ?? null);
    setIsOpen(true);
  }, []);
  const consumePendingPrompt = useCallback(() => {
    setPendingPrompt(null);
    setPendingContext(null);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  const value = useMemo<AiAssistantContextValue>(
    () => ({
      isOpen,
      isEnabled: AI_ENABLED,
      pendingPrompt,
      pendingContext,
      open,
      openWithPrompt,
      consumePendingPrompt,
      close,
      toggle,
    }),
    [
      isOpen,
      pendingPrompt,
      pendingContext,
      open,
      openWithPrompt,
      consumePendingPrompt,
      close,
      toggle,
    ]
  );

  return (
    <AiAssistantContext.Provider value={value}>
      {children}
    </AiAssistantContext.Provider>
  );
};
