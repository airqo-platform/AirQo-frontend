type CohortIdInput =
  | string
  | number
  | null
  | undefined
  | Record<string, unknown>
  | Array<string | number | Record<string, unknown> | null | undefined>;

const extractCohortIdFromObject = (value: Record<string, unknown>): string => {
  const candidate =
    (value._id as string | undefined) ||
    (value.id as string | undefined) ||
    (value.cohort_id as string | undefined) ||
    (value.cohortId as string | undefined);

  return typeof candidate === 'string' ? candidate : '';
};

const normalizeCohortId = (value: CohortIdInput): string[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(item => normalizeCohortId(item));
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'number') {
    return [String(value)];
  }

  if (typeof value === 'object') {
    const extracted = extractCohortIdFromObject(value);
    return extracted ? [extracted.trim()] : [];
  }

  return [];
};

export const normalizeCohortIds = (input: CohortIdInput): string[] => {
  const normalized = normalizeCohortId(input).filter(Boolean);
  return Array.from(new Set(normalized));
};
