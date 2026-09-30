'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { AqArrowLeft, AqArrowRight, AqXClose } from '@airqo/icons-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';

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

export function ProductTour({
  steps,
  onClose,
  title = 'Explore Nexus',
}: ProductTourProps) {
  const [index, setIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [popover, setPopover] = useState({ top: 16, left: 16 });
  const nextButtonRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const currentStep = steps[index];

  useEffect(() => {
    nextButtonRef.current?.focus();
  }, []);

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
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
    };
  }, [currentStep]);

  useLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    const cardRect = card.getBoundingClientRect();
    const margin = 16;
    const gap = 14;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (!targetRect) {
      setPopover({
        top: Math.max(margin, viewportHeight - cardRect.height - margin),
        left: Math.max(margin, (viewportWidth - cardRect.width) / 2),
      });
      return;
    }

    let top = targetRect.bottom + gap;
    if (top + cardRect.height > viewportHeight - margin) {
      top = targetRect.top - gap - cardRect.height;
    }
    if (top < margin) {
      top = Math.max(margin, viewportHeight - cardRect.height - margin);
    }

    let left = targetRect.left;
    if (left + cardRect.width > viewportWidth - margin) {
      left = viewportWidth - cardRect.width - margin;
    }

    setPopover({
      top,
      left: Math.max(margin, left),
    });
  }, [currentStep, targetRect]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' && index < steps.length - 1) {
        setIndex(value => value + 1);
      }
      if (event.key === 'ArrowLeft' && index > 0) {
        setIndex(value => value - 1);
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

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[80]"
      data-testid="product-tour"
    >
      {targetRect ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-md bg-transparent shadow-[0_0_0_9999px_rgb(0_0_0/0.45)] ring-2 ring-foreground/80 transition-[top,left,width,height] duration-200 motion-reduce:transition-none"
          style={{
            top: Math.max(8, targetRect.top - 6),
            left: Math.max(8, targetRect.left - 6),
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
        className="pointer-events-auto fixed w-[min(24rem,calc(100vw-2rem))] border border-border bg-card p-5 shadow-xl"
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
}
