import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderHookWithProviders } from '@/test/utils/renderHookWithProviders';

// What a sign-out does to analytics: the event only once it went through, a reset either way, and
// the logout flag kept set while the page navigates away so the user isn't identified again.

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  purge: vi.fn(),
  trackEvent: vi.fn(),
  resetAnalytics: vi.fn(),
}));

vi.mock('next-auth/react', () => ({ signOut: mocks.signOut }));
vi.mock('next/navigation', () => ({ usePathname: () => '/home' }));
vi.mock('../redux/store', () => ({ persistor: { purge: mocks.purge } }));
vi.mock('../utils/sessionManager', () => ({ clearSessionData: vi.fn() }));
vi.mock('../utils/secureApiProxyClient', () => ({ clearTokenCache: vi.fn() }));
vi.mock('@/lib/track', () => ({ trackEvent: mocks.trackEvent, resetAnalytics: mocks.resetAnalytics }));

import { useLogout } from './useLogout';

const signedInState = {
  user: {
    isAuthenticated: true,
    isLoggingOut: false,
    userDetails: { _id: 'user-1', email: 'someone@example.com', firstName: 'Some', lastName: 'One' },
  },
};

describe('useLogout and analytics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.purge.mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('records a confirmed sign-out once it has gone through, then resets', async () => {
    mocks.signOut.mockResolvedValue(undefined);
    const { result } = renderHookWithProviders(() => useLogout(), { preloadedState: signedInState });

    await act(() => result.current({ userInitiated: true }));

    expect(mocks.trackEvent).toHaveBeenCalledWith('user_signed_out', {}, { sendNow: true });
    expect(mocks.resetAnalytics).toHaveBeenCalledTimes(1);
    expect(mocks.trackEvent.mock.invocationCallOrder[0]).toBeLessThan(
      mocks.resetAnalytics.mock.invocationCallOrder[0]
    );
  });

  it("doesn't record an automatic sign-out, but still resets", async () => {
    mocks.signOut.mockResolvedValue(undefined);
    const { result } = renderHookWithProviders(() => useLogout(), { preloadedState: signedInState });

    await act(() => result.current());

    expect(mocks.trackEvent).not.toHaveBeenCalled();
    expect(mocks.resetAnalytics).toHaveBeenCalledTimes(1);
  });

  it('keeps the logout flag set when the sign-out fails, and records nothing', async () => {
    mocks.signOut.mockRejectedValue(new Error('network'));
    const { result, store } = renderHookWithProviders(() => useLogout(), { preloadedState: signedInState });

    await act(() => result.current({ userInitiated: true }));

    expect(mocks.trackEvent).not.toHaveBeenCalled();
    expect(mocks.resetAnalytics).toHaveBeenCalledTimes(1);
    expect(store.getState().user.isLoggingOut).toBe(true);
  });
});
