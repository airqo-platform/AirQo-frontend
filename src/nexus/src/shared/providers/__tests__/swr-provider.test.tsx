import React from 'react';
import { render } from '@testing-library/react';
import { useSWRConfig } from 'swr';
import { SWRProvider } from '../swr-provider';
import { swrRetryPolicy } from '@/shared/lib/retryPolicy';

/**
 * Consumer that exposes the resolved SWR config so the test can assert on
 * the provider-level defaults (issue #4023). The config is also captured in a
 * module-level ref so tests can invoke `shouldRetryOnError` directly.
 */
let capturedConfig: {
  revalidateOnReconnect?: boolean;
  shouldRetryOnError?: (error: Error) => boolean;
} | null = null;

const ConfigProbe = () => {
  const config = useSWRConfig();
  capturedConfig = {
    revalidateOnReconnect: config.revalidateOnReconnect,
    shouldRetryOnError: config.shouldRetryOnError as
      | ((error: Error) => boolean)
      | undefined,
  };
  return (
    <div>
      <span data-testid="revalidateOnReconnect">
        {String(config.revalidateOnReconnect)}
      </span>
      <span data-testid="retryIsPolicy">
        {String(
          config.shouldRetryOnError === swrRetryPolicy.shouldRetryOnError
        )}
      </span>
    </div>
  );
};

const renderProvider = () =>
  render(
    <SWRProvider enablePersistence={false}>
      <ConfigProbe />
    </SWRProvider>
  );

describe('SWRProvider (issue #4023)', () => {
  beforeEach(() => {
    capturedConfig = null;
  });

  it('revalidates on reconnect', () => {
    const { getByTestId } = renderProvider();

    expect(getByTestId('revalidateOnReconnect').textContent).toBe('true');
  });

  it('wires swrRetryPolicy as the error retry policy', () => {
    const { getByTestId } = renderProvider();

    expect(getByTestId('retryIsPolicy').textContent).toBe('true');
  });

  it('shouldRetryOnError returns true for network errors and false for 5xx', () => {
    renderProvider();

    expect(capturedConfig).not.toBeNull();
    const networkErr = Object.assign(new Error('Network Error'), {
      code: 'ERR_NETWORK',
    });
    const serverErr = Object.assign(new Error('Server Error'), {
      response: { status: 500 },
    });

    expect(capturedConfig!.shouldRetryOnError?.(networkErr)).toBe(true);
    expect(capturedConfig!.shouldRetryOnError?.(serverErr)).toBe(false);
  });
});
