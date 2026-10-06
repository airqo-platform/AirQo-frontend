export const FEEDBACK_DIALOG_OPEN_EVENT = 'airqo:feedback:open';

export interface FeedbackDialogOpenDetail {
  /** Where the dialog was opened from, e.g. the title of the dialog hosting the "?" button. */
  source?: string;
}

export const openFeedbackDialog = (source?: unknown): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(
    new CustomEvent<FeedbackDialogOpenDetail>(FEEDBACK_DIALOG_OPEN_EVENT, {
      // Guard the type so callers can pass this directly as an event handler
      // without a MouseEvent leaking in as the source.
      detail: { source: typeof source === 'string' ? source : undefined },
    })
  );
};
