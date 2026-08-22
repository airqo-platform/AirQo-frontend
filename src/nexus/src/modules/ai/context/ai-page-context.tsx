'use client';

import { createContext, useContext } from 'react';

export interface AiPageContextValue {
  pageTitle?: string;
  pageDescription?: string;
  data?: unknown;
}

const AiPageContext = createContext<AiPageContextValue>({});

/**
 * Re-export the context for advanced use cases.
 */
export { AiPageContext };

/**
 * Provider that allows pages to inject structured context (title, description,
 * data) for the AI assistant. Components inside can override or supplement the
 * auto-detected page metadata.
 */
export const AiPageContextProvider = AiPageContext.Provider;

/**
 * Hook to consume the nearest `AiPageContextProvider` value.
 * Returns `{}` if no provider is present (safe default).
 */
export function useAiPageContext(): AiPageContextValue {
  return useContext(AiPageContext);
}
