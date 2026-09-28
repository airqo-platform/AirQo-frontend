import {
  USER_STATS_EXPORT_HEADERS,
  USER_STATS_EXPORT_PAGE_LIMIT,
  buildUserStatsExportCsv,
  buildUserStatsExportFilename,
  buildUserStatsExportRows,
  fetchAllUserStatsExport,
} from '../userStatsExport';
import { userService } from '@/shared/services/userService';
import type {
  UserStatsExportResponse,
  UserStatsExportUser,
} from '@/shared/types/api';

jest.mock('@/shared/services/userService', () => ({
  userService: {
    getUserStatsExport: jest.fn(),
  },
}));

const getUserStatsExportMock = userService.getUserStatsExport as jest.Mock;

const buildUser = (
  overrides: Partial<UserStatsExportUser> = {}
): UserStatsExportUser => ({
  _id: 'u1',
  email: 'jane@airqo.africa',
  ...overrides,
});

const buildResponse = (
  overrides: Partial<UserStatsExportResponse> = {}
): UserStatsExportResponse => ({
  success: true,
  message: 'ok',
  segment: 'total',
  total: 0,
  unsubscribed_total: 0,
  skip: 0,
  limit: USER_STATS_EXPORT_PAGE_LIMIT,
  has_more: false,
  users: [],
  ...overrides,
});

beforeEach(() => {
  getUserStatsExportMock.mockReset();
});

describe('fetchAllUserStatsExport', () => {
  it('merges pages and stops once has_more is false', async () => {
    const page1Users = [buildUser({ _id: 'u1' }), buildUser({ _id: 'u2' })];
    const page2Users = [buildUser({ _id: 'u3' })];
    getUserStatsExportMock
      .mockResolvedValueOnce(
        buildResponse({
          users: page1Users,
          total: 750,
          unsubscribed_total: 3,
          skip: 0,
          has_more: true,
        })
      )
      .mockResolvedValueOnce(
        buildResponse({
          users: page2Users,
          total: 750,
          unsubscribed_total: 3,
          skip: USER_STATS_EXPORT_PAGE_LIMIT,
          has_more: false,
        })
      );

    const result = await fetchAllUserStatsExport('active', {
      excludeUnsubscribed: true,
    });

    expect(result.users).toEqual([...page1Users, ...page2Users]);
    expect(result.total).toBe(750);
    expect(result.unsubscribedTotal).toBe(3);
    expect(getUserStatsExportMock).toHaveBeenCalledTimes(2);
  });

  it('forwards segment, excludeUnsubscribed, limit, skip and signal', async () => {
    const controller = new AbortController();
    getUserStatsExportMock.mockResolvedValueOnce(
      buildResponse({ users: [buildUser()], has_more: false })
    );

    await fetchAllUserStatsExport('verified', {
      excludeUnsubscribed: true,
      signal: controller.signal,
    });

    expect(getUserStatsExportMock).toHaveBeenCalledWith({
      segment: 'verified',
      excludeUnsubscribed: true,
      limit: USER_STATS_EXPORT_PAGE_LIMIT,
      skip: 0,
      signal: controller.signal,
    });
  });

  it('does not send excludeUnsubscribed when not requested', async () => {
    getUserStatsExportMock.mockResolvedValueOnce(
      buildResponse({ users: [buildUser()], has_more: false })
    );

    await fetchAllUserStatsExport('api');

    expect(getUserStatsExportMock).toHaveBeenCalledWith({
      segment: 'api',
      excludeUnsubscribed: undefined,
      limit: USER_STATS_EXPORT_PAGE_LIMIT,
      skip: 0,
      signal: undefined,
    });
  });

  it('advances skip by the response limit and falls back to the page limit', async () => {
    getUserStatsExportMock
      .mockResolvedValueOnce(
        buildResponse({
          users: [buildUser()],
          limit: 250,
          has_more: true,
        })
      )
      .mockResolvedValueOnce(
        buildResponse({
          users: [buildUser({ _id: 'u2' })],
          limit: 0,
          has_more: true,
        })
      )
      .mockResolvedValueOnce(
        buildResponse({
          users: [buildUser({ _id: 'u3' })],
          has_more: false,
        })
      );

    await fetchAllUserStatsExport('total');

    expect(getUserStatsExportMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ skip: 0 })
    );
    // Page 1 reported limit 250 -> skip advances by 250.
    expect(getUserStatsExportMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({ skip: 250 })
    );
    // Page 2 reported limit 0 -> falls back to the page limit (500).
    expect(getUserStatsExportMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({ skip: 250 + USER_STATS_EXPORT_PAGE_LIMIT })
    );
  });

  it('reports totals from the last response', async () => {
    getUserStatsExportMock
      .mockResolvedValueOnce(
        buildResponse({ users: [buildUser()], total: 10, has_more: true })
      )
      .mockResolvedValueOnce(
        buildResponse({
          users: [buildUser({ _id: 'u2' })],
          total: 999,
          unsubscribed_total: 42,
          has_more: false,
        })
      );

    const result = await fetchAllUserStatsExport('total');

    expect(result.total).toBe(999);
    expect(result.unsubscribedTotal).toBe(42);
  });

  it('rejects when the max page count is exhausted while has_more is still true', async () => {
    getUserStatsExportMock.mockImplementation(async () =>
      buildResponse({ users: [buildUser()], has_more: true })
    );

    await expect(fetchAllUserStatsExport('total')).rejects.toThrow(
      'Export is too large to complete. Please try again or narrow the export.'
    );
  });

  it('propagates service rejections without retrying', async () => {
    getUserStatsExportMock.mockRejectedValueOnce(new Error('boom'));

    await expect(fetchAllUserStatsExport('total')).rejects.toThrow('boom');
    expect(getUserStatsExportMock).toHaveBeenCalledTimes(1);
  });
});

