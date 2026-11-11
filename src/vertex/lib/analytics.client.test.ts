import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// The client half of lib/analytics.ts, with a key set and posthog-js replaced by a stub.
// Beacon's lib/analytics.ts has the same client code, so this covers both apps.

const posthog = vi.hoisted(() => {
  const state = { distinctId: 'anonymous-1', userState: 'anonymous' };
  return {
    state,
    init: vi.fn(),
    capture: vi.fn(),
    identify: vi.fn((id: string) => {
      state.distinctId = id;
      state.userState = 'identified';
    }),
    setPersonProperties: vi.fn(),
    reset: vi.fn(() => {
      state.distinctId = 'anonymous-2';
      state.userState = 'anonymous';
    }),
    group: vi.fn(),
    resetGroups: vi.fn(),
    get_distinct_id: vi.fn(() => state.distinctId),
    get_property: vi.fn((key: string) => (key === '$user_state' ? state.userState : undefined)),
  };
});

vi.mock('posthog-js', () => ({ default: posthog }));

type Analytics = typeof import('./analytics');

/** A fresh copy of the module, so it reads the stubbed key and starts with an empty queue. */
async function loadAnalytics(): Promise<Analytics> {
  vi.resetModules();
  return import('./analytics');
}

/** Lets the idle-time load run and the dynamic import of posthog-js settle. */
async function settleLoad() {
  await vi.advanceTimersByTimeAsync(1000);
  await vi.waitFor(() => expect(posthog.init).toHaveBeenCalled());
}

const eventNames = () => posthog.capture.mock.calls.map(call => call[0]);

