import type { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { SWRConfig } from 'swr';
import {
  NOTIFICATIONS_INBOX_QUERY_KEY,
  NOTIFICATIONS_UNREAD_QUERY_KEY,
} from '../../services/notificationService';
import { useRequestGroupAccess } from '../useGroups';

const mockRequestGroupAccess = jest.fn();
const mockInvalidateQueries = jest.fn().mockResolvedValue(undefined);

jest.mock('../../services/userService', () => ({
  userService: {
    requestGroupAccess: (...args: unknown[]) => mockRequestGroupAccess(...args),
  },
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: (...args: unknown[]) => mockInvalidateQueries(...args),
  }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map() }}>{children}</SWRConfig>
);

describe('useRequestGroupAccess', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockRequestGroupAccess.mockResolvedValue({
      success: true,
      message: 'Request submitted',
    });
  });

  it('refreshes notification queries after a successful request', async () => {
    const { result } = renderHook(() => useRequestGroupAccess('user-1'), {
      wrapper,
    });

    await act(async () => {
      await result.current.trigger({ groupId: 'group-2' });
    });

    expect(mockRequestGroupAccess).toHaveBeenCalledWith('group-2');
    expect(mockInvalidateQueries).toHaveBeenNthCalledWith(1, {
      queryKey: NOTIFICATIONS_UNREAD_QUERY_KEY,
    });
    expect(mockInvalidateQueries).toHaveBeenNthCalledWith(2, {
      queryKey: NOTIFICATIONS_INBOX_QUERY_KEY,
    });
  });
});
