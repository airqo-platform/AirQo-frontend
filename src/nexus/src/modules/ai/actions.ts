import type { AiAssistantAction, AiAssistantActionId } from './types';

/**
 * The only navigation targets Ask AirQo may offer. Actions are matched by
 * both id and href so a streamed payload cannot redirect off Nexus.
 */
export const AI_ASSISTANT_ACTIONS: Record<
  AiAssistantActionId,
  AiAssistantAction
> = {
  'open-map': { id: 'open-map', label: 'Open map', href: '/user/map' },
  'compare-locations': {
    id: 'compare-locations',
    label: 'Compare locations',
    href: '/user/air-quality/analytics?view=comparison',
  },
  'open-saved-charts': {
    id: 'open-saved-charts',
    label: 'Open saved charts',
    href: '/user/air-quality/analytics?view=trends',
  },
  'upload-dataset': {
    id: 'upload-dataset',
    label: 'Upload a dataset',
    href: '/user/data-visualizer',
  },
  'configure-export': {
    id: 'configure-export',
    label: 'Configure an export',
    href: '/user/data-export',
  },
  'view-rankings': {
    id: 'view-rankings',
    label: 'View rankings',
    href: '/user/air-quality/rankings',
  },
};

const isInternalHref = (href: string): boolean =>
  href.startsWith('/user/') && !href.includes('://') && !href.startsWith('//');

export const getAllowlistedAssistantAction = (
  action: AiAssistantAction | undefined
): AiAssistantAction | undefined => {
  if (!action) return undefined;
  const expected = AI_ASSISTANT_ACTIONS[action.id];
  if (!expected || expected.href !== action.href) return undefined;
  if (!isInternalHref(expected.href)) return undefined;
  return expected;
};
