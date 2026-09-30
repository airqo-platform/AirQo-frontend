'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AqArrowLeft, AqArrowRight, AqXClose } from '@airqo/icons-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import {
  PRODUCT_TOUR_STEP_EVENT,
  type ProductTourStepEventDetail,
} from '@/shared/lib/tourEvents';

export interface ProductTourStep {
  target: string;
  title: string;
  description: string;
}

interface ProductTourProps {
  steps: ProductTourStep[];
  onClose: () => void;
  title?: string;
}

const findVisibleTarget = (selector: string): HTMLElement | null =>
  Array.from(document.querySelectorAll<HTMLElement>(selector)).find(element => {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }) ?? null;

/**
 * Overlay layer for the tour. Sits above every page layer that could cover
 * it (MapPage banners at z-[10000], map controls at z-[1100], dialogs at
 * z-[10001]) while staying below the global loading overlay
 * (z-[2147483647]) so an in-flight request can still surface above the tour.
 */
export const PRODUCT_TOUR_Z_INDEX = 10050;

interface ViewportSize {
  width: number;
  height: number;
}

const readViewportSize = (): ViewportSize => ({
  width: window.visualViewport?.width ?? window.innerWidth,
  height: window.visualViewport?.height ?? window.innerHeight,
});

const FOCUSABLE_SELECTOR = [
  'button:not([disabled])',
  'a[href]',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

const getFocusable = (container: HTMLElement): HTMLElement[] =>
  Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
  ).filter(element => !element.hasAttribute('disabled'));

