jest.mock('react-redux', () => ({
  useDispatch: () => jest.fn(),
}));
jest.mock('posthog-js/react', () => ({
  usePostHog: () => undefined,
}));
jest.mock('@/shared/hooks/useAnalytics', () => ({
  useDownloadData: () => ({ trigger: jest.fn(), isMutating: false }),
}));
jest.mock('@/shared/store/insightsSlice', () => ({
  openMoreInsights: jest.fn(),
}));
jest.mock('@/shared/components/ui/toast', () => ({
  toast: { error: jest.fn(), success: jest.fn() },
}));
jest.mock('@/shared/utils/errorMessages', () => ({
  getUserFriendlyErrorMessage: jest.fn(),
}));
jest.mock('@/shared/utils/analytics', () => ({
  trackEvent: jest.fn(),
}));
jest.mock('@/shared/utils/enhancedAnalytics', () => ({
  trackFeatureUsage: jest.fn(),
}));
jest.mock('@/shared/components/calendar/types', () => ({}));

import { shouldUseMetadataFallback } from '../useDataExportActions';

describe('shouldUseMetadataFallback', () => {
  it('never falls back on 5xx server errors — they surface to the user', () => {
    expect(shouldUseMetadataFallback({ response: { status: 502 } })).toBe(
      false
    );
    expect(shouldUseMetadataFallback({ response: { status: 503 } })).toBe(
      false
    );
    expect(shouldUseMetadataFallback({ response: { status: 500 } })).toBe(
      false
    );
  });

  it('falls back for an explicit "no data" error message', () => {
    expect(
      shouldUseMetadataFallback(
        new Error('No data available for the selected period')
      )
    ).toBe(true);
  });

  it('falls back on 404 — nothing to export for that selection', () => {
    expect(shouldUseMetadataFallback({ response: { status: 404 } })).toBe(true);
  });

  it('does not fall back on auth failures or cancelled requests', () => {
    expect(shouldUseMetadataFallback({ response: { status: 401 } })).toBe(
      false
    );
    expect(shouldUseMetadataFallback({ response: { status: 403 } })).toBe(
      false
    );
    expect(shouldUseMetadataFallback({ code: 'ERR_CANCELED' })).toBe(false);
  });
});
