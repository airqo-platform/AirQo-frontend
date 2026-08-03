import type { DataDownloadResponse } from '@/shared/types/api';
import type { TabType } from '../types/dataExportTypes';
import { parseDownloadResponseRecords } from './dataExportFile';

export interface PartialDataWarning {
  totalSelected: number;
  withData: number;
  missingNames: string[];
}

type DownloadRecord = Record<string, unknown>;

const normalizeValue = (value: unknown): string =>
  typeof value === 'string' || typeof value === 'number'
    ? String(value).trim().toLowerCase()
    : '';

const normalizeLabel = (value: unknown): string =>
  normalizeValue(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[,_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeMatchLabel = (value: unknown): string =>
  normalizeLabel(value).replace(/\s+/g, '');

const normalizeKey = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');

const getRecordValue = (record: DownloadRecord, aliases: string[]): string => {
  const normalizedRecord = Object.entries(record).reduce(
    (values, [key, value]) => {
      values[normalizeKey(key)] = value;
      return values;
    },
    {} as Record<string, unknown>
  );

  for (const alias of aliases) {
    const value = normalizeValue(normalizedRecord[normalizeKey(alias)]);
    if (value) return value;
  }

  return '';
};

const getRecordValues = (
  record: DownloadRecord,
  aliases: string[]
): string[] => {
  const normalizedRecord = Object.entries(record).reduce(
    (values, [key, value]) => {
      values[normalizeKey(key)] = value;
      return values;
    },
    {} as Record<string, unknown>
  );

  return Array.from(
    new Set(
      aliases
        .map(alias => normalizeValue(normalizedRecord[normalizeKey(alias)]))
        .filter(Boolean)
    )
  );
};

const getIdentifierAliases = (activeTab: TabType) => {
  if (activeTab === 'devices') {
    return {
      ids: ['device_id', 'deviceId'],
      names: ['device_name', 'deviceName', 'name'],
    };
  }

  return {
    ids: ['site_id', 'siteId', '_id'],
    names: [
      'site_name',
      'siteName',
      'name',
      'search_name',
      'formatted_name',
      'location_name',
    ],
  };
};

const getMeasurementAliases = (pollutant: string): string[] => {
  const normalizedPollutant = pollutant.trim();
  if (!normalizedPollutant) return [];

  return [
    normalizedPollutant,
    `${normalizedPollutant}_value`,
    `${normalizedPollutant}_calibrated_value`,
    `s1_${normalizedPollutant}`,
    `s2_${normalizedPollutant}`,
  ];
};

const hasMeasurementValue = (
  record: DownloadRecord,
  selectedPollutants: string[]
): boolean => {
  const aliases = selectedPollutants.flatMap(getMeasurementAliases);

  return aliases.some(alias => {
    const value = getRecordValue(record, [alias]);
    return (
      value !== '' &&
      value !== '--' &&
      value !== 'null' &&
      Number.isFinite(Number(value))
    );
  });
};

export const getMeasurementRecords = (
  response: DataDownloadResponse | string,
  selectedPollutants?: string[]
): DownloadRecord[] => {
  const records = parseDownloadResponseRecords(response);
  if (!selectedPollutants?.length) return records;

  return records.filter(record =>
    hasMeasurementValue(record, selectedPollutants)
  );
};

const getSelectedLabels = (selectedIds: string[], selectedLabels: string[]) =>
  selectedIds.map((id, index) => {
    const label = selectedLabels[index]?.trim();
    return label || id;
  });

const countValues = (values: string[]) => {
  const counts = new Map<string, number>();
  values.forEach(value => counts.set(value, (counts.get(value) || 0) + 1));
  return counts;
};

/**
 * Determines availability from the complete API response.
 *
 * An explicitly successful empty response is authoritative: it means none of
 * the selected locations has a reading for the requested filters. For
 * non-empty responses, IDs are preferred when every returned record has a
 * selected ID. Otherwise, names are used only when every returned record can
 * be matched to the selected names. This prevents a response for a different
 * location from being counted as data for the current selection.
 */
export const getDataAvailability = (
  response: DataDownloadResponse | string,
  activeTab: TabType,
  selectedIds: string[],
  selectedLabels: string[],
  selectedPollutants?: string[]
): PartialDataWarning | undefined => {
  const normalizedSelectedIds = Array.from(
    new Set(selectedIds.map(normalizeValue).filter(Boolean))
  );
  if (normalizedSelectedIds.length === 0) return undefined;

  const records = getMeasurementRecords(response, selectedPollutants);
  const labels = getSelectedLabels(normalizedSelectedIds, selectedLabels);

  if (records.length === 0) {
    return {
      totalSelected: normalizedSelectedIds.length,
      withData: 0,
      missingNames: labels,
    };
  }

  const aliases = getIdentifierAliases(activeTab);
  const responseIds = new Set<string>();
  const responseNames = new Set<string>();

  records.forEach(record => {
    const identifier = getRecordValue(record, aliases.ids);
    if (identifier) responseIds.add(identifier);
    getRecordValues(record, aliases.names).forEach(name =>
      responseNames.add(normalizeLabel(name))
    );
  });

  const allRecordsHaveIds = records.every(record =>
    Boolean(getRecordValue(record, aliases.ids))
  );
  const canMatchById =
    allRecordsHaveIds &&
    responseIds.size > 0 &&
    Array.from(responseIds).every(responseId =>
      normalizedSelectedIds.includes(responseId)
    );

  if (canMatchById) {
    const missingNames = labels.filter(
      (_, index) => !responseIds.has(normalizedSelectedIds[index])
    );

    return {
      totalSelected: normalizedSelectedIds.length,
      withData: normalizedSelectedIds.length - missingNames.length,
      missingNames,
    };
  }

  // Names are a safe fallback only when every selected item has a usable
  // label. Response locations outside the selection are ignored below.
  if (
    responseNames.size === 0 ||
    selectedLabels.length < normalizedSelectedIds.length
  ) {
    return undefined;
  }

  const selectedNameCounts = countValues(labels.map(normalizeMatchLabel));
  // Multiple readings for one location must count as one available location.
  // Ignore response locations outside the current selection. The API may
  // return extra rows, but they must never be credited to selected locations.
  const responseNameCounts = countValues(
    Array.from(responseNames)
      .map(normalizeMatchLabel)
      .filter(name => selectedNameCounts.has(name))
  );

  const matchedNameCounts = new Map<string, number>();
  const missingNames = labels.filter(label => {
    const normalizedLabel = normalizeMatchLabel(label);
    const matchedCount = matchedNameCounts.get(normalizedLabel) || 0;
    const availableCount = responseNameCounts.get(normalizedLabel) || 0;

    if (matchedCount < availableCount) {
      matchedNameCounts.set(normalizedLabel, matchedCount + 1);
      return false;
    }

    return true;
  });

  return {
    totalSelected: normalizedSelectedIds.length,
    withData: normalizedSelectedIds.length - missingNames.length,
    missingNames,
  };
};

/**
 * Returns a warning only when at least one selected location is missing data.
 * The full availability summary remains useful to preview totals even when
 * every selected location has data.
 */
export const getPartialDataWarning = (
  response: DataDownloadResponse | string,
  activeTab: TabType,
  selectedIds: string[],
  selectedLabels: string[],
  selectedPollutants?: string[]
): PartialDataWarning | undefined => {
  const availability = getDataAvailability(
    response,
    activeTab,
    selectedIds,
    selectedLabels,
    selectedPollutants
  );

  return availability && availability.missingNames.length > 0
    ? availability
    : undefined;
};
