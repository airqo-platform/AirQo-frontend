const PENDING_REGISTRATION_EMAIL_KEY = 'airqo:pending-registration-email';
const PENDING_REGISTRATION_EMAIL_TTL_MS = 5 * 60 * 1000;

export const setPendingRegistrationEmail = (email: string): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    sessionStorage.setItem(
      PENDING_REGISTRATION_EMAIL_KEY,
      JSON.stringify({
        email,
        expiresAt: Date.now() + PENDING_REGISTRATION_EMAIL_TTL_MS,
      })
    );
  } catch {
    // Storage may be unavailable in private browsing or restricted contexts.
  }
};

export const consumePendingRegistrationEmail = (): string => {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const rawValue = sessionStorage.getItem(PENDING_REGISTRATION_EMAIL_KEY);
    sessionStorage.removeItem(PENDING_REGISTRATION_EMAIL_KEY);

    if (!rawValue) {
      return '';
    }

    const handoff = JSON.parse(rawValue) as {
      email?: unknown;
      expiresAt?: unknown;
    };

    return typeof handoff.email === 'string' &&
      typeof handoff.expiresAt === 'number' &&
      handoff.expiresAt > Date.now()
      ? handoff.email
      : '';
  } catch {
    return '';
  }
};
