/**
 * Copy text using the asynchronous Clipboard API when available, with a
 * legacy DOM fallback for browsers or contexts that do not expose it.
 */
export const copyTextToClipboard = async (text: string): Promise<void> => {
  if (!text) {
    throw new Error('Cannot copy empty text');
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      // Fall back to the synchronous DOM API when clipboard permissions or
      // secure-context requirements prevent the async API from succeeding.
    }
  }

  if (typeof document === 'undefined' || !document.body) {
    throw new Error('Clipboard is unavailable');
  }

  const textArea = document.createElement('textarea');
  textArea.value = text;
  textArea.setAttribute('readonly', '');
  textArea.setAttribute('aria-hidden', 'true');
  textArea.style.position = 'fixed';
  textArea.style.top = '0';
  textArea.style.left = '-9999px';
  textArea.style.opacity = '0';

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  textArea.setSelectionRange(0, textArea.value.length);

  try {
    if (!document.execCommand('copy')) {
      throw new Error('Copy command was rejected');
    }
  } finally {
    textArea.remove();
  }
};
