import React from 'react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductTour, PRODUCT_TOUR_Z_INDEX } from '../components/ProductTour';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

jest.mock('@/shared/components/ui/card', () => {
  const React = jest.requireActual<typeof import('react')>('react');

  const Card = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
  >(function Card({ children, ...props }, ref) {
    return (
      <div ref={ref} {...props}>
        {children}
      </div>
    );
  });
  Card.displayName = 'Card';

  return { Card };
});

const steps = [
  {
    target: '[data-tour="missing"]',
    title: 'First step',
    description: 'Start here.',
  },
  {
    target: '[data-tour="missing"]',
    title: 'Last step',
    description: 'Finish here.',
  },
];

const clampSteps = [
  {
    target: '[data-tour="clamp-target"]',
    title: 'Clamped step',
    description: 'The card must stay inside the viewport.',
  },
];

// jsdom's window is 1024x768 and has neither matchMedia nor scrollIntoView;
// capture the originals so the viewport/rect stubs can be reverted after
// every test (the tour touches all three once a target is visible).
const originalInnerWidth = window.innerWidth;
const originalInnerHeight = window.innerHeight;
const originalMatchMedia = window.matchMedia;
const originalScrollIntoView = Element.prototype.scrollIntoView;

const stubViewport = (width: number, height: number) => {
  window.innerWidth = width;
  window.innerHeight = height;
  window.matchMedia = jest.fn().mockReturnValue({ matches: false });
  Element.prototype.scrollIntoView = jest.fn();
};

const restoreViewport = () => {
  window.innerWidth = originalInnerWidth;
  window.innerHeight = originalInnerHeight;
  window.matchMedia = originalMatchMedia;
  if (originalScrollIntoView) {
    Element.prototype.scrollIntoView = originalScrollIntoView;
  } else {
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView');
  }
};

/** Card rect for `role="dialog"`, target rect for the tour's `[data-tour]` node. */
const stubRects = (cardRect: DOMRect, targetRect: DOMRect) =>
  jest
    .spyOn(Element.prototype, 'getBoundingClientRect')
    .mockImplementation(function (this: Element) {
      if (this.getAttribute('role') === 'dialog') return cardRect;
      if (this.getAttribute('data-tour') === 'clamp-target') return targetRect;
      return new DOMRect();
    });

afterEach(() => {
  restoreViewport();
  jest.restoreAllMocks();
});

describe('ProductTour', () => {
  it('keeps Tab on the last control and Shift+Tab on the first inside the tour', async () => {
    const user = userEvent.setup();
    render(
      <>
        <button type="button">Outside</button>
        <ProductTour steps={steps} onClose={jest.fn()} />
      </>
    );

    const close = screen.getByRole('button', { name: 'Close tour' });
    const next = screen.getByRole('button', { name: 'Next' });
    const outside = screen.getByRole('button', { name: 'Outside' });

    next.focus();
    await user.tab();
    expect(close).toHaveFocus();
    expect(outside).not.toHaveFocus();

    await user.tab({ shift: true });
    expect(next).toHaveFocus();
    expect(outside).not.toHaveFocus();
  });

  it('renders the overlay through a portal into document.body', () => {
    const { container } = render(
      <ProductTour steps={steps} onClose={jest.fn()} />
    );

    const tour = screen.getByTestId('product-tour');
    expect(tour).toBeInTheDocument();
    expect(document.body.contains(tour)).toBe(true);
    expect(container.contains(tour)).toBe(false);
  });

  it('layers the overlay above page content but below the loading overlay', () => {
    render(<ProductTour steps={steps} onClose={jest.fn()} />);

    const tour = screen.getByTestId('product-tour');
    expect(tour.style.zIndex).toBe(String(PRODUCT_TOUR_Z_INDEX));
    expect(Number(tour.style.zIndex)).toBeGreaterThan(10000);
    expect(Number(tour.style.zIndex)).toBeLessThan(2147483647);
  });

  it('clamps the card inside a 320px viewport with a 16px margin', () => {
    stubViewport(320, 568);
    // Card is 24rem (288px) wide; the target sits against the right edge and
    // too low, so the naive placement would overflow both axes.
    stubRects(new DOMRect(0, 0, 288, 400), new DOMRect(260, 400, 120, 80));

    render(
      <>
        <div data-tour="clamp-target" />
        <ProductTour steps={clampSteps} onClose={jest.fn()} />
      </>
    );

    const card = screen.getByRole('dialog');
    const left = Number.parseFloat(card.style.left);
    const top = Number.parseFloat(card.style.top);

    expect(left).toBeGreaterThanOrEqual(16);
    expect(left + 288).toBeLessThanOrEqual(320);
    expect(top).toBeGreaterThanOrEqual(16);
    expect(top + 400).toBeLessThanOrEqual(568);
  });

  it('re-clamps the card when the window is resized', () => {
    stubViewport(800, 600);
    stubRects(new DOMRect(0, 0, 288, 400), new DOMRect(40, 40, 120, 80));

    render(
      <>
        <div data-tour="clamp-target" />
        <ProductTour steps={clampSteps} onClose={jest.fn()} />
      </>
    );

    const card = screen.getByRole('dialog');
    // At 800px wide the target-aligned placement fits as-is.
    expect(Number.parseFloat(card.style.left)).toBe(40);

    window.innerWidth = 320;
    window.innerHeight = 568;
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    const left = Number.parseFloat(card.style.left);
    const top = Number.parseFloat(card.style.top);
    expect(left).toBeGreaterThanOrEqual(16);
    expect(left + 288).toBeLessThanOrEqual(320);
    expect(top).toBeGreaterThanOrEqual(16);
  });

  it('keeps the spotlight cutout covering a target that hugs the viewport', () => {
    stubViewport(320, 568);
    const target = new DOMRect(0, 0, 120, 80);
    stubRects(new DOMRect(0, 0, 288, 400), target);

    render(
      <>
        <div data-tour="clamp-target" />
        <ProductTour steps={clampSteps} onClose={jest.fn()} />
      </>
    );

    const spotlight = document.querySelector<HTMLElement>('[class*="9999px"]');
    if (!spotlight) throw new Error('spotlight cutout was not rendered');

    const left = Number.parseFloat(spotlight.style.left);
    const top = Number.parseFloat(spotlight.style.top);
    const right = left + Number.parseFloat(spotlight.style.width);
    const bottom = top + Number.parseFloat(spotlight.style.height);

    // Never a negative offset, yet the cutout still contains the target.
    expect(left).toBeGreaterThanOrEqual(0);
    expect(top).toBeGreaterThanOrEqual(0);
    expect(left).toBeLessThanOrEqual(target.left);
    expect(top).toBeLessThanOrEqual(target.top);
    expect(right).toBeGreaterThanOrEqual(target.right);
    expect(bottom).toBeGreaterThanOrEqual(target.bottom);
  });
});
