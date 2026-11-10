"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AqArrowLeft, AqArrowRight, AqXClose } from "@airqo/icons-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { findVisibleTarget, getTourCardPosition, type TourStep } from "@/lib/tours"

/**
 * Above everything a page can open: dialogs (z-[9999]), the navigation drawer (z-[10001]), its
 * flyouts (z-[10002]), toasts (z-[10003]), the side menu's flyouts (z-[99999]) and the maintenance
 * map's controls.
 */
const TOUR_Z_INDEX = 100000

const FOCUSABLE_SELECTOR = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",")

const readViewportSize = () => ({
  width: window.visualViewport?.width ?? window.innerWidth,
  height: window.visualViewport?.height ?? window.innerHeight,
})

interface ProductTourProps {
  steps: TourStep[]
  title: string
  onClose: () => void
}

/** Spotlights one thing at a time with a card explaining it. Adapted from Nexus's ProductTour. */
export function ProductTour({ steps, title, onClose }: Readonly<ProductTourProps>) {
  const [index, setIndex] = useState(0)
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)
  const [cardPosition, setCardPosition] = useState({ top: 16, left: 16 })
  // document.body only exists after hydration
  const [mounted, setMounted] = useState(false)
  const [viewport, setViewport] = useState(() =>
    typeof window === "undefined" ? { width: 0, height: 0 } : readViewportSize()
  )
  const nextButtonRef = useRef<HTMLButtonElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const currentStep = steps[index]

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted) nextButtonRef.current?.focus()
  }, [mounted])

  useEffect(() => {
    const syncViewport = () =>
      setViewport((previous) => {
        const next = readViewportSize()
        return previous.width === next.width && previous.height === next.height ? previous : next
      })
    window.addEventListener("resize", syncViewport)
    window.addEventListener("orientationchange", syncViewport)
    window.visualViewport?.addEventListener("resize", syncViewport)
    return () => {
      window.removeEventListener("resize", syncViewport)
      window.removeEventListener("orientationchange", syncViewport)
      window.visualViewport?.removeEventListener("resize", syncViewport)
    }
  }, [])

  // Follow the target as the page scrolls, resizes or re-renders around it
  useEffect(() => {
    if (!currentStep) return

    findVisibleTarget(currentStep.target)?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "center",
    })

    const update = () => setTargetRect(findVisibleTarget(currentStep.target)?.getBoundingClientRect() ?? null)
    update()
    const observer = new MutationObserver(update)
    observer.observe(document.body, { childList: true, subtree: true })
    window.addEventListener("scroll", update, true)
    window.addEventListener("resize", update)
    window.addEventListener("orientationchange", update)
    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", update, true)
      window.removeEventListener("resize", update)
      window.removeEventListener("orientationchange", update)
    }
  }, [currentStep])

  useLayoutEffect(() => {
    const card = cardRef.current
    if (!card) return
    const { width, height } = card.getBoundingClientRect()
    const next = getTourCardPosition(targetRect, { width, height }, viewport)
    setCardPosition((previous) =>
      previous.top === next.top && previous.left === next.left ? previous : next
    )
  }, [mounted, viewport, currentStep, targetRect])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose()
      if (event.key === "ArrowRight" && index < steps.length - 1) setIndex((value) => value + 1)
      if (event.key === "ArrowLeft" && index > 0) setIndex((value) => value - 1)
      if (event.key !== "Tab" || !cardRef.current) return

      // Keep Tab inside the card: everything behind the overlay is out of reach
      const focusable = Array.from(cardRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      const inside = active instanceof HTMLElement && cardRef.current.contains(active)

      if (!inside || (event.shiftKey && active === first)) {
        event.preventDefault()
        ;(event.shiftKey ? last : first).focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [index, onClose, steps.length])

  if (!currentStep || !mounted) return null

  return createPortal(
    <div className="fixed inset-0" style={{ zIndex: TOUR_Z_INDEX }} data-testid="product-tour">
      {targetRect ? (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed rounded-md bg-transparent shadow-[0_0_0_9999px_rgb(0_0_0/0.45)] ring-2 ring-foreground/80 transition-[top,left,width,height] duration-200 motion-reduce:transition-none"
          style={{
            // Never negative, so targets hugging the viewport's edge stay inside the cutout
            top: Math.max(0, targetRect.top - 6),
            left: Math.max(0, targetRect.left - 6),
            width: targetRect.width + 12,
            height: targetRect.height + 12,
          }}
        />
      ) : (
        <div aria-hidden="true" className="fixed inset-0 bg-black/45" />
      )}
      <Card
        ref={cardRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="fixed w-[min(24rem,calc(100vw-2rem))] max-h-[calc(100dvh-2rem)] overflow-y-auto p-5 shadow-2xl"
        style={cardPosition}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground">
              {title} · {index + 1} of {steps.length}
            </p>
            <h2 className="text-lg font-semibold text-foreground">{currentStep.title}</h2>
          </div>
          <button
            type="button"
            aria-label="Close tour"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <AqXClose className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{currentStep.description}</p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="flex gap-1" aria-hidden="true">
            {steps.map((step, stepIndex) => (
              <span
                key={step.target}
                className={`h-1.5 rounded-full ${
                  stepIndex === index ? "w-5 bg-primary" : "w-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </span>
          <div className="flex gap-2">
            {index > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setIndex((value) => value - 1)}>
                <AqArrowLeft className="h-4 w-4" aria-hidden="true" />
                Back
              </Button>
            )}
            {index < steps.length - 1 ? (
              <Button ref={nextButtonRef} size="sm" onClick={() => setIndex((value) => value + 1)}>
                Next
                <AqArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button ref={nextButtonRef} size="sm" onClick={onClose}>
                Done
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>,
    document.body
  )
}
