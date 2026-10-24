import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Button (pulled in by the ui barrel) measures the viewport; jsdom cannot.
jest.mock('react-responsive', () => ({
  useMediaQuery: () => false,
}));

jest.mock('@airqo/icons-react', () => {
  const IconStub = () => null;
  const base = { __esModule: true };
  return new Proxy(base, {
    get: (target, prop) => {
      if (typeof prop !== 'string') return undefined;
      return prop in target
        ? (target as Record<string, unknown>)[prop]
        : IconStub;
    },
  });
});

// Stub the portal-based Dialog so its children and footer actions render
// inline (and are reachable by role queries) in jsdom.
jest.mock('@/shared/components/ui/dialog', () => {
  interface MockAction {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  }

  const MockDialog = ({
    isOpen,
    title,
    subtitle,
    children,
    primaryAction,
    secondaryAction,
  }: {
    isOpen: boolean;
    title?: string;
    subtitle?: string;
    children: React.ReactNode;
    primaryAction?: MockAction;
    secondaryAction?: MockAction;
  }) =>
    isOpen ? (
      <div role="dialog" aria-label={title}>
        {title && <h2>{title}</h2>}
        {subtitle && <p>{subtitle}</p>}
        {children}
        {secondaryAction && (
          <button
            type="button"
            onClick={secondaryAction.onClick}
            disabled={secondaryAction.disabled}
          >
            {secondaryAction.label}
          </button>
        )}
        {primaryAction && (
          <button
            type="button"
            onClick={primaryAction.onClick}
            disabled={primaryAction.disabled || primaryAction.loading}
          >
            {primaryAction.label}
          </button>
        )}
      </div>
    ) : null;

  return { __esModule: true, default: MockDialog };
});

import DeleteOrganizationDialog from '../components/DeleteOrganizationDialog';

const GROUP_TITLE = 'Kampala Clean Air';

const renderDialog = (
  overrides: Partial<React.ComponentProps<typeof DeleteOrganizationDialog>> = {}
) => {
  const onConfirm = jest.fn();
  const onClose = jest.fn();

  render(
    <DeleteOrganizationDialog
      isOpen
      groupTitle={GROUP_TITLE}
      isDeleting={false}
      error={null}
      onClose={onClose}
      onConfirm={onConfirm}
      {...overrides}
    />
  );

  return { onConfirm, onClose };
};

// The component swaps the confirm label to "Deleting…" while the delete is in
// flight, so the helper has to match both states to reach the same button.
const getConfirmButton = () =>
  screen.getByRole('button', { name: /delete organization|deleting/i });

describe('DeleteOrganizationDialog', () => {
  it('keeps the confirm action disabled until the exact title is typed', async () => {
    const user = userEvent.setup();
    const { onConfirm } = renderDialog();

    const confirmButton = getConfirmButton();
    expect(confirmButton).toBeDisabled();

    const input = screen.getByRole('textbox');
    await user.type(input, 'Kampala Clean');
    expect(confirmButton).toBeDisabled();

    await user.type(input, ' Air');
    expect(confirmButton).toBeEnabled();

    await user.click(confirmButton);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('does not enable the confirm action for a near-miss title', async () => {
    const user = userEvent.setup();
    renderDialog();

    await user.type(screen.getByRole('textbox'), 'kampala clean air');
    expect(getConfirmButton()).toBeDisabled();
  });

  it('renders the backend error inline (501 message)', () => {
    renderDialog({ error: 'Group deletion temporarily disabled' });

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Group deletion temporarily disabled');
    // The dialog stays open with the error visible instead of closing.
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(getConfirmButton()).toBeDisabled();
  });

  it('disables the confirm action while deleting', () => {
    renderDialog({ isDeleting: true });
    expect(getConfirmButton()).toBeDisabled();
  });

  it('closes through the secondary action', async () => {
    const user = userEvent.setup();
    const { onClose } = renderDialog();

    await user.click(screen.getByRole('button', { name: /^cancel$/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