describe('analytics client with NEXT_PUBLIC_POSTHOG_KEY set', () => {
  const originalIdleCallback = window.requestIdleCallback;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubEnv('NEXT_PUBLIC_POSTHOG_KEY', 'phc_test');
    // Take the setTimeout path, which fake timers control
    (window as { requestIdleCallback?: unknown }).requestIdleCallback = undefined;
    vi.clearAllMocks();
    posthog.state.distinctId = 'anonymous-1';
    posthog.state.userState = 'anonymous';
    window.history.replaceState(null, '', '/home');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    window.requestIdleCallback = originalIdleCallback;
    window.history.replaceState(null, '', '/');
  });

  it('queues calls made before posthog-js loads and replays them in order', async () => {
    const analytics = await loadAnalytics();
    expect(analytics.isAnalyticsEnabled()).toBe(true);

    analytics.trackEvent('first_event', { device_count: 2 });
    analytics.identifyUser({ id: 'user-1', privilege: 'user' });
    analytics.trackEvent('second_event');
    expect(posthog.init).not.toHaveBeenCalled();
    expect(posthog.capture).not.toHaveBeenCalled();

    await settleLoad();

    expect(eventNames()).toEqual(['first_event', 'second_event']);
    expect(posthog.capture.mock.calls[0][1]).toMatchObject({ device_count: 2, route: '/home' });
    const [firstCapture, secondCapture] = posthog.capture.mock.invocationCallOrder;
    const [identifyCall] = posthog.identify.mock.invocationCallOrder;
    expect(firstCapture).toBeLessThan(identifyCall);
    expect(identifyCall).toBeLessThan(secondCapture);
  });

  it('plugs into lib/track, which the rest of Vertex calls', async () => {
    await loadAnalytics();
    const track = await import('./track');

    track.trackEvent('device_claimed', { method: 'manual' }, { sendNow: true });
    await settleLoad();

    expect(posthog.capture).toHaveBeenCalledWith(
      'device_claimed',
      { method: 'manual', route: '/home' },
      { transport: 'sendBeacon' }
    );
  });

  it('starts PostHog with named events only, replay left to project settings and inputs masked', async () => {
    const analytics = await loadAnalytics();
    analytics.trackPageview('/home');
    await settleLoad();

    expect(posthog.init).toHaveBeenCalledTimes(1);
    const [key, config] = posthog.init.mock.calls[0];
    expect(key).toBe('phc_test');
    expect(config).toMatchObject({
      autocapture: false,
      capture_pageview: false,
      rageclick: false,
      capture_dead_clicks: false,
      disable_session_recording: false,
      session_recording: { maskAllInputs: true },
      person_profiles: 'identified_only',
    });
    expect(config.before_send).toEqual([analytics.withAppProperties, analytics.beforeSend]);
  });

  it('sends a pageview under its route template without the query string', async () => {
    const analytics = await loadAnalytics();
    analytics.trackPageview('/devices/overview/64f0c2a1e4b0a1b2c3d4e5f6');
    await settleLoad();

    expect(posthog.capture).toHaveBeenCalledWith('$pageview', {
      $current_url: `${window.location.origin}/devices/overview/64f0c2a1e4b0a1b2c3d4e5f6`,
      route: '/devices/overview/[id]',
    });
  });

  it('sends by beacon only when asked to', async () => {
    const analytics = await loadAnalytics();
    analytics.trackEvent('warm_up');
    await settleLoad();

    analytics.trackEvent('user_signed_out', {}, { sendNow: true });
    analytics.trackEvent('device_claimed', { method: 'qr' });

    const signedOut = posthog.capture.mock.calls.find(call => call[0] === 'user_signed_out');
    const claimed = posthog.capture.mock.calls.find(call => call[0] === 'device_claimed');
    expect(signedOut?.[2]).toEqual({ transport: 'sendBeacon' });
    expect(claimed?.[2]).toBeUndefined();
  });

  it('drops personal details from event properties on the way out', async () => {
    const analytics = await loadAnalytics();
    analytics.trackEvent('device_claimed', { method: 'qr', email: 'someone@example.com', userName: 'x' });
    await settleLoad();

    expect(posthog.capture.mock.calls[0][1]).toEqual({ method: 'qr', route: '/home' });
  });

  it('resets before identifying a second account on the same browser', async () => {
    posthog.state.distinctId = 'user-a';
    posthog.state.userState = 'identified';
    const analytics = await loadAnalytics();

    analytics.identifyUser({ id: 'user-b', privilege: 'user' });
    await settleLoad();

    expect(posthog.reset).toHaveBeenCalledTimes(1);
    expect(posthog.identify).toHaveBeenCalledWith('user-b', { vertex_privilege: 'user' });
    expect(posthog.reset.mock.invocationCallOrder[0]).toBeLessThan(
      posthog.identify.mock.invocationCallOrder[0]
    );
  });

  it('only updates person properties when the same user is identified again', async () => {
    posthog.state.distinctId = 'user-a';
    posthog.state.userState = 'identified';
    const analytics = await loadAnalytics();

    analytics.identifyUser({ id: 'user-a', privilege: 'admin', country: 'Uganda' });
    await settleLoad();

    expect(posthog.reset).not.toHaveBeenCalled();
    expect(posthog.identify).not.toHaveBeenCalled();
    expect(posthog.setPersonProperties).toHaveBeenCalledWith({
      vertex_privilege: 'admin',
      country: 'Uganda',
    });
  });

  it('joins an anonymous visitor to the user without a reset', async () => {
    const analytics = await loadAnalytics();
    analytics.identifyUser({ id: 'user-a' });
    await settleLoad();

    expect(posthog.reset).not.toHaveBeenCalled();
    expect(posthog.identify).toHaveBeenCalledWith('user-a', {});
  });

  it('waits while the URL carries a token and starts once the app has removed it', async () => {
    window.history.replaceState(null, '', '/reset-password?reset_token=secret');
    const analytics = await loadAnalytics();

    analytics.trackEvent('page_opened');
    await vi.advanceTimersByTimeAsync(5000);
    expect(posthog.init).not.toHaveBeenCalled();

    window.history.replaceState(null, '', '/home');
    await vi.advanceTimersByTimeAsync(1000);
    await vi.waitFor(() => expect(posthog.init).toHaveBeenCalledTimes(1));
    expect(eventNames()).toEqual(['page_opened']);
  });

  it('gives up on a page that keeps its token, and starts from the next clean page', async () => {
    window.history.replaceState(null, '', '/reset-password?reset_token=secret');
    const analytics = await loadAnalytics();

    analytics.trackPageview('/reset-password');
    // The idle-time start, then sixty one-second checks and the one that gives up
    await vi.advanceTimersByTimeAsync(1000 + 61 * 1000);
    await vi.advanceTimersByTimeAsync(10 * 1000);
    expect(posthog.init).not.toHaveBeenCalled();

    window.history.replaceState(null, '', '/home');
    analytics.trackPageview('/home');
    await settleLoad();
    expect(posthog.init).toHaveBeenCalledTimes(1);
    expect(eventNames()).toEqual(['$pageview', '$pageview']);
  });

  it('treats a token in the hash the same way', async () => {
    window.history.replaceState(null, '', '/login#token=abc&provider=google');
    const analytics = await loadAnalytics();

    analytics.trackPageview('/login');
    await vi.advanceTimersByTimeAsync(3000);
    expect(posthog.init).not.toHaveBeenCalled();

    window.history.replaceState(null, '', '/login');
    await vi.advanceTimersByTimeAsync(1000);
    await vi.waitFor(() => expect(posthog.init).toHaveBeenCalledTimes(1));
  });

  it('associates events with the active organisation and clears it when there is none', async () => {
    const analytics = await loadAnalytics();
    analytics.setActiveOrganization({ id: 'group-1', title: 'kcca' }, 'external-org');
    analytics.setActiveOrganization(null, 'personal');
    await settleLoad();

    expect(posthog.group).toHaveBeenCalledWith('organization', 'group-1', { name: 'kcca' });
    expect(posthog.resetGroups).toHaveBeenCalledTimes(1);
  });

  it('records each sign-in once, with how it was made', async () => {
    const analytics = await loadAnalytics();
    analytics.startSignIn('password');
    vi.advanceTimersByTime(1500);

    expect(analytics.consumePendingSignIn()).toEqual({ method: 'password', duration_ms: 1500 });
    expect(analytics.consumePendingSignIn()).toBeNull();

    // An OAuth hand-off keeps the start time from the provider button
    analytics.startSignIn('google');
    vi.advanceTimersByTime(800);
    analytics.completeSignIn('google');
    expect(analytics.consumePendingSignIn()).toEqual({ method: 'google', duration_ms: 800 });

    // A platform session has no start time of its own
    analytics.completeSignIn('sso_session');
    expect(analytics.consumePendingSignIn()).toEqual({ method: 'sso_session', duration_ms: null });

    // An attempt left for more than ten minutes isn't reported
    analytics.startSignIn('password');
    vi.advanceTimersByTime(11 * 60 * 1000);
    expect(analytics.consumePendingSignIn()).toBeNull();
  });
});
