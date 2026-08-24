import { shouldRetryQuery } from '@/queries/retry-policy';

describe('shouldRetryQuery', () => {
  it('does not retry errors explicitly marked non-retryable', () => {
    expect(shouldRetryQuery(0, { statusCode: 500, retryable: false })).toBe(
      false,
    );
  });

  it('preserves retries for transient errors', () => {
    expect(shouldRetryQuery(0, { statusCode: 503, retryable: true })).toBe(
      true,
    );
    expect(shouldRetryQuery(2, { statusCode: 503 })).toBe(true);
    expect(shouldRetryQuery(3, { statusCode: 503 })).toBe(false);
  });

  it('keeps non-transient global exclusions', () => {
    expect(shouldRetryQuery(0, { statusCode: 404 })).toBe(false);
    expect(shouldRetryQuery(0, { name: 'AbortError' })).toBe(false);
  });
});
