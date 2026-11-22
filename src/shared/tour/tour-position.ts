// TourStep and the card-positioning helpers, copied from beacon/lib/tours.ts.
// The tour definitions and "seen" storage stay in each app.

export interface TourStep {
  /** Selector for what the step spotlights. A step whose target isn't on screen is skipped. */
  target: string
  title: string
  description: string
}

export const findVisibleTarget = (selector: string): HTMLElement | null =>
  Array.from(document.querySelectorAll<HTMLElement>(selector)).find((element) => {
    const rect = element.getBoundingClientRect()
    return rect.width > 0 && rect.height > 0
  }) ?? null

interface Size {
  width: number
  height: number
}

type TargetBox = Pick<DOMRect, "top" | "right" | "bottom" | "left">

/**
 * Where the tour card goes: below its target, else above, else beside it for targets as tall as
 * the screen, always inside a 16px gutter so it can't drift off a small viewport.
 */
export function getTourCardPosition(
  target: TargetBox | null,
  card: Size,
  viewport: Size
): { top: number; left: number } {
  const margin = 16
  const gap = 14
  const maxLeft = Math.max(margin, viewport.width - card.width - margin)
  const maxTop = Math.max(margin, viewport.height - card.height - margin)
  const clampLeft = (value: number) => Math.min(Math.max(margin, value), maxLeft)
  const clampTop = (value: number) => Math.min(Math.max(margin, value), maxTop)
  const bottomCentre = { top: maxTop, left: clampLeft((viewport.width - card.width) / 2) }

  if (!target) return bottomCentre

  // Clamped even where it fits, because the page can scroll the target off screen behind the tour
  if (target.bottom + gap + card.height <= viewport.height - margin) {
    return { top: clampTop(target.bottom + gap), left: clampLeft(target.left) }
  }
  if (target.top - gap - card.height >= margin) {
    return { top: clampTop(target.top - gap - card.height), left: clampLeft(target.left) }
  }
  if (target.right + gap + card.width <= viewport.width - margin) {
    return { top: clampTop(target.top), left: clampLeft(target.right + gap) }
  }
  if (target.left - gap - card.width >= margin) {
    return { top: clampTop(target.top), left: clampLeft(target.left - gap - card.width) }
  }
  return bottomCentre
}

// ===========================================================
// Which tours someone has seen
// ===========================================================

// Must not contain "auth", "token" or "user": see the note in lib/feedback-preferences.ts.
const SEEN_TOURS_KEY = "beacon_tours_seen"

// Where storage is blocked, this at least stops a tour repeating on every page visit.
const seenThisSession = new Set<string>()