export function ProductTour({
  steps,
  onClose,
  title = 'Explore Nexus',
}: ProductTourProps) {
  const [index, setIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [popover, setPopover] = useState({ top: 16, left: 16 });
  // Portal mount guard: `document.body` only exists after hydration, so the
  // overlay is rendered on the client only (SSR renders nothing).
  const [mounted, setMounted] = useState(false);
  // Tracked viewport (visual viewport when available) so the card is
  // re-clamped on resize/orientation changes instead of drifting off screen.
  const [viewport, setViewport] = useState<ViewportSize>(() =>
    typeof window === 'undefined' ? { width: 0, height: 0 } : readViewportSize()
  );
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const currentStep = steps[index];

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    nextButtonRef.current?.focus();
  }, [mounted]);

  useEffect(() => {
    const syncViewport = () =>
      setViewport(previous => {
        const next = readViewportSize();
        return previous.width === next.width && previous.height === next.height
          ? previous
          : next;
      });
    const visualViewport = window.visualViewport;
    window.addEventListener('resize', syncViewport);
    window.addEventListener('orientationchange', syncViewport);
    visualViewport?.addEventListener('resize', syncViewport);
    return () => {
      window.removeEventListener('resize', syncViewport);
      window.removeEventListener('orientationchange', syncViewport);
      visualViewport?.removeEventListener('resize', syncViewport);
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent<ProductTourStepEventDetail>(PRODUCT_TOUR_STEP_EVENT, {
        detail: { target: currentStep?.target ?? null },
      })
    );
    return () => {
      window.dispatchEvent(
        new CustomEvent<ProductTourStepEventDetail>(PRODUCT_TOUR_STEP_EVENT, {
          detail: { target: null },
        })
      );
    };
  }, [currentStep]);

  useEffect(() => {
    if (!currentStep) return;

    const target = findVisibleTarget(currentStep.target);
    if (target) {
      target.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
          ? 'instant'
          : 'smooth',
        block: 'center',
      });
    }

    const update = () => {
      setTargetRect(
        findVisibleTarget(currentStep.target)?.getBoundingClientRect() ?? null
      );
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, [currentStep]);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const cardRect = card.getBoundingClientRect();
    const margin = 16;
    const gap = 14;
    const viewportWidth = viewport.width;
    const viewportHeight = viewport.height;
    // Clamp targets: a 16px gutter inside the visual viewport, never a
    // negative offset and never past the right/bottom edge — at 320px wide
    // this keeps `left >= 16` and `left + cardWidth <= 320`.
    const maxLeft = Math.max(margin, viewportWidth - cardRect.width - margin);
    const maxTop = Math.max(margin, viewportHeight - cardRect.height - margin);
    const clampLeft = (value: number) =>
      Math.min(Math.max(margin, value), maxLeft);
    const clampTop = (value: number) =>
      Math.min(Math.max(margin, value), maxTop);

    let top: number;
    let left: number;

    if (!targetRect) {
      top = viewportHeight - cardRect.height - margin;
      left = (viewportWidth - cardRect.width) / 2;
    } else {
      top = targetRect.bottom + gap;
      if (top + cardRect.height > viewportHeight - margin) {
        top = targetRect.top - gap - cardRect.height;
      }
      if (top < margin) {
        top = viewportHeight - cardRect.height - margin;
      }

      left = targetRect.left;
      if (left + cardRect.width > viewportWidth - margin) {
        left = viewportWidth - cardRect.width - margin;
      }
    }

    const next = { top: clampTop(top), left: clampLeft(left) };
    setPopover(previous =>
      previous.top === next.top && previous.left === next.left ? previous : next
    );
  }, [mounted, viewport, currentStep, targetRect]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' && index < steps.length - 1) {
        setIndex(value => value + 1);
      }
      if (event.key === 'ArrowLeft' && index > 0) {
        setIndex(value => value - 1);
      }
      if (event.key !== 'Tab' || !cardRef.current) return;

      const focusable = getFocusable(cardRef.current);
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const inside =
        active instanceof HTMLElement && cardRef.current.contains(active);

      if (!inside || (event.shiftKey && active === first)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }
      if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [index, onClose, steps.length]);

  if (!currentStep) return null;

  const finish = () => {
    const target = findVisibleTarget(currentStep.target);
    onClose();
    const actionable = target?.matches('button, a, input')
      ? target
      : target?.querySelector<HTMLElement>('button, a, input');
    actionable?.focus();
  };

  const overlay = (
    <div
      className="fixed inset-0"
      style={{ zIndex: PRODUCT_TOUR_Z_INDEX }}
      data-testid="product-tour"
    >
      <div className="absolute inset-0" aria-hidden="true" />
      {targetRect ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-md bg-transparent shadow-[0_0_0_9999px_rgb(0_0_0/0.45)] ring-2 ring-foreground/80 transition-[top,left,width,height] duration-200 motion-reduce:transition-none"
          style={{
            // Clamp at 0 (never negative) so the cutout still fully contains
            // targets that hug the viewport edge.
            top: Math.max(0, targetRect.top - 6),
            left: Math.max(0, targetRect.left - 6),
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      ) : (
        <div aria-hidden="true" className="fixed inset-0 bg-foreground/40" />
      )}
      <Card
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="pointer-events-auto fixed w-[min(24rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] overflow-y-auto border border-border bg-card p-5 shadow-xl"
        style={{ top: popover.top, left: popover.left }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {title} · {index + 1} of {steps.length}
            </p>
            <h2 className="text-lg font-semibold text-foreground">
              {currentStep.title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Close tour"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <AqXClose className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          {currentStep.description}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="flex gap-1" aria-hidden="true">
            {steps.map((step, stepIndex) => (
              <span
                key={step.title}
                className={`h-1.5 rounded-full ${
                  stepIndex === index ? 'w-5 bg-primary' : 'w-1.5 bg-muted'
                }`}
              />
            ))}
          </span>
          <div className="flex gap-2">
            {index > 0 && (
              <Button
                variant="text"
                size="sm"
                Icon={AqArrowLeft}
                onClick={() => setIndex(value => value - 1)}
              >
                Back
              </Button>
            )}
            {index < steps.length - 1 ? (
              <Button
                ref={nextButtonRef}
                variant="filled"
                size="sm"
                iconPosition="end"
                Icon={AqArrowRight}
                onClick={() => setIndex(value => value + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                ref={nextButtonRef}
                variant="filled"
                size="sm"
                onClick={finish}
              >
                Try it
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );

  // Portalled to document.body so no stacking context from page content
  // (map, banners, drawers) can ever paint above the tour.
  return mounted ? createPortal(overlay, document.body) : null;
}
