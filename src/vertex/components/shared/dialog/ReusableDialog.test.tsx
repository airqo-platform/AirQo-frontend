import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ReusableDialog from './ReusableDialog';
import { FEEDBACK_DIALOG_OPEN_EVENT } from '@/components/features/feedback/feedback-dialog';

vi.mock('@/context/banner-context', () => ({
  BannerSlot: () => null,
  useBanner: () => ({ hideBanner: vi.fn(), showBanner: vi.fn() }),
}));

describe('ReusableDialog feedback button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows the feedback button by default and dispatches the open event with the dialog title as source', () => {
    const listener = vi.fn();
    window.addEventListener(FEEDBACK_DIALOG_OPEN_EVENT, listener);

    render(
      <ReusableDialog isOpen onClose={() => {}} title="Deploy Device">
        content
      </ReusableDialog>
    );

    const feedbackButton = screen.getByRole('button', {
      name: 'Report an issue or share feedback',
    });
    fireEvent.click(feedbackButton);

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0][0] as CustomEvent;
    expect(event.detail).toEqual({ source: 'Deploy Device' });

    window.removeEventListener(FEEDBACK_DIALOG_OPEN_EVENT, listener);
  });

  it('hides the feedback button when showFeedbackButton is false', () => {
    render(
      <ReusableDialog
        isOpen
        onClose={() => {}}
        title="Send feedback to AirQo"
        showFeedbackButton={false}
      >
        content
      </ReusableDialog>
    );

    expect(
      screen.queryByRole('button', { name: 'Report an issue or share feedback' })
    ).toBeNull();
  });

  it('closes only the topmost dialog on Escape when dialogs are stacked', () => {
    const onCloseBottom = vi.fn();
    const onCloseTop = vi.fn();

    render(
      <>
        <ReusableDialog isOpen onClose={onCloseBottom} title="Underlying dialog">
          bottom
        </ReusableDialog>
        <ReusableDialog isOpen onClose={onCloseTop} title="Feedback dialog">
          top
        </ReusableDialog>
      </>
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onCloseTop).toHaveBeenCalledTimes(1);
    expect(onCloseBottom).not.toHaveBeenCalled();
  });
});
