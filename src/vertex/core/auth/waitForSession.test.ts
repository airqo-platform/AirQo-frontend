import { waitForSession } from './waitForSession';
import { getSession } from 'next-auth/react';
import type { Session } from 'next-auth';

vi.mock('next-auth/react', () => ({
  getSession: vi.fn(),
}));

const mockedGetSession = vi.mocked(getSession);

const sessionWithUser = {
  user: { email: 'user@example.com' },
} as unknown as Session;

describe('waitForSession', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockedGetSession.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('resolves immediately when the session is available on the first poll', async () => {
    mockedGetSession.mockResolvedValue(sessionWithUser);

    const session = await waitForSession();

    expect(session).toBe(sessionWithUser);
    expect(mockedGetSession).toHaveBeenCalledTimes(1);
  });

  it('keeps polling until the session appears', async () => {
    mockedGetSession
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)
      .mockResolvedValue(sessionWithUser);

    const promise = waitForSession({ timeoutMs: 5_000, intervalMs: 250 });
    await vi.advanceTimersByTimeAsync(600);

    await expect(promise).resolves.toBe(sessionWithUser);
    expect(mockedGetSession).toHaveBeenCalledTimes(3);
  });

  it('ignores a session without a user and keeps polling', async () => {
    mockedGetSession
      .mockResolvedValueOnce({} as Session)
      .mockResolvedValue(sessionWithUser);

    const promise = waitForSession({ timeoutMs: 5_000, intervalMs: 250 });
    await vi.advanceTimersByTimeAsync(300);

    await expect(promise).resolves.toBe(sessionWithUser);
  });

  it('resolves null once the time budget is exhausted', async () => {
    mockedGetSession.mockResolvedValue(null);

    const promise = waitForSession({ timeoutMs: 1_000, intervalMs: 250 });
    await vi.advanceTimersByTimeAsync(1_100);

    await expect(promise).resolves.toBeNull();
  });

  it('polls at least once even with a zero budget', async () => {
    mockedGetSession.mockResolvedValue(null);

    await expect(waitForSession({ timeoutMs: 0 })).resolves.toBeNull();
    expect(mockedGetSession).toHaveBeenCalledTimes(1);
  });

  it('gives slow logins the full budget instead of the old 1.2s cutoff', async () => {
    // Regression guard for the "Could not confirm session" bug: a session
    // that materializes after 1.2s must still be picked up.
    mockedGetSession.mockImplementation(async () =>
      Date.now() >= 3_000 ? sessionWithUser : null
    );

    vi.setSystemTime(0);
    const promise = waitForSession({ timeoutMs: 15_000, intervalMs: 250 });
    await vi.advanceTimersByTimeAsync(3_500);

    await expect(promise).resolves.toBe(sessionWithUser);
  });
});
