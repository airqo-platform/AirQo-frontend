import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { QueryClientProvider, onlineManager, useQuery } from '@tanstack/react-query';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createQueryClient } from '@/core/providers/query-provider';
import { HIDDEN_RECOVERY_THRESHOLD_MS } from '@/core/utils/queryRecoveryPolicy';
import NetworkStatusBanner from './index';

const OFFLINE = /You are offline/;
const REFRESHING = /Refreshing data/;
const RESTORED = /Connection restored/;
const UNSTABLE = /Connection is unstable/;

const networkError = () =>
  Object.assign(new Error('Network Error'), { code: 'ERR_NETWORK', response: { status: 0 } });
const httpError = (status: number) => Object.assign(new Error('Request failed'), { response: { status } });

const deferred = <T,>() => {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

// Opts out of focus refetching like the list hooks do, so only recovery can repair it.
function FailedList({ queryFn }: { queryFn: () => Promise<string> }) {
  useQuery({ queryKey: ['list'], queryFn, retry: false, refetchOnWindowFocus: false });
  return null;
}

const renderWithFailedList = async (queryFn: () => Promise<string>, autoHideDelay?: number) => {
  const client = createQueryClient();
  render(
    <QueryClientProvider client={client}>
      <FailedList queryFn={queryFn} />
      <NetworkStatusBanner autoHideDelay={autoHideDelay} />
    </QueryClientProvider>
  );
  await waitFor(() => expect(client.getQueryState(['list'])?.status).toBe('error'));
  return client;
};

const setOnLine = (value: boolean) =>
  Object.defineProperty(navigator, 'onLine', { value, configurable: true });

const goOffline = () =>
  act(() => {
    setOnLine(false);
    window.dispatchEvent(new Event('offline'));
  });

const goOnline = () =>
  act(() => {
    setOnLine(true);
    window.dispatchEvent(new Event('online'));
  });

const setVisibility = (state: 'visible' | 'hidden') =>
  act(() => {
    Object.defineProperty(document, 'visibilityState', { value: state, configurable: true });
    document.dispatchEvent(new Event('visibilitychange', { bubbles: true }));
  });

describe('NetworkStatusBanner reconnect recovery', () => {
  let ping: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    ping = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', ping);
  });

  afterEach(() => {
    delete (navigator as unknown as Record<string, unknown>).onLine;
    delete (document as unknown as Record<string, unknown>).visibilityState;
    onlineManager.setOnline(true);
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('refetches a failed query once after a reconnect', async () => {
    const queryFn = vi.fn().mockRejectedValueOnce(networkError()).mockResolvedValue('ok');
    const client = await renderWithFailedList(queryFn);

    goOffline();
    await screen.findByText(OFFLINE);
    goOnline();

    await screen.findByText(RESTORED);
    expect(client.getQueryState(['list'])?.status).toBe('success');
    expect(queryFn).toHaveBeenCalledTimes(2);
  });

  it('only says restored after the refetches have settled', async () => {
    const refetch = deferred<string>();
    const queryFn = vi.fn().mockRejectedValueOnce(networkError()).mockReturnValue(refetch.promise);
    await renderWithFailedList(queryFn);

    goOffline();
    goOnline();

    await screen.findByText(REFRESHING);
    expect(screen.queryByText(RESTORED)).not.toBeInTheDocument();

    await act(async () => refetch.resolve('ok'));

    await screen.findByText(RESTORED);
    expect(screen.queryByText(REFRESHING)).not.toBeInTheDocument();
  });

  it('confirms the app can be reached before refreshing', async () => {
    const reachable = deferred<{ ok: boolean }>();
    ping.mockReturnValueOnce(reachable.promise);
    const queryFn = vi.fn().mockRejectedValueOnce(networkError()).mockResolvedValue('ok');
    await renderWithFailedList(queryFn);

    goOffline();
    goOnline();

    await screen.findByText(/Reconnecting/);
    expect(screen.queryByText(REFRESHING)).not.toBeInTheDocument();
    expect(screen.queryByText(RESTORED)).not.toBeInTheDocument();

    await act(async () => reachable.resolve({ ok: true }));

    await screen.findByText(RESTORED);
  });

  it('shows unstable with Retry when the app cannot be reached, and recovers on Retry', async () => {
    ping.mockResolvedValueOnce({ ok: false });
    const queryFn = vi.fn().mockRejectedValue(networkError());
    const client = await renderWithFailedList(queryFn);

    goOffline();
    goOnline();

    await screen.findByText(UNSTABLE);
    expect(screen.queryByText(RESTORED)).not.toBeInTheDocument();

    queryFn.mockResolvedValue('ok');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await screen.findByText(RESTORED);
    expect(client.getQueryState(['list'])?.status).toBe('success');
  });

  it('keeps checking and recovers without Retry once the app can be reached', async () => {
    ping.mockResolvedValueOnce({ ok: false });
    const queryFn = vi.fn().mockRejectedValueOnce(networkError()).mockResolvedValue('ok');
    await renderWithFailedList(queryFn);

    goOffline();
    goOnline();

    await screen.findByText(UNSTABLE);
    await screen.findByText(RESTORED, undefined, { timeout: 2000 });
    expect(ping).toHaveBeenCalledTimes(2);
  });

  it('shows unstable with Retry when a refetch still fails', async () => {
    const queryFn = vi.fn().mockRejectedValue(networkError());
    await renderWithFailedList(queryFn);

    goOffline();
    goOnline();

    await screen.findByText(UNSTABLE);
    expect(screen.queryByText(RESTORED)).not.toBeInTheDocument();
    const callsBeforeRetry = queryFn.mock.calls.length;

    queryFn.mockResolvedValue('ok');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await screen.findByText(RESTORED);
    expect(queryFn.mock.calls.length).toBe(callsBeforeRetry + 1);
  });

  it('clears the unstable state when the failed query is repaired elsewhere', async () => {
    const queryFn = vi.fn().mockRejectedValue(networkError());
    const client = await renderWithFailedList(queryFn);

    goOffline();
    goOnline();
    await screen.findByText(UNSTABLE);

    await act(async () => {
      client.setQueryData(['list'], 'ok');
    });

    await waitFor(() => expect(screen.queryByText(UNSTABLE)).not.toBeInTheDocument());
  });

  it('does not re-run a query the server rejected with a 4xx', async () => {
    const queryFn = vi.fn().mockRejectedValue(httpError(403));
    await renderWithFailedList(queryFn);

    goOffline();
    goOnline();

    await screen.findByText(RESTORED);
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it('refetches a failed query when the tab returns after a long absence', async () => {
    const queryFn = vi.fn().mockRejectedValueOnce(networkError()).mockResolvedValue('ok');
    const client = await renderWithFailedList(queryFn);
    const now = Date.now();
    const clock = vi.spyOn(Date, 'now').mockReturnValue(now);

    setVisibility('hidden');
    clock.mockReturnValue(now + HIDDEN_RECOVERY_THRESHOLD_MS);
    setVisibility('visible');

    await waitFor(() => expect(client.getQueryState(['list'])?.status).toBe('success'));
    expect(queryFn).toHaveBeenCalledTimes(2);
  });

  it('leaves a failed query alone after a quick tab switch', async () => {
    const queryFn = vi.fn().mockRejectedValue(networkError());
    await renderWithFailedList(queryFn);
    const now = Date.now();
    const clock = vi.spyOn(Date, 'now').mockReturnValue(now);

    setVisibility('hidden');
    clock.mockReturnValue(now + HIDDEN_RECOVERY_THRESHOLD_MS - 1);
    setVisibility('visible');

    await act(async () => undefined);
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it('recovers when the tab missed the online event', async () => {
    const queryFn = vi.fn().mockRejectedValueOnce(networkError()).mockResolvedValue('ok');
    const client = await renderWithFailedList(queryFn);

    goOffline();
    expect(onlineManager.isOnline()).toBe(false);

    setOnLine(true);
    setVisibility('visible');

    await screen.findByText(RESTORED);
    expect(onlineManager.isOnline()).toBe(true);
    expect(client.getQueryState(['list'])?.status).toBe('success');
  });

  it('notices on return that the tab missed the offline event', async () => {
    const queryFn = vi.fn().mockRejectedValue(networkError());
    await renderWithFailedList(queryFn);

    setOnLine(false);
    setVisibility('visible');

    await screen.findByText(OFFLINE);
    expect(onlineManager.isOnline()).toBe(false);
  });

  it('stops recovering if the connection drops again', async () => {
    const reachable = deferred<{ ok: boolean }>();
    ping.mockReturnValueOnce(reachable.promise);
    const queryFn = vi.fn().mockRejectedValueOnce(networkError()).mockResolvedValue('ok');
    await renderWithFailedList(queryFn);

    goOffline();
    goOnline();
    await screen.findByText(/Reconnecting/);
    goOffline();

    await act(async () => reachable.resolve({ ok: true }));

    await screen.findByText(OFFLINE);
    expect(screen.queryByText(RESTORED)).not.toBeInTheDocument();
  });

  it('hides the restored message after the auto-hide delay', async () => {
    const queryFn = vi.fn().mockRejectedValueOnce(networkError()).mockResolvedValue('ok');
    await renderWithFailedList(queryFn, 20);

    goOffline();
    goOnline();

    await screen.findByText(RESTORED);
    await waitFor(() => expect(screen.queryByText(RESTORED)).not.toBeInTheDocument());
  });

  it('offers Retry on the unstable state reported by the API clients', async () => {
    const queryFn = vi.fn().mockRejectedValueOnce(networkError()).mockResolvedValue('ok');
    await renderWithFailedList(queryFn);

    act(() => {
      window.dispatchEvent(new Event('vertex-network-degraded'));
    });

    await screen.findByText(UNSTABLE);
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));

    await screen.findByText(RESTORED);
    expect(screen.queryByText(UNSTABLE)).not.toBeInTheDocument();
  });

  it('announces progress politely and problems assertively, from regions already mounted', async () => {
    const refetch = deferred<string>();
    const queryFn = vi.fn().mockRejectedValueOnce(networkError()).mockReturnValue(refetch.promise);
    await renderWithFailedList(queryFn);

    const politeRegion = screen.getByRole('status');
    const alertRegion = screen.getByRole('alert');
    expect(politeRegion).toHaveAttribute('aria-live', 'polite');
    expect(politeRegion).toBeEmptyDOMElement();

    goOffline();
    await within(alertRegion).findByText(OFFLINE);

    goOnline();
    await within(politeRegion).findByText(REFRESHING);

    await act(async () => refetch.resolve('ok'));
    await within(politeRegion).findByText(RESTORED);

    expect(screen.getByRole('status')).toBe(politeRegion);
    expect(screen.getByRole('alert')).toBe(alertRegion);
  });
});
