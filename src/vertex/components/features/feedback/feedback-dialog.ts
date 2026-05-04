export const FEEDBACK_DIALOG_OPEN_EVENT = 'airqo:feedback:open';

export const openFeedbackDialog = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(FEEDBACK_DIALOG_OPEN_EVENT));
};
