jest.mock('loglevel', () => {
  const levels = { TRACE: 0, DEBUG: 1, INFO: 2, WARN: 3, ERROR: 4, SILENT: 5 };
  return {
    levels,
    setLevel: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  };
});

import log from 'loglevel';

import logger, {
  getSlackDedupeKeysForTests,
  resetSlackDedupeForTests,
  SLACK_DEDUPE_MAX_KEYS,
} from '@/lib/utils/logger';

/**
 * Drains the fire-and-forget promise chains inside logger methods so the
 * (mocked) fetch calls have happened by the time we assert.
 */
const flush = async () => {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
};

describe('logger Slack dedupe', () => {
  const originalNodeEnv = process.env.NODE_ENV;
  const originalFetch = global.fetch;
  const mutableEnv = process.env as { NODE_ENV?: string };
  let fetchMock: jest.Mock;
  let dateNowSpy: jest.SpyInstance | null = null;

  beforeEach(() => {
    resetSlackDedupeForTests();
    jest.clearAllMocks();

    fetchMock = jest.fn().mockResolvedValue({ ok: true, statusText: 'OK' });
    (global as any).fetch = fetchMock;
    // sendToSlack only fires in production
    mutableEnv.NODE_ENV = 'production';
  });

  afterEach(() => {
    mutableEnv.NODE_ENV = originalNodeEnv;
    if (originalFetch === undefined) {
      delete (global as any).fetch;
    } else {
      (global as any).fetch = originalFetch;
    }
    if (dateNowSpy) {
      dateNowSpy.mockRestore();
      dateNowSpy = null;
    }
  });

  it('sends identical warn messages to Slack once within the window, but still logs every occurrence to console', async () => {
    logger.warn('No forum event found', { uniqueTitle: 'about' });
    await flush();
    logger.warn('No forum event found', { uniqueTitle: 'about' });
    await flush();
    logger.warn('No forum event found', { uniqueTitle: 'about' });
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(log.warn).toHaveBeenCalledTimes(3);
  });

  it('sends warn messages with different contexts separately', async () => {
    logger.warn('No forum event found', { uniqueTitle: 'about' });
    await flush();
    logger.warn('No forum event found', { uniqueTitle: 'programme' });
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not collapse logs whose circular contexts differ', async () => {
    // Regression: stableStringify used to return '' for unserializable
    // contexts, so unrelated errors with circular contexts shared one dedupe
    // key and suppressed each other for the whole window.
    const makeContext = (detail: string) => {
      const context: Record<string, unknown> = { detail };
      context.self = context; // circular reference
      return context;
    };

    logger.warn('circular context failure', makeContext('alpha'));
    await flush();
    logger.warn('circular context failure', makeContext('beta'));
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('sends different messages separately', async () => {
    logger.warn('first message');
    await flush();
    logger.warn('second message');
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('treats the same message at different levels as distinct', async () => {
    const error = new Error('boom');
    logger.warn('something failed', { scope: 'x' });
    await flush();
    logger.error('something failed', error, { scope: 'x' });
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('treats the same message with different error names as distinct', async () => {
    const chunkError = new Error('Loading chunk 9408 failed.');
    chunkError.name = 'ChunkLoadError';
    const plainError = new Error('Loading chunk 9408 failed.');

    logger.error('React Error Boundary caught an error', chunkError);
    await flush();
    logger.error('React Error Boundary caught an error', plainError);
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('treats errors with the same name but different messages as distinct', async () => {
    const firstError = new Error('first failure detail');
    firstError.name = 'ChunkLoadError';
    const secondError = new Error('second failure detail');
    secondError.name = 'ChunkLoadError';

    logger.error('React Error Boundary caught an error', firstError);
    await flush();
    logger.error('React Error Boundary caught an error', secondError);
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries after a failed (non-ok) Slack delivery within the window', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    fetchMock.mockResolvedValue({ ok: false, statusText: 'Server Error' });

    logger.warn('flaky delivery');
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // The failed delivery's dedupe entry was cleaned up
    expect(getSlackDedupeKeysForTests()).toHaveLength(0);

    // An identical call inside the 60s window still posts
    logger.warn('flaky delivery');
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getSlackDedupeKeysForTests()).toHaveLength(0);

    consoleErrorSpy.mockRestore();
  });

  it('retries after a rejected Slack delivery within the window', async () => {
    const consoleErrorSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    fetchMock.mockRejectedValue(new Error('network down'));

    logger.error('network blip');
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // The rejected delivery's dedupe entry was cleaned up
    expect(getSlackDedupeKeysForTests()).toHaveLength(0);

    // An identical call inside the 60s window still posts
    logger.error('network blip');
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(getSlackDedupeKeysForTests()).toHaveLength(0);

    consoleErrorSpy.mockRestore();
  });

  it('re-sends after the 60s window expires', async () => {
    dateNowSpy = jest.spyOn(Date, 'now').mockReturnValue(1_000_000);

    logger.warn('recurring warning');
    await flush();
    logger.warn('recurring warning');
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);

    // Advance past the 60s dedupe window
    dateNowSpy.mockReturnValue(1_000_000 + 60_001);
    logger.warn('recurring warning');
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('never sends info/debug levels to Slack regardless of duplicates', async () => {
    logger.info('info message');
    logger.debug('debug message');
    logger.info('info message');
    logger.debug('debug message');
    await flush();

    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('enforces a hard cap: distinct messages still post and the oldest key is evicted', async () => {
    // Fill the cache to its cap with distinct, unexpired (all within the 60s
    // window) messages — every one of them must still reach Slack. Dedupe
    // bookkeeping and the fetch call happen synchronously inside warn(), so
    // a single flush after the burst is enough.
    for (let i = 0; i < SLACK_DEDUPE_MAX_KEYS; i += 1) {
      logger.warn(`burst warning ${i}`);
    }
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(SLACK_DEDUPE_MAX_KEYS);
    let keys = getSlackDedupeKeysForTests();
    expect(keys.length).toBe(SLACK_DEDUPE_MAX_KEYS);
    const oldestKey = keys[0];
    expect(oldestKey).toContain('burst warning 0');

    // One more distinct message must still post (the cap never suppresses
    // new distinct errors) and must evict the oldest entry unconditionally.
    logger.warn('burst warning overflow');
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(SLACK_DEDUPE_MAX_KEYS + 1);
    keys = getSlackDedupeKeysForTests();
    expect(keys.length).toBe(SLACK_DEDUPE_MAX_KEYS);
    expect(keys).not.toContain(oldestKey);
    expect(keys[keys.length - 1]).toContain('burst warning overflow');
  });
});
