import React from 'react';
import { act, render, screen } from '@testing-library/react';
import { RotatingHint } from '../components/RotatingHint';
import { HOME_HINTS } from '../constants';

const HINT_INTERVAL_MS = 5600;
const HINT_FADE_MS = 220;

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

const advance = (ms: number) => {
  act(() => {
    jest.advanceTimersByTime(ms);
  });
};

describe('RotatingHint', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // rAF must fire on the timers the fake clock controls so the ring's first
    // frame and each cycle restart are observable.
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
    // Decorative only: the ring duplicates information the copy already carries.
    expect(ring).toHaveAttribute('aria-hidden', 'true');
    expect(ring).toHaveClass('absolute', 'right-4', 'top-4');

    const arc = progressArc();
    expect(arc).toHaveClass('stroke-primary');
    expect(arc.getAttribute('stroke-dasharray')).toBe(
      String(2 * Math.PI * 7.5)
    );
    expect(arc).toHaveStyle({
      transition: `stroke-dashoffset ${HINT_INTERVAL_MS}ms linear`,
    });
  });

  it('fills the ring over one cycle and completes as the hint changes', () => {
    render(<RotatingHint onSelect={jest.fn()} />);

    // Starts empty, then transitions to full across the interval.
    expect(progressArc()).toHaveStyle({
      strokeDashoffset: String(2 * Math.PI * 7.5),
    });
    advance(16);
    expect(progressArc()).toHaveStyle({ strokeDashoffset: '0' });

    const firstHint = HOME_HINTS[0].text;
    const firstRing = screen.getByTestId('home-hint-progress');

    advance(HINT_INTERVAL_MS);
    advance(HINT_FADE_MS);
    expect(screen.getByTestId('home-hint')).toHaveTextContent(
      HOME_HINTS[1].text
    );
    expect(screen.getByTestId('home-hint')).not.toHaveTextContent(firstHint);

    // A fresh ring node per cycle restarts the fill from empty instead of
    // leaving the previous cycle's completed arc on screen.
    expect(screen.getByTestId('home-hint-progress')).not.toBe(firstRing);
    advance(16);
    expect(progressArc()).toHaveStyle({ strokeDashoffset: '0' });
    expect(progressArc()).toHaveStyle({
      transition: `stroke-dashoffset ${HINT_INTERVAL_MS}ms linear`,
    });
  });

  it('hides the ring and stops rotating when reduced motion is requested', () => {
    setReducedMotion(true);
    render(<RotatingHint onSelect={jest.fn()} />);

    expect(screen.queryByTestId('home-hint-progress')).toBeNull();
    expect(screen.getByTestId('home-hint')).toHaveTextContent(
      HOME_HINTS[0].text
    );

    // No rotation means the ring would never complete, so nothing changes.
    advance(HINT_INTERVAL_MS * 2);
    expect(screen.getByTestId('home-hint')).toHaveTextContent(
      HOME_HINTS[0].text
    );
  });

  it('rotates through every hint and wraps around', () => {
    render(<RotatingHint onSelect={jest.fn()} />);

    HOME_HINTS.forEach((hint, position) => {
      expect(screen.getByTestId('home-hint')).toHaveTextContent(hint.text);
      advance(HINT_INTERVAL_MS);
      advance(HINT_FADE_MS);
      if (position === HOME_HINTS.length - 1) {
        // Wraps back to the first hint after the last one.
        expect(screen.getByTestId('home-hint')).toHaveTextContent(
          HOME_HINTS[0].text
        );
      }
    });
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
