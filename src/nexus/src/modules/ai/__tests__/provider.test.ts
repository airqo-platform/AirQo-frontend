/**
 * @jest-environment node
 */
import {
  createDevFallbackProvider,
  createOpenAICompatibleProvider,
} from '../server/provider';
import type { AiMessage } from '../types';

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Consume an AsyncIterable into an array. */
async function collect(iterable: AsyncIterable<string>): Promise<string[]> {
  const chunks: string[] = [];
  for await (const chunk of iterable) {
    chunks.push(chunk);
  }
  return chunks;
}

/** Build an SSE response body from an array of delta strings. */
function buildSseBody(chunks: string[], includeDone = true): string {
  const lines: string[] = [];
  for (const content of chunks) {
    const payload = JSON.stringify({
      choices: [{ delta: { content } }],
    });
    lines.push(`data: ${payload}\n\n`);
  }
  if (includeDone) {
    lines.push('data: [DONE]\n\n');
  }
  return lines.join('');
}

/**
 * Mock `global.fetch` to return a streaming Response built from SSE chunks.
 */
function mockFetchSse(
  chunks: string[],
  options?: { status?: number; contentType?: string }
) {
  const status = options?.status ?? 200;
  const contentType = options?.contentType ?? 'text/event-stream';

  const body = buildSseBody(chunks);
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(body));
      controller.close();
    },
  });

  global.fetch = jest.fn().mockResolvedValue(
    new Response(stream, {
      status,
      headers: { 'Content-Type': contentType },
    })
  );
}

/** Build a minimal config for tests. */
function makeConfig(overrides?: {
  agentUrl?: string;
  agentApiKey?: string;
  model?: string;
}) {
  return {
    agentUrl: 'https://api.example.com/v1',
    agentApiKey: 'sk-test-key',
    model: 'test-model',
    ...overrides,
  };
}

const TEST_MESSAGES: AiMessage[] = [
  { id: '1', role: 'user', content: 'What is the AQI at Kampala?' },
];

const TEST_SYSTEM =
  'You are AirQo Nexus AI Assistant. The user is viewing the Map page.';

/* -------------------------------------------------------------------------- */
/*  createDevFallbackProvider                                                  */
/* -------------------------------------------------------------------------- */

describe('createDevFallbackProvider', () => {
  it('yields multiple chunks and completes', async () => {
    const provider = createDevFallbackProvider();
    const chunks = await collect(
      provider.streamChat({
        messages: TEST_MESSAGES,
        system: TEST_SYSTEM,
      })
    );

    expect(chunks.length).toBeGreaterThan(1);
    const fullText = chunks.join('');
    expect(fullText).toContain('AI agent endpoint is configured');
  });

  it('mentions AI_AGENT_URL in the message', async () => {
    const provider = createDevFallbackProvider();
    const chunks = await collect(
      provider.streamChat({
        messages: TEST_MESSAGES,
        system: TEST_SYSTEM,
      })
    );

    const fullText = chunks.join('');
    expect(fullText).toContain('AI_AGENT_URL');
  });
});

/* -------------------------------------------------------------------------- */
/*  createOpenAICompatibleProvider                                             */
/* -------------------------------------------------------------------------- */

describe('createOpenAICompatibleProvider', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends the correct URL, auth header, and request body', async () => {
    const config = makeConfig();
    mockFetchSse(['Hello']);

    const provider = createOpenAICompatibleProvider(config);
    await collect(
      provider.streamChat({
        messages: TEST_MESSAGES,
        system: TEST_SYSTEM,
      })
    );

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (global.fetch as jest.Mock).mock.calls[0];

    expect(url).toBe('https://api.example.com/v1/chat/completions');
    expect(init.method).toBe('POST');
    expect(init.headers['Authorization']).toBe('Bearer sk-test-key');
    expect(init.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(init.body);
    expect(body.model).toBe('test-model');
    expect(body.stream).toBe(true);
    expect(body.messages[0]).toEqual({
      role: 'system',
      content: TEST_SYSTEM,
    });
    expect(body.messages[1]).toEqual({
      role: 'user',
      content: 'What is the AQI at Kampala?',
    });
  });

  it('omits Authorization header when no API key is provided', async () => {
    const config = makeConfig({ agentApiKey: '' });
    mockFetchSse(['Hello']);

    const provider = createOpenAICompatibleProvider(config);
    await collect(
      provider.streamChat({
        messages: TEST_MESSAGES,
        system: TEST_SYSTEM,
      })
    );

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.headers['Authorization']).toBeUndefined();
  });

  it('yields content chunks from SSE data lines', async () => {
    mockFetchSse(['Hello', ' ', 'World']);

    const provider = createOpenAICompatibleProvider(makeConfig());
    const chunks = await collect(
      provider.streamChat({
        messages: TEST_MESSAGES,
        system: TEST_SYSTEM,
      })
    );

    expect(chunks).toEqual(['Hello', ' ', 'World']);
  });

  it('stops parsing after [DONE]', async () => {
    // Build SSE manually with content after [DONE] — should be ignored
    const payload = [
      'data: {"choices":[{"delta":{"content":"A"}}]}\n\n',
      'data: [DONE]\n\n',
      'data: {"choices":[{"delta":{"content":"B"}}]}\n\n',
    ].join('');

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(payload));
        controller.close();
      },
    });

    global.fetch = jest.fn().mockResolvedValue(
      new Response(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      })
    );

    const provider = createOpenAICompatibleProvider(makeConfig());
    const chunks = await collect(
      provider.streamChat({
        messages: TEST_MESSAGES,
        system: TEST_SYSTEM,
      })
    );

    expect(chunks).toEqual(['A']);
  });

  it('skips malformed JSON lines without throwing', async () => {
    const payload = [
      'data: {"choices":[{"delta":{"content":"OK"}}]}\n\n',
      'data: not-valid-json\n\n',
      'data: {"choices":[{"delta":{"content":"!"}}]}\n\n',
      'data: [DONE]\n\n',
    ].join('');

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(payload));
        controller.close();
      },
    });

    global.fetch = jest.fn().mockResolvedValue(
      new Response(stream, {
        status: 200,
        headers: { 'Content-Type': 'text/event-stream' },
      })
    );

    const provider = createOpenAICompatibleProvider(makeConfig());
    const chunks = await collect(
      provider.streamChat({
        messages: TEST_MESSAGES,
        system: TEST_SYSTEM,
      })
    );

    expect(chunks).toEqual(['OK', '!']);
  });

  it('throws on non-200 response', async () => {
    const errorResponse = new Response('Unauthorized', { status: 401 });
    global.fetch = jest.fn().mockResolvedValue(errorResponse);

    const provider = createOpenAICompatibleProvider(makeConfig());

    await expect(
      collect(
        provider.streamChat({
          messages: TEST_MESSAGES,
          system: TEST_SYSTEM,
        })
      )
    ).rejects.toThrow('AI agent returned status 401');
  });

  it('passes the AbortSignal through to fetch', async () => {
    mockFetchSse(['OK']);
    const controller = new AbortController();

    const provider = createOpenAICompatibleProvider(makeConfig());
    await collect(
      provider.streamChat({
        messages: TEST_MESSAGES,
        system: TEST_SYSTEM,
        signal: controller.signal,
      })
    );

    const [, init] = (global.fetch as jest.Mock).mock.calls[0];
    expect(init.signal).toBe(controller.signal);
  });
});
