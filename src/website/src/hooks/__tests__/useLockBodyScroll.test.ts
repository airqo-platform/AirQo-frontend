import { renderHook } from '@testing-library/react';

import useLockBodyScroll from '../useLockBodyScroll';

const LOCK_KEY = '__airqo_body_scroll_lock_count__';
const LOCK_PREV_KEY = `${LOCK_KEY}_prev`;

describe('useLockBodyScroll', () => {
  beforeEach(() => {
    document.body.style.overflow = '';
    delete (window as any)[LOCK_KEY];
    delete (window as any)[LOCK_PREV_KEY];
  });

  afterEach(() => {
    document.body.style.overflow = '';
    delete (window as any)[LOCK_KEY];
    delete (window as any)[LOCK_PREV_KEY];
  });

  it('should set overflow to hidden when enabled is true', () => {
    renderHook(() => useLockBodyScroll(true));

    expect(document.body.style.overflow).toBe('hidden');
  });

  it('should not change overflow when enabled is false', () => {
    renderHook(() => useLockBodyScroll(false));

    expect(document.body.style.overflow).toBe('');
  });

  it('should restore overflow when unmounted after being enabled', () => {
    const { unmount } = renderHook(() => useLockBodyScroll(true));

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('');
  });

  it('should not change overflow when enabled transitions from false to false', () => {
    const { rerender } = renderHook(
      ({ enabled }) => useLockBodyScroll(enabled),
      { initialProps: { enabled: false } },
    );

    expect(document.body.style.overflow).toBe('');

    rerender({ enabled: false });

    expect(document.body.style.overflow).toBe('');
  });

  it('should increment lock count on multiple enables', () => {
    const { unmount: unmount1 } = renderHook(() => useLockBodyScroll(true));
    expect((window as any)[LOCK_KEY]).toBe(1);

    const { unmount: unmount2 } = renderHook(() => useLockBodyScroll(true));
    expect((window as any)[LOCK_KEY]).toBe(2);

    expect(document.body.style.overflow).toBe('hidden');

    unmount1();
    expect((window as any)[LOCK_KEY]).toBe(1);
    expect(document.body.style.overflow).toBe('hidden');

    unmount2();
    expect((window as any)[LOCK_KEY]).toBe(0);
    expect(document.body.style.overflow).toBe('');
  });

  it('should save and restore previous overflow value', () => {
    document.body.style.overflow = 'scroll';

    const { unmount } = renderHook(() => useLockBodyScroll(true));

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('scroll');
  });

  it('should restore to empty string when no previous overflow was set', () => {
    document.body.style.overflow = '';

    const { unmount } = renderHook(() => useLockBodyScroll(true));

    expect(document.body.style.overflow).toBe('hidden');

    unmount();

    expect(document.body.style.overflow).toBe('');
  });

  it('should handle enable/disable/enable sequence', () => {
    const { rerender } = renderHook(
      ({ enabled }) => useLockBodyScroll(enabled),
      { initialProps: { enabled: true } },
    );

    expect(document.body.style.overflow).toBe('hidden');
    expect((window as any)[LOCK_KEY]).toBe(1);

    rerender({ enabled: false });

    expect(document.body.style.overflow).toBe('');
    expect((window as any)[LOCK_KEY]).toBe(0);

    rerender({ enabled: true });

    expect(document.body.style.overflow).toBe('hidden');
    expect((window as any)[LOCK_KEY]).toBe(1);
  });

  it('should not decrement below zero', () => {
    const { unmount } = renderHook(() => useLockBodyScroll(true));

    expect((window as any)[LOCK_KEY]).toBe(1);

    unmount();

    expect((window as any)[LOCK_KEY]).toBe(0);

    unmount();

    expect((window as any)[LOCK_KEY]).toBe(0);
  });

  it('should clean up LOCK_PREV_KEY after restoring', () => {
    const { unmount } = renderHook(() => useLockBodyScroll(true));

    expect((window as any)[LOCK_PREV_KEY]).toBe('');

    unmount();

    expect((window as any)[LOCK_PREV_KEY]).toBeUndefined();
  });

  it('should handle rapid enable/disable cycles', () => {
    const { rerender } = renderHook(
      ({ enabled }) => useLockBodyScroll(enabled),
      { initialProps: { enabled: true } },
    );

    for (let i = 0; i < 5; i++) {
      rerender({ enabled: false });
      rerender({ enabled: true });
    }

    expect(document.body.style.overflow).toBe('hidden');
    expect((window as any)[LOCK_KEY]).toBe(1);
  });
});
