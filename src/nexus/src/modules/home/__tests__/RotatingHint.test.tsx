import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { RotatingHint } from '../components/RotatingHint';
import { HOME_HINTS } from '../constants';

const HINT_INTERVAL_MS = 5600;
const HINT_FADE_MS = 220;
const RING_CIRCUMFERENCE = 2 * Math.PI * 7.5;

const originalMatchMedia = window.matchMedia;
const originalRequestAnimationFrame = window.requestAnimationFrame;
const originalCancelAnimationFrame = window.cancelAnimationFrame;

const setReducedMotion = (matches: boolean) => {
  window.matchMedia = jest.fn().mockReturnValue({
    matches,
    media: '(prefers-reduced-motion: reduce)',
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }) as unknown as typeof window.matchMedia;
};

const progressArc = () => {
  const ring = screen.getByTestId('home-hint-progress');
  const circles = ring.querySelectorAll('circle');
  return circles[circles.length - 1];
};

const offset = () => Number(progressArc().style.strokeDashoffset);

const advance = (ms: number) => {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
};

/** Percentage of the ring that is filled, 0-100. */
const filledPercent = () => (1 - offset() / RING_CIRCUMFERENCE) * 100;

const hintText = () => screen.getByTestId('home-hint').textContent ?? '';

describe('RotatingHint', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // rAF is backed by the fake clock so the loop runs deterministically.
    window.requestAnimationFrame = jest.fn(
      (cb: FrameRequestCallback) =>
        window.setTimeout(() => cb(performance.now()), 16) as unknown as number
    );
    window.cancelAnimationFrame = jest.fn((handle: number) => {
      window.clearTimeout(handle);
    }) as unknown as typeof window.cancelAnimationFrame;
    setReducedMotion(false);
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
    window.matchMedia = originalMatchMedia;
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
  });

  it('shows a decorative countdown ring at the top right of the panel', () => {
    render(<RotatingHint onSelect={jest.fn()} />);

    const ring = screen.getByTestId('home-hint-progress');
    expect(ring).toHaveAttribute('aria-hidden', 'true');
    expect(ring).toHaveClass('absolute', 'right-4', 'top-4');
    expect(progressArc()).toHaveClass('stroke-primary');
    expect(progressArc().getAttribute('stroke-dasharray')).toBe(
      String(RING_CIRCUMFERENCE)
    );
  });

  it('advances the ring continuously instead of stalling', () => {
    render(<RotatingHint onSelect={jest.fn()} />);
    advance(16);

    // A quarter, a half and three quarters of the way through the cycle.
    advance(HINT_INTERVAL_MS * 0.25);
    const quarter = filledPercent();
    advance(HINT_INTERVAL_MS * 0.25);
    const half = filledPercent();
    advance(HINT_INTERVAL_MS * 0.25);
    const threeQuarters = filledPercent();

    // Monotonic growth across the cycle is the regression guard: the ring used
    // to stop part-way through because a CSS transition had nothing to resume.
    expect(quarter).toBeGreaterThan(15);
    expect(half).toBeGreaterThan(quarter);
    expect(threeQuarters).toBeGreaterThan(half);
    expect(threeQuarters).toBeLessThan(95);
  });

  it('completes the ring as the hint changes, then restarts cleanly', () => {
    render(<RotatingHint onSelect={jest.fn()} />);

    expect(hintText()).toContain(HOME_HINTS[0].text);
    advance(HINT_INTERVAL_MS * 0.5);
    expect(hintText()).toContain(HOME_HINTS[0].text);

    // One frame before the boundary the ring has finished its sweep.
    advance(HINT_INTERVAL_MS * 0.5 - 16);
    expect(filledPercent()).toBeGreaterThan(97);

    // Crossing the boundary swaps the hint and empties the ring for the new
    // cycle, so the reset is never missed.
    advance(32);
    advance(HINT_FADE_MS);
    expect(hintText()).toContain(HOME_HINTS[1].text);
    expect(hintText()).not.toContain(HOME_HINTS[0].text);
    expect(filledPercent()).toBeLessThan(45);

    // And it fills again from empty on the new cycle.
    advance(HINT_INTERVAL_MS * 0.25);
    expect(filledPercent()).toBeGreaterThan(15);
    expect(filledPercent()).toBeLessThan(45);
  });

  it('keeps the ring and the hint in step across every rotation', () => {
    render(<RotatingHint onSelect={jest.fn()} />);

    // The fade timeout consumes real time inside each cycle, so track the fake
    // clock in absolute terms instead of advancing by a fixed step per hint.
    let clock = 0;
    const advanceTo = (target: number) => {
      advance(target - clock);
      clock = target;
    };

    HOME_HINTS.forEach((hint, position) => {
      advance(16);
      clock += 16;
      expect(hintText()).toContain(hint.text);

      // One frame before the boundary the ring has finished its sweep.
      advanceTo((position + 1) * HINT_INTERVAL_MS - 16);
      expect(filledPercent()).toBeGreaterThan(97);

      // Crossing the boundary restarts the ring, then the hint swaps.
      advanceTo((position + 1) * HINT_INTERVAL_MS + 16);
      expect(filledPercent()).toBeLessThan(10);
      advanceTo((position + 1) * HINT_INTERVAL_MS + HINT_FADE_MS);
      expect(hintText()).toContain(
        HOME_HINTS[(position + 1) % HOME_HINTS.length].text
      );
    });
  });

  it('hides the ring and stops rotating when reduced motion is requested', () => {
    setReducedMotion(true);
    render(<RotatingHint onSelect={jest.fn()} />);

    expect(screen.queryByTestId('home-hint-progress')).toBeNull();
    expect(hintText()).toContain(HOME_HINTS[0].text);

    // No rotation means the ring would never complete, so nothing changes.
    advance(HINT_INTERVAL_MS * 2);
    expect(hintText()).toContain(HOME_HINTS[0].text);
  });

  it('reports the selected hint to the caller', () => {
    const onSelect = jest.fn();
    render(<RotatingHint onSelect={onSelect} />);

    act(() => {
      screen
        .getByRole('button', { name: new RegExp(HOME_HINTS[0].text) })
        .click();
    });

    expect(onSelect).toHaveBeenCalledWith(HOME_HINTS[0].href);
  });
});
