import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';

const BILLING_ERROR_MESSAGES: Record<number, string> = {
  409: 'This record was changed elsewhere. Reload and try again.',
};

const BILLING_422_FALLBACK =
  "The email could not be sent. Check the customer's billing emails.";

type AxiosLikeError = {
  response?: { status?: unknown; data?: unknown };
};

/**
 * Normalizes a server-provided message value into one or more non-empty
 * strings. Accepts a plain string or an array of strings / `{ message }`
 * objects (the shapes the API uses for validation envelopes).
 */
const toMessageList = (value: unknown): string[] => {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? [trimmed] : [];
  }
  if (Array.isArray(value)) {
    const messages: string[] = [];
    for (const item of value) {
      if (typeof item === 'string') {
        const trimmed = item.trim();
        if (trimmed) messages.push(trimmed);
      } else if (item && typeof item === 'object' && 'message' in item) {
        const nested = (item as { message?: unknown }).message;
        if (typeof nested === 'string' && nested.trim()) {
          messages.push(nested.trim());
        }
      }
    }
    return messages;
  }
  return [];
};

/**
 * Extracts the server's own error message for ANY status, if present and
 * non-empty: `response.data.errors?.message` first, then
 * `response.data.message`.
 */
const getServerMessage = (error: unknown): string | null => {
  if (!error || typeof error !== 'object' || !('response' in error)) {
    return null;
  }
  const data = (error as AxiosLikeError).response?.data;
  if (!data || typeof data !== 'object') return null;

  const { message, errors } = data as { message?: unknown; errors?: unknown };

  const errorsMessage =
    errors && typeof errors === 'object' && !Array.isArray(errors)
      ? (errors as { message?: unknown }).message
      : undefined;
  const fromErrors = toMessageList(errorsMessage);
  if (fromErrors.length > 0) {
    return fromErrors.length === 1 ? fromErrors[0] : fromErrors.join(', ');
  }

  const fromMessage = toMessageList(message);
  if (fromMessage.length > 0) {
    return fromMessage.length === 1 ? fromMessage[0] : fromMessage.join(', ');
  }

  return null;
};

/** HTTP status of a billing error, when the error carries a response. */
export const getBillingErrorStatus = (error: unknown): number | undefined => {
  if (error && typeof error === 'object' && 'response' in error) {
    const status = (error as AxiosLikeError).response?.status;
    if (typeof status === 'number') return status;
  }
  return undefined;
};

/** True when the billing error is a 409 stale-record conflict. */
export const isBillingConflict = (error: unknown): boolean =>
  getBillingErrorStatus(error) === 409;

/**
 * Resolves a billing-domain error to a user-friendly message.
 * - server's own message (any status) when present and non-empty.
 * - 409 -> stale-record conflict message.
 * - 422 -> server message (likely an email-failure envelope) or a billing
 *   fallback, since the generic "Validation failed" is unhelpful here.
 * - everything else -> shared error helper.
 */
export const getBillingErrorMessage = (error: unknown): string => {
  const serverMessage = getServerMessage(error);
  if (serverMessage) {
    return serverMessage;
  }

  const status = getBillingErrorStatus(error);
  if (status === 409) {
    return BILLING_ERROR_MESSAGES[409];
  }
  if (status === 422) {
    return BILLING_422_FALLBACK;
  }

  return getUserFriendlyErrorMessage(error);
};
