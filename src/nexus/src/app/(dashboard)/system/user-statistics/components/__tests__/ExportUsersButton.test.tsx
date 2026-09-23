import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ExportUsersButton from '../ExportUsersButton';
import { toast } from '@/shared/components/ui';
import { userService } from '@/shared/services/userService';
import type { UserStatsExportResponse } from '@/shared/types/api';

// flowbite-react ships ESM-only and cannot be parsed by ts-jest (same stub as
// the ChartContainer tests); the barrel re-exports components that use its
// Tooltip, so it must be stubbed before the barrel can be requireActual'd.
jest.mock('flowbite-react', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Shared UI Button uses the Next router; no router exists in unit tests.
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

// Keep the real UI components (Button, DropdownMenu, ...) but intercept the
// toast export so assertions can be made against it.
jest.mock('@/shared/components/ui', () => ({
  ...jest.requireActual('@/shared/components/ui'),
  toast: {
    success: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    warning: jest.fn(),
  },
}));

// The repo-level manual axios mock (src/__mocks__/axios.ts) has no `isCancel`;
// the component only uses `axios.isCancel`, so provide it with axios's real
// semantics (checks the `__CANCEL__` marker) for this test file.
jest.mock('axios', () => ({
  __esModule: true,
  default: {
    isCancel: (value: unknown): boolean =>
      !!value &&
      typeof value === 'object' &&
      (value as { __CANCEL__?: unknown }).__CANCEL__ === true,
  },
}));

jest.mock('@/shared/services/userService', () => ({
  userService: {
    getUserStatsExport: jest.fn(),
  },
}));

const getUserStatsExportMock = userService.getUserStatsExport as jest.Mock;
const toastMock = toast as jest.Mocked<typeof toast>;

const buildResponse = (
  overrides: Partial<UserStatsExportResponse> = {}
): UserStatsExportResponse => ({
  success: true,
  message: 'ok',
  segment: 'total',
  total: 1,
  unsubscribed_total: 0,
  skip: 0,
  limit: 500,
  has_more: false,
  users: [
    {
      _id: 'u1',
      email: 'jane@airqo.africa',
      firstName: 'Jane',
      lastName: 'Doe',
    },
  ],
  ...overrides,
});

const stubDownload = () => {
  const createObjectURL = jest.fn().mockReturnValue('blob:mock-url');
  const revokeObjectURL = jest.fn();
  Object.defineProperty(URL, 'createObjectURL', {
    value: createObjectURL,
    configurable: true,
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    value: revokeObjectURL,
    configurable: true,
  });
  const clickSpy = jest
    .spyOn(HTMLAnchorElement.prototype, 'click')
    .mockImplementation(() => {});
  return { createObjectURL, revokeObjectURL, clickSpy };
};

const openMenuAndClick = async (itemName: string) => {
  fireEvent.click(screen.getByRole('button', { name: 'Export Total Users' }));
  const item = await screen.findByRole('menuitem', { name: itemName });
  fireEvent.click(item);
};

beforeEach(() => {
  getUserStatsExportMock.mockReset();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ExportUsersButton', () => {
  it('exports email-ready users when the menu item is clicked', async () => {
    const { createObjectURL, clickSpy } = stubDownload();
    getUserStatsExportMock.mockResolvedValueOnce(
      buildResponse({
        total: 1200,
        unsubscribed_total: 37,
        has_more: false,
      })
    );

    render(<ExportUsersButton segment="total" segmentLabel="Total Users" />);

    await openMenuAndClick('Export email-ready');

    await waitFor(() =>
      expect(getUserStatsExportMock).toHaveBeenCalledTimes(1)
    );
    expect(getUserStatsExportMock).toHaveBeenCalledWith(
      expect.objectContaining({
        segment: 'total',
        excludeUnsubscribed: true,
      })
    );
    await waitFor(() => expect(clickSpy).toHaveBeenCalledTimes(1));
    expect(createObjectURL).toHaveBeenCalledTimes(1);
    expect(toastMock.success).toHaveBeenCalledWith(
      'Exported 1,200 users',
      '37 unsubscribed user(s) excluded'
    );
    expect(toastMock.error).not.toHaveBeenCalled();
  });

  it('exports all users (excludeUnsubscribed falsy) via "Export all"', async () => {
    stubDownload();
    getUserStatsExportMock.mockResolvedValueOnce(buildResponse());

    render(<ExportUsersButton segment="total" segmentLabel="Total Users" />);

    await openMenuAndClick('Export all');

    await waitFor(() =>
      expect(getUserStatsExportMock).toHaveBeenCalledTimes(1)
    );
    expect(getUserStatsExportMock).toHaveBeenCalledWith(
      expect.objectContaining({ excludeUnsubscribed: false })
    );
  });

  it('shows an info toast and does not download when there are no users', async () => {
    const { createObjectURL } = stubDownload();
    getUserStatsExportMock.mockResolvedValueOnce(
      buildResponse({
        total: 0,
        unsubscribed_total: 12,
        users: [],
      })
    );

    render(<ExportUsersButton segment="total" segmentLabel="Total Users" />);

    await openMenuAndClick('Export email-ready');

    await waitFor(() => expect(toastMock.info).toHaveBeenCalledTimes(1));
    expect(toastMock.info).toHaveBeenCalledWith(
      'No users to export',
      'All users in this segment have unsubscribed from emails.'
    );
    expect(createObjectURL).not.toHaveBeenCalled();
    expect(toastMock.success).not.toHaveBeenCalled();
  });

  it('shows an error toast when the export request fails', async () => {
    stubDownload();
    getUserStatsExportMock.mockRejectedValueOnce(new Error('boom'));

    render(<ExportUsersButton segment="total" segmentLabel="Total Users" />);

    await openMenuAndClick('Export email-ready');

    await waitFor(() => expect(toastMock.error).toHaveBeenCalledTimes(1));
    expect(toastMock.error).toHaveBeenCalledWith('Export failed', 'boom');
    expect(toastMock.success).not.toHaveBeenCalled();
  });

  it('does not surface a failure when the request is cancelled', async () => {
    stubDownload();
    const cancelledError = new Error('canceled');
    cancelledError.name = 'CanceledError';
    getUserStatsExportMock.mockRejectedValueOnce(cancelledError);

    render(<ExportUsersButton segment="total" segmentLabel="Total Users" />);

    await openMenuAndClick('Export email-ready');

    // The finally block re-enables the trigger once the export settles —
    // only then is it safe to assert that no toast fired.
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Export Total Users' })
      ).not.toBeDisabled()
    );
    expect(toastMock.error).not.toHaveBeenCalled();
    expect(toastMock.info).not.toHaveBeenCalled();
    expect(toastMock.success).not.toHaveBeenCalled();
  });
});
