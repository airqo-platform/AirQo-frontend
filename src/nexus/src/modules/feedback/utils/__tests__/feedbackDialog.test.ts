import {
  FEEDBACK_DIALOG_OPEN_EVENT,
  openFeedbackDialog,
} from '../feedbackDialog';

describe('feedbackDialog', () => {
  it('FEEDBACK_DIALOG_OPEN_EVENT is the correct string', () => {
    expect(FEEDBACK_DIALOG_OPEN_EVENT).toBe('airqo:feedback:open');
  });

  it('openFeedbackDialog dispatches Event on window', () => {
    const handler = jest.fn();
    window.addEventListener(FEEDBACK_DIALOG_OPEN_EVENT, handler);
    openFeedbackDialog();
    expect(handler).toHaveBeenCalledTimes(1);
    window.removeEventListener(FEEDBACK_DIALOG_OPEN_EVENT, handler);
  });

  it('openFeedbackDialog is SSR-safe', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error testing SSR
    delete globalThis.window;
    expect(() => openFeedbackDialog()).not.toThrow();
    globalThis.window = originalWindow;
  });
});
