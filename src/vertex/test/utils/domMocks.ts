import { beforeAll, afterAll } from "vitest";

export function setupPointerEventMock() {
  const originalPointerEvent = window.PointerEvent;
  const originalScrollIntoView = window.HTMLElement.prototype.scrollIntoView;
  const originalHasPointerCapture = window.HTMLElement.prototype.hasPointerCapture;
  const originalReleasePointerCapture = window.HTMLElement.prototype.releasePointerCapture;

  class MockPointerEvent extends Event {
    button: number;
    ctrlKey: boolean;
    pointerType: string;

    constructor(type: string, props: PointerEventInit) {
      super(type, props);
      this.button = props.button || 0;
      this.ctrlKey = props.ctrlKey || false;
      this.pointerType = props.pointerType || "mouse";
    }
  }

  beforeAll(() => {
    window.PointerEvent = MockPointerEvent as never;
    window.HTMLElement.prototype.scrollIntoView = () => {};
    window.HTMLElement.prototype.hasPointerCapture = () => false;
    window.HTMLElement.prototype.releasePointerCapture = () => {};
  });

  afterAll(() => {
    window.PointerEvent = originalPointerEvent;
    window.HTMLElement.prototype.scrollIntoView = originalScrollIntoView;
    window.HTMLElement.prototype.hasPointerCapture = originalHasPointerCapture;
    window.HTMLElement.prototype.releasePointerCapture = originalReleasePointerCapture;
  });
}

export function setupResizeObserverMock() {
  const originalResizeObserver = window.ResizeObserver;

  beforeAll(() => {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  });

  afterAll(() => {
    window.ResizeObserver = originalResizeObserver;
  });
}
