'use client';

import React from 'react';
import { AqMagicWand01 } from '@airqo/icons-react';
import { cn } from '@/shared/lib/utils';
import { useAiAssistantContext } from '../context/ai-assistant-provider';

interface AiDrawerTriggerProps {
  'aria-label'?: string;
}

/**
 * Ask AirQo entry for feature page headers.
 * Renders nothing when AI is not enabled.
 */
export const AiDrawerTrigger: React.FC<AiDrawerTriggerProps> = ({
  'aria-label': ariaLabel,
}) => {
  const { isEnabled, open } = useAiAssistantContext();

  if (!isEnabled) return null;

  return (
    <button
      type="button"
      onClick={open}
      aria-label={ariaLabel ?? 'Open Ask AirQo'}
      className={cn(
        'inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-background px-2.5',
        'text-sm font-medium text-foreground',
        'hover:bg-muted transition-colors motion-reduce:transition-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
      )}
    >
      <AqMagicWand01 className="h-4 w-4 text-muted-foreground" />
      <span>Ask AirQo</span>
      <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-muted-foreground">
        BETA
      </span>
    </button>
  );
};
