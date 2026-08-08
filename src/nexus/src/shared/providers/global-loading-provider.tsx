'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from 'react';
import { LoadingOverlay } from '@/shared/components/ui/loading-overlay';

interface LoadingRequest {
  isVisible: boolean;
  priority: number;
  title?: string;
  description?: string;
  delayMs?: number;
}

export interface GlobalLoadingOptions {
  priority?: number;
  title?: string;
  description?: string;
  delayMs?: number;
}

interface GlobalLoadingContextValue {
  setLoadingRequest: (id: string, request: LoadingRequest) => void;
}

const GlobalLoadingContext = createContext<GlobalLoadingContextValue | null>(
  null
);

export function GlobalLoadingProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [requests, setRequests] = useState<Record<string, LoadingRequest>>(
    {}
  );

  const setLoadingRequest = useCallback(
    (id: string, request: LoadingRequest) => {
      setRequests(current => {
        if (!request.isVisible) {
          if (!current[id]) return current;

          const next = { ...current };
          delete next[id];
          return next;
        }

        const previous = current[id];
        if (
          previous?.isVisible === request.isVisible &&
          previous.priority === request.priority &&
          previous.title === request.title &&
          previous.description === request.description &&
          previous.delayMs === request.delayMs
        ) {
          return current;
        }

        return { ...current, [id]: request };
      });
    },
    []
  );

  const activeRequest = useMemo(
    () =>
      Object.values(requests).reduce<LoadingRequest | undefined>(
        (current, request) =>
          !current || request.priority > current.priority ? request : current,
        undefined
      ),
    [requests]
  );

  const contextValue = useMemo(
    () => ({ setLoadingRequest }),
    [setLoadingRequest]
  );

  return (
    <GlobalLoadingContext.Provider value={contextValue}>
      {children}
      <LoadingOverlay
        isVisible={Boolean(activeRequest)}
        delayMs={activeRequest?.delayMs ?? 150}
        title={activeRequest?.title}
        description={activeRequest?.description}
      />
    </GlobalLoadingContext.Provider>
  );
}

export function useGlobalLoading(
  isLoading: boolean,
  options: GlobalLoadingOptions = {}
) {
  const context = useContext(GlobalLoadingContext);
  const requestId = useId();

  if (!context) {
    throw new Error('useGlobalLoading must be used within GlobalLoadingProvider');
  }

  const {
    priority = 0,
    title,
    description,
    delayMs = 150,
  } = options;

  useEffect(() => {
    context.setLoadingRequest(requestId, {
      isVisible: isLoading,
      priority,
      title,
      description,
      delayMs,
    });

    return () => {
      context.setLoadingRequest(requestId, {
        isVisible: false,
        priority: 0,
      });
    };
  }, [
    context,
    delayMs,
    description,
    isLoading,
    priority,
    requestId,
    title,
  ]);
}

