import { userService } from '../services/userService';
import type {
  UserStatsExportResponse,
  UserStatsExportSegment,
  UserStatsExportUser,
} from '../types/api';
import { buildCsv, buildCsvFilename } from './csv';
import { formatWithPattern } from './dateUtils';

/** Page size used for each export request (endpoint max is 1000). */
export const USER_STATS_EXPORT_PAGE_LIMIT = 500;

/**
 * Hard cap on pages fetched per export (500 users x 200 pages = 100k users)
 * so a misbehaving `has_more` flag can never loop forever.
 */
export const USER_STATS_EXPORT_MAX_PAGES = 200;

export const USER_STATS_EXPORT_HEADERS = [
  'First Name',
  'Last Name',
  'Email',
  'Username',
  'User ID',
  'Organization',
  'Country',
  'Status',
  'Verified',
  'Login Count',
  'Last Login',
  'Signed Up',
  'Unsubscribed',
];

export interface UserStatsExportFetchResult {
  users: UserStatsExportUser[];
  total: number;
  unsubscribedTotal: number;
}

/**
 * Maps export users to CSV rows in USER_STATS_EXPORT_HEADERS order. Missing
 * optional fields render as empty strings; cells are returned unescaped —
 * `buildCsv` handles sanitization and quoting.
 */
export const buildUserStatsExportRows = (
  users: readonly UserStatsExportUser[]
): string[][] =>
  users.map(user => [
    user.firstName ?? '',
    user.lastName ?? '',
    user.email ?? '',
    user.userName ?? '',
    user._id ?? '',
    user.organization ?? '',
    user.country ?? '',
    user.isActive ? 'Active' : 'Inactive',
    user.verified ? 'Yes' : 'No',
    String(user.loginCount ?? 0),
    user.lastLogin ? formatWithPattern(user.lastLogin, 'yyyy-MM-dd HH:mm') : '',
    user.createdAt ? formatWithPattern(user.createdAt, 'yyyy-MM-dd HH:mm') : '',
    user.unsubscribed ? 'Yes' : 'No',
  ]);

/** Builds the full CSV text (BOM, CRLF, quoted cells) for the given users. */
export const buildUserStatsExportCsv = (
  users: readonly UserStatsExportUser[]
): string =>
  buildCsv(USER_STATS_EXPORT_HEADERS, buildUserStatsExportRows(users));

/** `<segment>-users-<yyyy-MM-dd>.csv` */
export const buildUserStatsExportFilename = (
  segment: UserStatsExportSegment,
  date: Date = new Date()
): string => buildCsvFilename(`${segment}-users`, date);

/**
 * Fetches every page of a segment export, one request at a time, until the
 * backend reports `has_more === false`. No retries — a failed page rejects
 * the whole export (AGENTS.md: never retry 5xx / network errors).
 *
 * `total` / `unsubscribedTotal` come from the last response: `total` reflects
 * the whole segment (respecting excludeUnsubscribed) and is the number to
 * report to the user, not `users.length`.
 */
export const fetchAllUserStatsExport = async (
  segment: UserStatsExportSegment,
  options: { excludeUnsubscribed?: boolean; signal?: AbortSignal } = {}
): Promise<UserStatsExportFetchResult> => {
  const users: UserStatsExportUser[] = [];
  let total = 0;
  let unsubscribedTotal = 0;
  let skip = 0;

  for (let page = 0; page < USER_STATS_EXPORT_MAX_PAGES; page += 1) {
    const response: UserStatsExportResponse =
      await userService.getUserStatsExport({
        segment,
        excludeUnsubscribed: options.excludeUnsubscribed,
        limit: USER_STATS_EXPORT_PAGE_LIMIT,
        skip,
        signal: options.signal,
      });

    users.push(...response.users);
    total = response.total;
    unsubscribedTotal = response.unsubscribed_total;

    if (response.has_more !== true) {
      return { users, total, unsubscribedTotal };
    }

    const advance =
      response.limit > 0 ? response.limit : USER_STATS_EXPORT_PAGE_LIMIT;
    const nextSkip = skip + advance;
    if (nextSkip <= skip) {
      throw new Error(
        'Export pagination stalled: the server did not advance the cursor.'
      );
    }
    skip = nextSkip;
  }

  throw new Error(
    'Export is too large to complete. Please try again or narrow the export.'
  );
};
