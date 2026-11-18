import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@/test/utils/renderWithProviders';

// The provider's identity rules: no identify while a logout is in progress, and an organisation
// only once the Redux state belongs to the signed-in user.

const mocks = vi.hoisted(() => ({
  identifyUser: vi.fn(),
  resetAnalytics: vi.fn(),
  setActiveOrganization: vi.fn(),
  trackEvent: vi.fn(),
  trackPageview: vi.fn(),
  consumePendingSignIn: vi.fn(() => null),
}));

vi.mock('next/navigation', () => ({ usePathname: () => '/home' }));
vi.mock('next-auth/react', () => ({
  useSession: () => ({ status: 'authenticated', data: { user: { id: 'user-1' } } }),
}));
vi.mock('@/lib/analytics', () => mocks);

import { AnalyticsProvider } from './analytics-provider';

const group = { _id: 'org-1', grp_title: 'City Network' };

describe('AnalyticsProvider', () => {
  beforeEach(() => vi.clearAllMocks());

  it('identifies the signed-in user and applies their organisation', () => {
    renderWithProviders(<AnalyticsProvider />, {
      preloadedState: {
        user: { isLoggingOut: false, userDetails: { _id: 'user-1', privilege: 'user' }, activeGroup: group, userContext: 'external-org' },
      },
    });

    expect(mocks.identifyUser).toHaveBeenCalledWith({ id: 'user-1', privilege: 'user', country: undefined });
    expect(mocks.setActiveOrganization).toHaveBeenCalledWith({ id: 'org-1', title: 'City Network' }, 'external-org');
  });

  it("doesn't identify anyone while a logout is in progress", () => {
    renderWithProviders(<AnalyticsProvider />, {
      preloadedState: {
        user: { isLoggingOut: true, userDetails: null, activeGroup: group, userContext: null },
      },
    });

    expect(mocks.identifyUser).not.toHaveBeenCalled();
    expect(mocks.setActiveOrganization).not.toHaveBeenCalled();
  });

  it("doesn't attach another account's organisation from persisted state", () => {
    renderWithProviders(<AnalyticsProvider />, {
      preloadedState: {
        user: { isLoggingOut: false, userDetails: { _id: 'previous-user' }, activeGroup: group, userContext: 'external-org' },
      },
    });

    expect(mocks.identifyUser).toHaveBeenCalledWith({ id: 'user-1', privilege: undefined, country: undefined });
    expect(mocks.setActiveOrganization).toHaveBeenCalledWith(null, null);
  });
});