describe('buildUserStatsExportRows', () => {
  it('maps missing optional fields to empty strings', () => {
    const rows = buildUserStatsExportRows([
      buildUser({ _id: 'id-1', email: 'a@x.io' }),
    ]);

    expect(rows[0]).toEqual([
      '',
      '',
      'a@x.io',
      '',
      'id-1',
      '',
      '',
      'Inactive',
      'No',
      '0',
      '',
      '',
      'No',
    ]);
  });

  it('maps booleans and counts to display labels', () => {
    const rows = buildUserStatsExportRows([
      buildUser({
        _id: 'id-2',
        firstName: 'Jane',
        lastName: 'Doe',
        userName: 'jdoe',
        organization: 'AirQo',
        country: 'Uganda',
        isActive: true,
        verified: true,
        loginCount: 7,
        lastLogin: '2026-09-01T10:30:00',
        createdAt: '2025-01-15T08:00:00',
        unsubscribed: true,
      }),
    ]);

    expect(rows[0]).toEqual([
      'Jane',
      'Doe',
      'jane@airqo.africa',
      'jdoe',
      'id-2',
      'AirQo',
      'Uganda',
      'Active',
      'Yes',
      '7',
      '2026-09-01 10:30',
      '2025-01-15 08:00',
      'Yes',
    ]);
  });

  it('defaults loginCount to 0 when absent', () => {
    const rows = buildUserStatsExportRows([buildUser()]);
    expect(rows[0][9]).toBe('0');
  });
});

describe('buildUserStatsExportCsv', () => {
  it('starts with the BOM, the quoted header line and CRLF endings', () => {
    const csv = buildUserStatsExportCsv([buildUser()]);
    const lines = csv.split('\r\n');

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(lines[0]).toBe(
      `\uFEFF${USER_STATS_EXPORT_HEADERS.map(h => `"${h}"`).join(',')}`
    );
    expect(lines).toHaveLength(2);
  });
});

describe('buildUserStatsExportFilename', () => {
  it('builds <segment>-users-<yyyy-MM-dd>.csv', () => {
    expect(
      buildUserStatsExportFilename('verified', new Date(2026, 8, 20))
    ).toBe('verified-users-2026-09-20.csv');
  });
});
