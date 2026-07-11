import { getSession } from 'next-auth/react';
import type { Session } from 'next-auth';

interface WaitForSessionOptions {
  /** Total time budget before giving up. */
  timeoutMs?: number;
  /** Delay between polls. */
  intervalMs?: number;
}

/**
 * Polls NextAuth's getSession() until a session with a user is available,
 * or the time budget runs out (resolves null — never throws).
 *
 * Resolves on the first successful poll, so the happy path is as fast as a
 * single getSession() call; the budget only bounds how long we keep trying.
 * The previous inline implementations gave up after 8 × 150ms = 1.2s, which
 * was too tight on slow connections/devices: sign-in would succeed server-side
 * but the UI reported "Could not confirm session" (found via e2e cold-start runs).
 */
export async function waitForSession({
  timeoutMs = 15_000,
  intervalMs = 250,
}: WaitForSessionOptions = {}): Promise<Session | null> {
  const deadline = Date.now() + timeoutMs;

  // Always poll at least once, even with a zero/negative budget.
  for (;;) {
    const session = await getSession();
    if (session?.user) {
      return session;
    }

    if (Date.now() >= deadline) {
      return null;
    }

    await new Promise<void>((resolve) => {
      setTimeout(resolve, intervalMs);
    });
  }
}
