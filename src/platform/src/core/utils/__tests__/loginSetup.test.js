import { setupUserSession } from '@/core/utils/loginSetup';

// Mock dispatch to capture actions
const makeMockDispatch = () => {
  const calls = [];
  const dispatch = (action) => calls.push(action);
  return { dispatch, calls };
};

// Minimal fake session
const fakeSession = {
  user: {
    id: 'user1',
    name: 'Test User',
    email: 'test@example.com',
  },
};

// Fake group
const fakeGroup = { _id: 'g1', grp_title: 'AirQo', grp_name: 'AirQo' };

// Mock APIs used by loginSetup
jest.mock('@/core/apis/Account', () => ({
  getUserDetails: jest
    .fn()
    .mockResolvedValue({
      users: [{ _id: 'user1', groups: [{ _id: 'g1', grp_title: 'AirQo' }] }],
    }),
  getUserGroupPermissionsApi: jest.fn().mockResolvedValue({ permissions: [] }),
}));

jest.mock('@/core/apis/Organizations', () => ({
  getOrganizationThemePreferencesApi: jest
    .fn()
    .mockResolvedValue({ theme: null }),
}));

jest.mock('@/lib/store/services/account/UserDefaultsSlice', () => ({
  getIndividualUserPreferences: jest.fn(() => ({ type: 'MOCK' })),
}));

jest.mock('@/lib/logger', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

jest.mock(
  '@/lib/store/services/organizationTheme/OrganizationThemeSlice',
  () => ({
    setOrganizationTheme: (t) => ({ type: 'SET_ORG_THEME', payload: t }),
    setOrganizationThemeLoading: (b) => ({
      type: 'SET_ORG_THEME_LOADING',
      payload: b,
    }),
    setOrganizationThemeError: (e) => ({
      type: 'SET_ORG_THEME_ERROR',
      payload: e,
    }),
    clearOrganizationTheme: () => ({ type: 'CLEAR_ORG_THEME' }),
  }),
);

jest.mock('@/lib/store/services/permissions/PermissionsSlice', () => ({
  setPermissionsData: (p) => ({ type: 'SET_PERMS', payload: p }),
  setPermissionsError: (e) => ({ type: 'SET_PERMS_ERROR', payload: e }),
  clearPermissions: () => ({ type: 'CLEAR_PERMS' }),
}));

jest.mock('@/lib/store/services/charts/ChartSlice', () => ({
  setChartSites: (s) => ({ type: 'SET_CHART_SITES', payload: s }),
}));

jest.mock('@/lib/store/services/groups', () => ({
  setUserGroups: (g) => ({ type: 'SET_USER_GROUPS', payload: g }),
  setActiveGroup: (g) => ({ type: 'SET_ACTIVE_GROUP', payload: g }),
}));

jest.mock('@/lib/store/services/account/LoginSlice', () => ({
  setUserInfo: (u) => ({ type: 'SET_USER_INFO', payload: u }),
  setSuccess: (s) => ({ type: 'SET_SUCCESS', payload: s }),
  setError: (e) => ({ type: 'SET_ERROR', payload: e }),
}));

// Minimal test: provide userGroups directly and assert setActiveGroup dispatched immediately
test('setupUserSession sets active group when userGroups provided', async () => {
  const { dispatch, calls } = makeMockDispatch();

  const result = await setupUserSession(fakeSession, dispatch, '/', {
    userGroups: [fakeGroup],
  });

  expect(result.success).toBe(true);
  // Find SET_ACTIVE_GROUP in calls
  const hasActiveGroup = calls.some((c) => c && c.type === 'SET_ACTIVE_GROUP');
  expect(hasActiveGroup).toBe(true);
});
