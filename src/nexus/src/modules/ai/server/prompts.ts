import type { AiFeatureId } from '../types';
import { FEATURE_LABELS } from '../constants';

const FEATURE_DESCRIPTIONS: Record<AiFeatureId, string> = {
  home: 'the dashboard home page showing favourite locations and quick air quality summaries',
  map: 'the interactive air quality map showing real-time readings across locations',
  'data-export': 'the data export tool for downloading air quality datasets',
  analytics: 'the air quality analytics page with trend charts and forecasts',
  'data-visualizer': 'the data visualizer for exploring and comparing datasets',
  rankings: 'the air quality rankings leaderboard comparing countries and cities',
  profile: 'the user profile and account settings page',
  general: 'the AirQo Nexus platform in general',
};

/**
 * Build a system prompt for the AI model based on the current feature context.
 */
export function buildSystemPrompt(
  feature: AiFeatureId,
  context?: unknown
): string {
  const featureDescription = FEATURE_DESCRIPTIONS[feature];
  const featureLabel = FEATURE_LABELS[feature];

  // Extract optional page metadata from context
  const ctx = (context && typeof context === 'object' ? context : {}) as {
    pathname?: string;
    pageTitle?: string;
    pageDescription?: string;
    data?: unknown;
  };

  const pageLine = ctx.pageTitle
    ? `The user is currently on the ${ctx.pageTitle} page${ctx.pathname ? ` (${ctx.pathname})` : ''}. ${ctx.pageDescription ?? ''}`
    : '';

  const dataLine =
    ctx.data && typeof ctx.data === 'object'
      ? 'Structured page data is available for this page.'
      : '';

  const lines: string[] = [
    'You are AirQo Nexus AI Assistant, a helpful AI built into the AirQo Nexus air quality platform.',
    '',
    pageLine
      ? `${pageLine} The page belongs to the ${featureLabel} feature: ${featureDescription}.`
      : `The user is currently viewing the ${featureLabel} page: ${featureDescription}.`,
  ];

  if (dataLine) {
    lines.push('', dataLine);
  }

  lines.push(
    '',
    'Your role:',
    '- Help users understand air quality data, AQI values, and health implications.',
    '- Be concise, accurate, and conversational.',
    '- When the user provides data or context, reference it in your response.',
    '- Use metric units by default.',
    '- If you are unsure about a specific reading or location, say so rather than guessing.',
    '',
    'Formatting:',
    '- Use plain language suitable for both technical and non-technical users.',
    '- When listing items, use bullet points for clarity.',
    '- Keep responses under 300 words unless the user explicitly asks for more detail.'
  );

  return lines.join('\n');
}

/**
 * Suggested prompts for each feature — shown in the UI when the chat is empty.
 */
export const FEATURE_SUGGESTED_PROMPTS: Record<AiFeatureId, string[]> = {
  home: [
    'Summarize the air quality at my favourite locations',
    'What should I explore first?',
    'Explain the AQI categories',
  ],
  map: [
    'Explain the air quality at this location',
    'What does this AQI value mean?',
    'What are the health implications?',
  ],
  'data-export': [
    'Help me configure an export',
    'What data is available for my selected sites?',
    'Which file format should I choose?',
  ],
  analytics: [
    'Summarize these charts',
    'What trends do you see in this data?',
    'Explain this chart to me',
  ],
  'data-visualizer': [
    'Help me understand my dataset',
    'Which chart type should I use?',
    'How do I compare readings with WHO standards?',
  ],
  rankings: [
    'Summarize these rankings',
    'What are the notable trends?',
    'Which locations are most polluted and why?',
  ],
  profile: [
    'Help me manage my account',
    'Explain my subscription options',
    'How do I update my profile picture?',
  ],
  general: [
    'Help me understand air quality data',
    'What can I do in AirQo Nexus?',
    'How do I get started with monitoring?',
  ],
};
