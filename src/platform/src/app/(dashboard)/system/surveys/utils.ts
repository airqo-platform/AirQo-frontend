import type {
  SurveyQuestion,
  SurveyTrigger,
} from '@/shared/types/api';

export const SURVEY_QUESTION_TYPES = [
  { value: 'text', label: 'Text' },
  { value: 'multipleChoice', label: 'Multiple choice' },
  { value: 'rating', label: 'Rating' },
  { value: 'yesNo', label: 'Yes / No' },
  { value: 'scale', label: 'Scale' },
] as const;

export const SURVEY_TRIGGER_TYPES = [
  { value: 'manual', label: 'Manual' },
  { value: 'postExposure', label: 'Post-exposure' },
  { value: 'scheduled', label: 'Scheduled' },
] as const;

export type SurveyQuestionDraft = {
  id: string;
  question: string;
  type: string;
  optionsText: string;
  placeholder: string;
  isRequired: boolean;
  minValue: string;
  maxValue: string;
};

export type SurveyTriggerDraft = {
  type: string;
  threshold: string;
  duration: string;
};

export const createQuestionDraft = (
  question?: SurveyQuestion
): SurveyQuestionDraft => ({
  id:
    question?.id ||
    `question_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
  question: question?.question || '',
  type: question?.type || 'text',
  optionsText: (question?.options || []).join('\n'),
  placeholder: question?.placeholder || '',
  isRequired: question?.isRequired ?? true,
  minValue: question?.minValue != null ? String(question.minValue) : '',
  maxValue: question?.maxValue != null ? String(question.maxValue) : '',
});

export const createTriggerDraft = (
  trigger?: SurveyTrigger | null
): SurveyTriggerDraft => ({
  type: trigger?.type || 'manual',
  threshold:
    typeof trigger?.conditions?.threshold === 'number'
      ? String(trigger.conditions.threshold)
      : '',
  duration:
    typeof trigger?.conditions?.duration === 'number'
      ? String(trigger.conditions.duration)
      : '',
});

export const serializeQuestionDraft = (
  draft: SurveyQuestionDraft
): SurveyQuestion => {
  const typedOptions =
    draft.type === 'multipleChoice'
      ? draft.optionsText
          .split(/\r?\n/)
          .map(option => option.trim())
          .filter(Boolean)
      : draft.type === 'yesNo'
        ? ['Yes', 'No']
        : [];

  const minValue =
    (draft.type === 'rating' || draft.type === 'scale') &&
    draft.minValue.trim() !== ''
      ? Number(draft.minValue)
      : undefined;
  const maxValue =
    (draft.type === 'rating' || draft.type === 'scale') &&
    draft.maxValue.trim() !== ''
      ? Number(draft.maxValue)
      : undefined;

  return {
    id: draft.id.trim() || `question_${Date.now()}`,
    question: draft.question.trim(),
    type: draft.type.trim() || 'text',
    options: typedOptions,
    isRequired: draft.isRequired,
    placeholder: draft.placeholder.trim() || undefined,
    ...(Number.isFinite(minValue) ? { minValue } : {}),
    ...(Number.isFinite(maxValue) ? { maxValue } : {}),
  };
};

export const serializeTriggerDraft = (
  draft: SurveyTriggerDraft
): SurveyTrigger => {
  const threshold =
    draft.threshold.trim() !== '' ? Number(draft.threshold) : undefined;
  const duration =
    draft.duration.trim() !== '' ? Number(draft.duration) : undefined;

  const conditions: Record<string, number> = {};
  if (Number.isFinite(threshold)) {
    conditions.threshold = Number(threshold);
  }
  if (Number.isFinite(duration)) {
    conditions.duration = Number(duration);
  }

  return {
    type: draft.type.trim() || 'manual',
    ...(Object.keys(conditions).length > 0 ? { conditions } : {}),
  };
};

export const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return 'Not available';
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(parsedDate);
};

export const formatDuration = (seconds?: number | null): string => {
  if (seconds == null || Number.isNaN(Number(seconds))) {
    return 'Not available';
  }

  const totalSeconds = Math.max(0, Math.round(Number(seconds)));
  if (totalSeconds < 60) {
    return `${totalSeconds}s`;
  }

  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${minutes}m`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0
    ? `${hours}h ${remainingMinutes}m`
    : `${hours}h`;
};

export const formatQuestionTypeLabel = (type: string): string => {
  switch (type) {
    case 'text':
      return 'Text';
    case 'multipleChoice':
      return 'Multiple choice';
    case 'rating':
      return 'Rating';
    case 'yesNo':
      return 'Yes / No';
    case 'scale':
      return 'Scale';
    default:
      return type
        .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, character => character.toUpperCase());
  }
};

export const formatResponseValue = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.map(item => String(item)).join(', ');
  }

  if (value === null || value === undefined || value === '') {
    return 'Not answered';
  }

  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return String(value);
};

export const getTopAnswerEntries = (
  distribution?: Record<string, number>,
  limit = 3
): Array<[string, number]> => {
  if (!distribution) {
    return [];
  }

  return Object.entries(distribution)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit);
};

export const getTotalAnswerCount = (
  distribution?: Record<string, number>
): number => {
  if (!distribution) {
    return 0;
  }

  return Object.values(distribution).reduce(
    (sum, value) => sum + Number(value || 0),
    0
  );
};

export const formatSurveyStatus = (
  isActive?: boolean,
  surveyStatus?: string,
  isExpired?: boolean
): { label: string; tone: string } => {
  if (isExpired) {
    return {
      label: 'Expired',
      tone:
        'bg-slate-100 text-slate-700 dark:bg-slate-950/40 dark:text-slate-300',
    };
  }

  if (isActive === false) {
    return {
      label: surveyStatus ? formatQuestionTypeLabel(surveyStatus) : 'Inactive',
      tone:
        'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    };
  }

  if (surveyStatus) {
    return {
      label: formatQuestionTypeLabel(surveyStatus),
      tone:
        'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
    };
  }

  return {
    label: isActive ? 'Active' : 'Inactive',
    tone: isActive
      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
      : 'bg-slate-100 text-slate-700 dark:bg-slate-950/40 dark:text-slate-300',
  };
};

export const getQuestionDistribution = (
  distribution: Record<string, Record<string, number>> | undefined,
  questionId: string
): Record<string, number> | undefined => {
  return distribution?.[questionId];
};

export const getSurveyTriggerLabel = (
  trigger?: SurveyTrigger | null
): string => {
  if (!trigger) {
    return 'Manual trigger';
  }

  const triggerType = trigger.type;
  if (!triggerType) {
    return 'Manual trigger';
  }

  const label = getSurveyTriggerTypeLabel(String(triggerType));
  return label === 'Manual' ? 'Manual trigger' : label;
};

export const getSurveyTriggerTypeLabel = (type: string): string => {
  const match = SURVEY_TRIGGER_TYPES.find(option => option.value === type);
  return match?.label || formatQuestionTypeLabel(type);
};
