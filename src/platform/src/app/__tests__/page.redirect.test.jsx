import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePage from '@/app/page';

const mockReplace = jest.fn();

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => '/',
}));

jest.mock('@/app/providers/UnifiedGroupProvider', () => ({
  useUnifiedGroup: jest.fn(),
}));

import { useSession } from 'next-auth/react';
import { useUnifiedGroup } from '@/app/providers/UnifiedGroupProvider';

describe('Root page redirect behavior', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('redirects to login for unauthenticated users', async () => {
    useSession.mockReturnValue({ data: null, status: 'unauthenticated' });
    useUnifiedGroup.mockReturnValue({
      sessionInitialized: false,
      initialGroupSet: false,
      activeGroup: null,
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalledWith('/user/login');
    });
  });

  test('redirects to user home when authenticated and activeGroup present', async () => {
    useSession.mockReturnValue({
      data: { user: { id: 'u1' } },
      status: 'authenticated',
    });
    useUnifiedGroup.mockReturnValue({
      sessionInitialized: true,
      initialGroupSet: true,
      activeGroup: { _id: 'g1' },
    });

    render(<HomePage />);

    await waitFor(() => {
      expect(mockReplace).toHaveBeenCalled();
    });
  });
});
