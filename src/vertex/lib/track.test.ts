import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AnalyticsBridge } from './track';

type Track = typeof import('./track');

const fakeBridge = (): AnalyticsBridge => ({
  trackEvent: vi.fn(),
  startSignIn: vi.fn(),
  completeSignIn: vi.fn(),
  clearPendingSignIn: vi.fn(),
  resetAnalytics: vi.fn(),
});

describe('lib/track', () => {
  let track: Track;

  beforeEach(async () => {
    vi.resetModules();
    track = await import('./track');
  });

  it('holds calls made before lib/analytics connects and replays them in order', () => {
    track.trackEvent('first', { device_count: 1 });
    track.startSignIn('password');
    track.trackEvent('second', {}, { sendNow: true });

    const bridge = fakeBridge();
    track.connectAnalytics(bridge);

    expect(bridge.trackEvent).toHaveBeenNthCalledWith(1, 'first', { device_count: 1 }, undefined);
    expect(bridge.trackEvent).toHaveBeenNthCalledWith(2, 'second', {}, { sendNow: true });
    expect(bridge.startSignIn).toHaveBeenCalledWith('password');
  });

  it('forwards straight away once connected', () => {
    const bridge = fakeBridge();
    track.connectAnalytics(bridge);

    track.completeSignIn('google');
    track.clearPendingSignIn();
    track.resetAnalytics();

    expect(bridge.completeSignIn).toHaveBeenCalledWith('google');
    expect(bridge.clearPendingSignIn).toHaveBeenCalledTimes(1);
    expect(bridge.resetAnalytics).toHaveBeenCalledTimes(1);
  });

  it('keeps at most 50 waiting calls', () => {
    for (let i = 0; i < 80; i++) track.trackEvent(`event_${i}`);
    const bridge = fakeBridge();
    track.connectAnalytics(bridge);
    expect(bridge.trackEvent).toHaveBeenCalledTimes(50);
  });

  it('names the AirQo app a link opens', () => {
    expect(track.getAppDestination('https://beacon.airqo.net/dashboard')).toBe('beacon');
    expect(track.getAppDestination('https://staging-analytics.airqo.net/user/profile')).toBe('nexus');
    expect(track.getAppDestination('https://airqalibrate.airqo.net/')).toBe('calibrate');
    expect(track.getAppDestination('https://docs.airqo.net/airqo-rest-api-documentation/')).toBe('api_docs');
    expect(track.getAppDestination('https://ai.airqo.net')).toBe('ai_platform');
    expect(track.getAppDestination('https://airqo.net/')).toBe('website');
    expect(track.getAppDestination('https://example.com')).toBe('other');
  });
});
