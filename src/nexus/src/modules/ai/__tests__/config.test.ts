/**
 * @jest-environment node
 */

// Since config.ts reads process.env at module load time, we test via env manipulation
// and re-importing the module with jest.resetModules().

describe('aiConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('isAiEnabled returns false by default', async () => {
    delete process.env.NEXT_PUBLIC_AI_ENABLED;
    const mod = await import('../server/config');
    expect(mod.isAiEnabled()).toBe(false);
  });

  it('isAiEnabled returns true when NEXT_PUBLIC_AI_ENABLED=true', async () => {
    process.env.NEXT_PUBLIC_AI_ENABLED = 'true';
    const mod = await import('../server/config');
    expect(mod.isAiEnabled()).toBe(true);
  });

  it('reads AI_AGENT_URL from env', async () => {
    process.env.AI_AGENT_URL = 'https://agent.test.com/v1';
    const mod = await import('../server/config');
    expect(mod.aiConfig.agentUrl).toBe('https://agent.test.com/v1');
  });

  it('reads AI_AGENT_API_KEY from env', async () => {
    process.env.AI_AGENT_API_KEY = 'test-key-123';
    const mod = await import('../server/config');
    expect(mod.aiConfig.agentApiKey).toBe('test-key-123');
  });

  it('has a default model', async () => {
    const mod = await import('../server/config');
    expect(mod.aiConfig.model).toBe('gpt-4o-mini');
  });

  it('defaults agentUrl to empty string', async () => {
    delete process.env.AI_AGENT_URL;
    const mod = await import('../server/config');
    expect(mod.aiConfig.agentUrl).toBe('');
  });
});
