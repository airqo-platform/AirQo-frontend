import React from 'react';
import { render, screen } from '@testing-library/react';
import { ChartZoomScrubber } from '../ChartZoomScrubber';

const trackRect = (width = 200) =>
  ({
    left: 0,
    right: width,
    top: 0,
    bottom: 8,
    width,
    height: 8,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  }) as DOMRect;

// RTL's fireEvent.pointerDown drops clientX in jsdom's PointerEvent, so
// dispatch native events with the props assigned explicitly.
const firePointer = (
  element: Element,
  type: string,
  props: Record<string, unknown>
) => {
  const event = new Event(type, { bubbles: true });
  Object.assign(event, props);
  element.dispatchEvent(event);
};

describe('ChartZoomScrubber', () => {
  beforeEach(() => {
    jest
      .spyOn(HTMLElement.prototype, 'getBoundingClientRect')
      .mockReturnValue(trackRect());
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderScrubber = (overrides = {}) => {
    const props = {
      totalPoints: 100,
      zoomRange: { startIndex: 25, endIndex: 49 },
      onPan: jest.fn(),
      onPanToCenter: jest.fn(),
      ...overrides,
    };
    const view = render(<ChartZoomScrubber {...props} />);
    return { ...view, props };
  };

  it('renders nothing without a zoom window', () => {
    const { container } = render(
      <ChartZoomScrubber
        totalPoints={100}
        zoomRange={null}
        onPan={jest.fn()}
        onPanToCenter={jest.fn()}
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('exposes the exact window as a slider and thumb', () => {
    renderScrubber({ zoomRange: { startIndex: 25, endIndex: 49 } });

    const slider = screen.getByRole('slider', { name: 'Scroll chart window' });
    expect(slider).toHaveAttribute('aria-valuemin', '0');
    expect(slider).toHaveAttribute('aria-valuemax', '75');
    expect(slider).toHaveAttribute('aria-valuenow', '25');

    const thumb = screen.getByTestId('scrubber-thumb');
    expect(thumb.style.left).toBe('25%');
    expect(thumb.style.width).toBe('25%');
  });

  it('marks the window as export-ignored', () => {
    renderScrubber();
    const container = screen.getByRole('slider').parentElement as HTMLElement;
    expect(container).toHaveAttribute('data-export-ignore');
    expect(container).toHaveAttribute('data-html2canvas-ignore', 'true');
  });

  it('pans by keyboard: arrows move 10% of the window, Home/End jump', () => {
    const { props } = renderScrubber({
      zoomRange: { startIndex: 25, endIndex: 49 },
    });
    const slider = screen.getByRole('slider');

    fireKey(slider, 'ArrowRight');
    expect(props.onPan).toHaveBeenCalledWith(3); // round(25 * 0.1)

    fireKey(slider, 'ArrowLeft');
    expect(props.onPan).toHaveBeenLastCalledWith(-3);

    fireKey(slider, 'Home');
    expect(props.onPanToCenter).toHaveBeenCalledWith(0);

    fireKey(slider, 'End');
    expect(props.onPanToCenter).toHaveBeenCalledWith(99);
  });

  it('presses on the track jump the window center to that fraction', () => {
    const { props } = renderScrubber({ totalPoints: 100 });
    const slider = screen.getByRole('slider');

    firePointer(slider, 'pointerdown', { pointerId: 1, clientX: 75 });

    // Track width 200px, press at 75px → fraction 0.375 → center index 37.5.
    expect(props.onPanToCenter).toHaveBeenCalledWith(37.5);
  });

  it('drags the thumb to pan by exact index deltas', () => {
    const { props } = renderScrubber({ totalPoints: 100 });
    const slider = screen.getByRole('slider');
    const thumb = screen.getByTestId('scrubber-thumb');

    // Dispatch on the thumb: the event bubbles to the track's handler with
    // `target` naturally set to the thumb (skips the jump-to-click logic).
    firePointer(thumb, 'pointerdown', { pointerId: 1, clientX: 100 });
    firePointer(slider, 'pointermove', { pointerId: 1, clientX: 140 });
    // 40px over 200px-wide track = 20 indices.
    expect(props.onPan).toHaveBeenCalledWith(20);

    firePointer(slider, 'pointermove', { pointerId: 1, clientX: 90 });
    // (90-100)/2 = -5 target → delta -5 - 20 = -25.
    expect(props.onPan).toHaveBeenLastCalledWith(-25);
  });

  it('stops panning on pointer up', () => {
    const { props } = renderScrubber({ totalPoints: 100 });
    const slider = screen.getByRole('slider');
    const thumb = screen.getByTestId('scrubber-thumb');

    firePointer(thumb, 'pointerdown', { pointerId: 1, clientX: 100 });
    firePointer(slider, 'pointerup', { pointerId: 1 });
    firePointer(slider, 'pointermove', { pointerId: 1, clientX: 180 });

    expect(props.onPan).not.toHaveBeenCalled();
  });
});

const fireKey = (element: Element, key: string) => {
  element.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })
  );
};
