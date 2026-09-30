/**
 * @jest-environment node
 */
import { getAllowlistedAssistantAction } from '../actions';
import {
  createDevFallbackProvider,
  createOpenAICompatibleProvider,
  createPrototypeProvider,
  resolvePrototypeIntent,
  sanitizePrototypeContext,
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

describe('createPrototypeProvider', () => {
  it('returns contextual saved-location guidance and a safe map action', async () => {
    const messages: AiMessage[] = [
      { role: 'user', content: 'Summarize my saved locations' },
    ];
    const context = {
      savedLocations: [
        { name: 'Makerere University', aqiCategory: 'Good', aqiIndex: 42 },
      ],
    };
    const provider = createPrototypeProvider();
    const chunks = await collect(
      provider.streamChat({ messages, system: TEST_SYSTEM, context })
    );
    const action = provider.getAction?.({ messages, context });

    expect(chunks.join('')).toContain('Makerere University: Good');
    expect(action).toEqual({
      id: 'open-map',
      label: 'Open map',
      href: '/user/map',
    });
  });

  it('maps supported intents to allowlisted internal routes', () => {
    const cases = [
      [
        'How do I compare locations?',
        '/user/air-quality/analytics?view=comparison',
      ],
      ['Help me export data as CSV', '/user/data-export'],
      ['Visualize my uploaded dataset', '/user/data-visualizer'],
      ['Compare city rankings', '/user/air-quality/rankings'],
    ];

    cases.forEach(([content, expectedHref]) => {
      const provider = createPrototypeProvider();
      const messages: AiMessage[] = [{ role: 'user', content }];
      expect(provider.getAction?.({ messages })?.href).toBe(expectedHref);
    });
  });

  it('returns an honest fallback for unsupported prompts', () => {
    const result = resolvePrototypeIntent([
      { role: 'user', content: 'Write a poem about a bicycle' },
    ]);

    expect(result.actionId).toBeUndefined();
    expect(result.response).toContain('currently supports');
  });

  it('interpolates saved-place context and drops emails, tokens, and ids', () => {
    const sanitized = sanitizePrototypeContext({
      experienceMode: 'returning',
      chartCount: 2,
      email: 'person@example.com',
      token: 'secret-token',
      savedLocations: [
        {
          name: 'person@example.com',
          aqiCategory: 'Good',
          aqiIndex: 42,
          siteId: 'site-secret',
        },
      ],
    });
    const result = resolvePrototypeIntent(
      [{ role: 'user', content: 'Summarize my saved locations' }],
      {
        email: 'person@example.com',
        token: 'secret-token',
        savedLocations: sanitized.savedLocations,
      }
    );

    expect(sanitized.savedLocations[0]?.name).toBe('Saved location');
    expect(JSON.stringify(sanitized)).not.toContain('person@example.com');
    expect(JSON.stringify(sanitized)).not.toContain('secret-token');
    expect(JSON.stringify(sanitized)).not.toContain('site-secret');
    expect(result.response).toContain('Saved location: Good');
    expect(result.response).not.toContain('person@example.com');
  });

  it('recommends a starting workflow from the user state', () => {
    const returning = resolvePrototypeIntent(
      [{ role: 'user', content: 'What should I explore next?' }],
      { experienceMode: 'returning', chartCount: 2, comparisonCount: 0 }
    );
    const fresh = resolvePrototypeIntent(
      [{ role: 'user', content: 'What should I explore first?' }],
      { experienceMode: 'new', chartCount: 0, comparisonCount: 0 }
    );

    expect(returning.actionId).toBe('open-saved-charts');
    expect(fresh.actionId).toBe('open-map');
  });
});

describe('assistant action allowlist', () => {
  it('accepts canonical internal actions', () => {
    expect(
      getAllowlistedAssistantAction({
        id: 'configure-export',
        label: 'Configure an export',
        href: '/user/data-export',
      })?.href
    ).toBe('/user/data-export');
  });

  it('rejects external or rewritten routes', () => {
    expect(
      getAllowlistedAssistantAction({
        id: 'open-map',
        label: 'Open map',
        href: 'https://evil.example/user/map',
      })
    ).toBeUndefined();
    expect(
      getAllowlistedAssistantAction({
        id: 'open-map',
        label: 'Open map',
        href: '/user/profile',
      })
    ).toBeUndefined();
  });
});

describe('getAiProvider', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    jest.resetModules();
  });

  async function loadProvider() {
    jest.resetModules();
    return import('../server/provider');
  }

  it('selects the scripted provider when mode is prototype', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_AI_ENABLED: 'true',
      AI_PROVIDER_MODE: 'prototype',
    };
    const { getAiProvider } = await loadProvider();
    const provider = getAiProvider();
    const chunks = await collect(
      provider.streamChat({
        messages: [{ role: 'user', content: 'Write a poem about a bicycle' }],
        system: TEST_SYSTEM,
      })
    );

    expect(chunks.join('')).toContain('currently supports');
  });

  it('selects the OpenAI-compatible provider when mode is external', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_AI_ENABLED: 'true',
      AI_PROVIDER_MODE: 'external',
      AI_AGENT_URL: 'https://agent.example/v1',
    };
    mockFetchSse(['External']);
    const { getAiProvider } = await loadProvider();
    const chunks = await collect(
      getAiProvider().streamChat({
        messages: TEST_MESSAGES,
        system: TEST_SYSTEM,
      })
    );

    expect(chunks).toEqual(['External']);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://agent.example/v1/chat/completions',
      expect.any(Object)
    );
  });

  it('does not choose a provider for an invalid mode or a missing agent URL', async () => {
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_AI_ENABLED: 'true',
      AI_PROVIDER_MODE: 'openai',
    };
    const invalid = await loadProvider();
    expect(() => invalid.getAiProvider()).toThrow(
      'Ask AirQo is not configured'
    );

    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_AI_ENABLED: 'true',
      AI_PROVIDER_MODE: 'external',
      AI_AGENT_URL: '',
    };
    const missingUrl = await loadProvider();
    expect(() => missingUrl.getAiProvider()).toThrow(
      'Ask AirQo is not configured'
    );
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
