'use client';

import React from 'react';
import { AqMagicWand01 } from '@airqo/icons-react';
import { Tooltip } from 'flowbite-react';
import { cn } from '@/shared/lib/utils';
import { useAiAssistantContext } from '../context/ai-assistant-provider';

interface AiDrawerTriggerProps {
  'aria-label'?: string;
}

/**
 * Icon-only AI button for feature page headers.
 * Opens the AI Assistant drawer when clicked.
 * Renders nothing when AI is not enabled.
 */
export const AiDrawerTrigger: React.FC<AiDrawerTriggerProps> = ({
  'aria-label': ariaLabel,
}) => {
  const { isEnabled, open } = useAiAssistantContext();

  if (!isEnabled) return null;

  const triggerButton = (
    <button
      type="button"
      onClick={open}
      aria-label={ariaLabel ?? 'Open AI assistant'}
      className={cn(
        'inline-flex h-9 w-9 items-center justify-center rounded-md',
        'bg-primary/15 text-primary ring-1 ring-inset ring-primary/30',
        'hover:bg-primary/25 transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
      )}
    >
      <AqMagicWand01 className="h-4 w-4" />
    </button>
  );

  return (
    <Tooltip
      content="AI Assistant"
      placement="bottom"
      style="dark"
      className="bg-black text-white rounded-md px-2.5 py-1.5 text-xs"
    >
      <div className="inline-block">{triggerButton}</div>
    </Tooltip>
  );
};
