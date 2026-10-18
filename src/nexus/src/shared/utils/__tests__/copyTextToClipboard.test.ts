import { copyTextToClipboard } from '../copyTextToClipboard';

describe('copyTextToClipboard', () => {
  const originalClipboard = navigator.clipboard;
  const originalExecCommand = document.execCommand;

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: originalClipboard,
    });
    document.execCommand = originalExecCommand;
    document.body.innerHTML = '';
  });

  it('uses the asynchronous Clipboard API when it succeeds', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });

    await copyTextToClipboard('api-token');

    expect(writeText).toHaveBeenCalledWith('api-token');
    expect(document.body).toBeEmptyDOMElement();
  });

  it('falls back to the DOM copy command when the async API fails', async () => {
    const writeText = jest.fn().mockRejectedValue(new Error('Denied'));
    const execCommand = jest.fn().mockReturnValue(true);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    document.execCommand = execCommand;

    await copyTextToClipboard('api-token');

    expect(writeText).toHaveBeenCalledWith('api-token');
    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(document.body).toBeEmptyDOMElement();
  });

  it('rejects when neither clipboard method succeeds', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: undefined,
    });
    document.execCommand = jest.fn().mockReturnValue(false);

    await expect(copyTextToClipboard('api-token')).rejects.toThrow(
      'Copy command was rejected'
    );
  });
});
