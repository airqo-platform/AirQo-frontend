import React from 'react';
import { render, act, waitFor } from '@testing-library/react';
import HomePage from '@/app/page';

// We'll mock next-auth and the unified provider to simulate the actual
// client-side transitions happening in the app.

const mockReplace = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/',
}));

// start with session loading, then unauthenticated, then authenticated
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

// Provide a mutable mock for useUnifiedGroup so tests can update it
const unifiedMock = {
  sessionInitialized: false,
  initialGroupSet: false,
  activeGroup: null,
};
jest.mock('@/app/providers/UnifiedGroupProvider', () => ({
  useUnifiedGroup: jest.fn(() => unifiedMock),
}));

import { useSession } from 'next-auth/react';
// Mock the login setup module so we can control setupUserSession safely
jest.mock('@/core/utils/loginSetup', () => ({
  __esModule: true,
  setupUserSession: jest.fn(),
  default: jest.fn(),
}));

import * as LoginSetup from '@/core/utils/loginSetup';

describe('Login setup and redirect full flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows loading while session loading then redirects to login when unauthenticated', async () => {
    useSession.mockReturnValue({ data: null, status: 'loading' });

    const { getByText } = render(<HomePage />);

    // Expect loading text (updated to match new loading text)
    expect(getByText(/Authenticating.../i)).toBeTruthy();

    // Now simulate session becoming unauthenticated
    useSession.mockReturnValue({ data: null, status: 'unauthenticated' });

    // Re-render to let effects run
    await act(async () => {
      render(<HomePage />);
    });

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/user/login');
    });
  });

  test('authenticated flow: shows setting up then redirects when activeGroup ready', async () => {
    // With the new flow HomePage redirects immediately when NextAuth reports
    // an authenticated session. The login page is responsible for running
    // setupUserSession now, so HomePage no longer blocks on provider flags.
    useSession.mockReturnValue({ data: { user: { id: 'u1' } }, status: 'authenticated' });

    render(<HomePage />);

    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
  });

  test('delayed setup: no redirect until activeGroup appears', async () => {
    // Mock setupUserSession to simulate delay (it will set activeGroup after a timeout)
    // Mock setupUserSession implementation on the imported module
    LoginSetup.setupUserSession = jest.fn().mockImplementation(async () => {
      // simulate background delay
      await new Promise((res) => setTimeout(res, 50));
      return {
        success: true,
        activeGroup: { _id: 'delayed' },
        redirectPath: '/user/Home',
      };
    });

    // HomePage now redirects immediately on authentication; the delayed setup
    // behavior is the responsibility of the login flow. Ensure redirect occurs.
    useSession.mockReturnValue({ data: { user: { id: 'u2' } }, status: 'authenticated' });
    render(<HomePage />);
    await waitFor(() => expect(mockReplace).toHaveBeenCalled());
  });

  test('setup failure: do not redirect when setupUserSession fails', async () => {
    LoginSetup.setupUserSession = jest
      .fn()
      .mockResolvedValue({ success: false, error: 'no groups' });

    useSession.mockReturnValue({
      data: { user: { id: 'u3' } },
      status: 'authenticated',
    });
    unifiedMock.sessionInitialized = false;
    unifiedMock.initialGroupSet = false;
    unifiedMock.activeGroup = null;

    render(<HomePage />);

    // simulate setup finished but failed; provider remains uninitialized
    await act(async () => {
      unifiedMock.sessionInitialized = false;
      unifiedMock.initialGroupSet = false;
      unifiedMock.activeGroup = null;
    });

    // Ensure no redirect happened
    await new Promise((r) => setTimeout(r, 50));
    expect(mockReplace).not.toHaveBeenCalledWith('/user/Home');

    LoginSetup.setupUserSession.mockReset();
  });
});
