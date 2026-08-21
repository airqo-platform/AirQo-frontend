'use client';

import React from 'react';
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
  const { isOpen, isEnabled, close } = useAiAssistantContext();

  // Build a rich context object with page detection + page-provided overrides
  const context = {
    pathname,
    pageTitle: pageContext.pageTitle ?? pageMeta.pageTitle,
    pageDescription: pageContext.pageDescription ?? pageMeta.pageDescription,
    data: pageContext.data,
  };

  const {
    messages,
    sendMessage,
    isStreaming,
    error,
    stop,
    reset,
    config,
  } = useAiAssistant({ feature, context });

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
