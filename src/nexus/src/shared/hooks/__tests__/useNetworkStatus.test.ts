import { renderHook, act } from '@testing-library/react';
import { useNetworkStatus } from '../useNetworkStatus';

describe('useNetworkStatus', () => {
  it('default state: isOnline true, isOffline false, status online', () => {
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
    expect(result.current.status).toBe('online');
  });

  it('simulates offline: dispatches offline event on window', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
        writable: true,
      });
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.isOffline).toBe(true);
    expect(result.current.status).toBe('offline');
  });

  it('simulates online after offline', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
        writable: true,
      });
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        configurable: true,
        writable: true,
      });
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.isOffline).toBe(false);
    expect(result.current.status).toBe('online');
  });

  it('multiple toggles work correctly', () => {
    const { result } = renderHook(() => useNetworkStatus());

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
        writable: true,
      });
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.status).toBe('offline');

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        configurable: true,
        writable: true,
      });
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.status).toBe('online');

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        configurable: true,
        writable: true,
      });
      window.dispatchEvent(new Event('offline'));
    });
    expect(result.current.isOnline).toBe(false);
    expect(result.current.status).toBe('offline');

    act(() => {
      Object.defineProperty(navigator, 'onLine', {
        value: true,
        configurable: true,
        writable: true,
      });
      window.dispatchEvent(new Event('online'));
    });
    expect(result.current.isOnline).toBe(true);
    expect(result.current.status).toBe('online');
  });

  it('is SSR-safe when window is undefined', () => {
    const originalWindow = globalThis.window;
    // @ts-expect-error testing SSR
    delete globalThis.window;
    expect(() => renderHook(() => useNetworkStatus())).not.toThrow();
    globalThis.window = originalWindow;
  });

  it('returns true when navigator is undefined', () => {
    const originalNavigator = globalThis.navigator;
    // @ts-expect-error testing SSR
    delete globalThis.navigator;
    const { result } = renderHook(() => useNetworkStatus());
    expect(result.current.isOnline).toBe(true);
    globalThis.navigator = originalNavigator;
  });
});
