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
      theme={{
        target: 'inline-block',
        base: 'absolute z-50 whitespace-nowrap rounded-lg py-1.5 px-3 text-sm font-medium shadow-sm',
        content:
          'relative z-10 rounded-lg bg-popover px-2.5 py-1.5 text-popover-foreground',
        arrow: {
          base: 'absolute z-10 h-2 w-2 rotate-45',
          style: {
            dark: 'bg-popover',
            light: 'bg-popover',
            auto: 'bg-popover',
          },
        },
      }}
    >
      <div className="inline-block">{triggerButton}</div>
    </Tooltip>
  );
};
