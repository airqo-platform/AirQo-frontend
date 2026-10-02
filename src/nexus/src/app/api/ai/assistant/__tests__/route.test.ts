/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '../route';

const mockGetServerSession = jest.fn();

jest.mock('next-auth/next', () => ({
  getServerSession: (...args: unknown[]) => mockGetServerSession(...args),
}));

jest.mock('@/shared/lib/auth', () => ({ authOptions: {} }));

jest.mock('@/shared/lib/rateLimit', () => ({
  checkRateLimit: jest.fn(() => ({ allowed: true, retryAfterMs: 0 })),
}));

jest.mock('@/modules/ai/server/config', () => ({
  isAiEnabled: () => true,
}));

type StreamFactory = () => AsyncIterable<string>;

/** Swapped per test — the mocked provider delegates to this. */
let mockStreamFactory: StreamFactory = async function* () {
  yield 'ok';
};

jest.mock('@/modules/ai/server/provider', () => ({
  getAiProvider: () => ({
    streamChat: () => mockStreamFactory(),
  }),
}));

const GENERIC_ERROR_MESSAGE =
  'The AI assistant encountered a problem. Please try again.';

const makeRequest = () =>
  new NextRequest('http://localhost:3000/api/ai/assistant', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'What is the AQI at Kampala?' }],
      feature: 'map',
    }),
  });

async function readEvents(response: Response) {
  const raw = await response.text();
  return raw
    .split('\n\n')
    .map(block => block.trim())
    .filter(block => block.startsWith('data: '))
    .map(block => JSON.parse(block.slice(6)) as Record<string, unknown>);
}

describe('/api/ai/assistant', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetServerSession.mockResolvedValue({ user: { _id: 'user-1' } });
    mockStreamFactory = async function* () {
      yield 'ok';
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends a generic error event and never the upstream body', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    mockStreamFactory = async function* () {
      // Worst case: an upstream-leaking message plus the status marker the
      // real provider attaches. The route must strip all of it client-side.
      const error = new Error(
        'AI agent returned status 502: SECRET_UPSTREAM_BODY api_key=sk-leaked'
      ) as Error & { status?: number };
      error.status = 502;
      throw error;
    };

    const response = await POST(makeRequest());
    const events = await readEvents(response);

    const errorEvents = events.filter(event => event.type === 'error');
    expect(errorEvents).toHaveLength(1);
    expect(errorEvents[0]?.message).toBe(GENERIC_ERROR_MESSAGE);

    const serialized = JSON.stringify(events);
    expect(serialized).not.toContain('SECRET_UPSTREAM_BODY');
    expect(serialized).not.toContain('sk-leaked');

    // Server-side log is sanitized: no message/payload in console output.
    const logged = consoleError.mock.calls
      .map(args => JSON.stringify(args))
      .join(' ');
    expect(logged).not.toContain('SECRET_UPSTREAM_BODY');
    expect(logged).not.toContain('sk-leaked');
    expect(logged).toContain('AI assistant stream failed');
    expect(logged).toContain('"status":502');
  });

  it('sends the generic error event when the failure carries no status', async () => {
    const consoleError = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    mockStreamFactory = async function* () {
      throw new Error('SECRET_UPSTREAM_BODY with no status attached');
    };

    const response = await POST(makeRequest());
    const events = await readEvents(response);

    expect(events).toEqual([{ type: 'error', message: GENERIC_ERROR_MESSAGE }]);

    const logged = JSON.stringify(consoleError.mock.calls);
    expect(logged).toContain('AI assistant stream failed');
    expect(logged).not.toContain('SECRET_UPSTREAM_BODY');
  });

  it('keeps normal streaming unchanged', async () => {
    mockStreamFactory = async function* () {
      yield 'Hello';
      yield ' world';
    };

    const response = await POST(makeRequest());
    const events = await readEvents(response);

    expect(events).toEqual([
      { type: 'delta', content: 'Hello' },
      { type: 'delta', content: ' world' },
      { type: 'done' },
    ]);
  });

  it('stays silent when the stream is aborted', async () => {
    mockStreamFactory = async function* () {
      throw new DOMException('The operation was aborted.', 'AbortError');
    };

    const response = await POST(makeRequest());
    const events = await readEvents(response);

    expect(events).toEqual([]);
  });
});
