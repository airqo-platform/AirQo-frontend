'use client';

import React, { useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import type { AiFeatureId } from '../types';
import { getPageMetadata } from '../context/ai-feature-context';
import { useAiPageContext } from '../context/ai-page-context';
import { useAiAssistantContext } from '../context/ai-assistant-provider';
import { useAiAssistant } from '../hooks/useAiAssistant';
import { AiDrawer } from './AiDrawer';

interface AiAssistantProps {
  feature?: AiFeatureId;
}

export const AiAssistant: React.FC<AiAssistantProps> = ({
  feature: propFeature,
}) => {
  const pathname = usePathname();
  const pageContext = useAiPageContext();
  const pageMeta = getPageMetadata(pathname);
  const feature = propFeature ?? pageMeta.feature;
  const {
    isOpen,
    isEnabled,
    pendingPrompt,
    pendingContext,
    consumePendingPrompt,
    close,
  } = useAiAssistantContext();

  // Build a rich context object with page detection + page-provided overrides
  const context = useMemo(
    () => ({
      pathname,
      pageTitle: pageContext.pageTitle ?? pageMeta.pageTitle,
      pageDescription:
        pageContext.pageDescription ?? pageMeta.pageDescription,
      data: pageContext.data,
      ...(pendingContext && typeof pendingContext === 'object'
        ? pendingContext
        : {}),
    }),
    [
      pathname,
      pageContext.pageTitle,
      pageContext.pageDescription,
      pageContext.data,
      pageMeta.pageTitle,
      pageMeta.pageDescription,
      pendingContext,
    ]
  );

  const {
    messages,
    sendMessage,
    isStreaming,
    error,
    stop,
    reset,
    config,
  } = useAiAssistant({ feature, context });

  useEffect(() => {
    if (!isOpen || !pendingPrompt || isStreaming) return;
    const prompt = pendingPrompt;
    consumePendingPrompt();
    void sendMessage(prompt);
  }, [
    consumePendingPrompt,
    isOpen,
    isStreaming,
    pendingPrompt,
    sendMessage,
  ]);

  // Don't render anything when AI is not enabled
  if (!isEnabled) return null;

  const featureConfig = config?.features?.[feature];
  const suggestedPrompts = featureConfig?.suggestedPrompts;

  return (
    <AiDrawer
      isOpen={isOpen}
      onClose={close}
      messages={messages}
      sendMessage={sendMessage}
      isStreaming={isStreaming}
      error={error}
      stop={stop}
      reset={reset}
      feature={feature}
      suggestedPrompts={suggestedPrompts}
    />
  );
};
