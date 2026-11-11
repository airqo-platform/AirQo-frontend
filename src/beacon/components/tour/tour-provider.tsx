"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  claimFeedbackPromptSlot,
  releaseFeedbackPromptSlot,
} from "@/components/features/feedback/feedback-prompt-slot"
import { ProductTour, type TourOutcome } from "@/components/tour/product-tour"
import { trackEvent } from "@/lib/analytics"
import { useNavigationAccess } from "@/hooks/use-navigation-access"
import { useToast } from "@/hooks/use-toast"
import {
  findVisibleTarget,
  getTourForPath,
  getVisibleSteps,
  hasSeenTour,
  markTourSeen,
  type TourStep,
} from "@/lib/tours"

/** Lets the page finish laying out once it's ready, so steps aren't skipped for rendering a beat late. */
const SETTLE_BEFORE_STARTING_MS = 400

const TOUR_PROMPT_SLOT = "product-tour"

interface TourContextValue {
  /** Whether the page on screen has a tour to replay. */
  hasTour: boolean
  /**
   * Replays the tour. Focus returns to `returnFocusTo` afterwards, or else to whatever had it.
   * `trigger` names where it was started from, for analytics.
   */
  startTour: (returnFocusTo?: HTMLElement | null, trigger?: string) => void
}

const TourContext = createContext<TourContextValue>({ hasTour: false, startTour: () => {} })

export const useTour = () => useContext(TourContext)

/**
 * Runs a page's tour the first time someone reaches it with something to show, and lets them
 * replay it. A page still loading or empty waits, so the tour isn't used up on nothing.
 */
export function TourProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const access = useNavigationAccess()
  const { data: session } = useSession()
  const { toast } = useToast()
  const [activeSteps, setActiveSteps] = useState<TourStep[] | null>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  // The tour on screen, for analytics: which one, how it started and how long it is
  const runningTourRef = useRef<{ tour_id: string; trigger: string; step_count: number } | null>(null)

  const personId = session?.user?._id || session?.user?.email || ""
  const tour = pathname && !access.loading ? getTourForPath(pathname, access) : null

  const showTour = useCallback((tourId: string, steps: TourStep[], trigger: string) => {
    runningTourRef.current = { tour_id: tourId, trigger, step_count: steps.length }
    trackEvent("tour_started", runningTourRef.current)
    setActiveSteps(steps)
  }, [])

  useEffect(() => {
    // Leaving the page ends a tour without marking it seen
    if (runningTourRef.current) {
      trackEvent("tour_dismissed", { ...runningTourRef.current, reason: "left_page" })
      runningTourRef.current = null
    }
    setActiveSteps(null)
    returnFocusRef.current = null
  }, [pathname])

  useEffect(() => {
    if (!tour || !personId || hasSeenTour(personId, tour.id)) return

    let settleTimer: ReturnType<typeof setTimeout> | undefined
    const startWhenReady = () => {
      if (!findVisibleTarget(tour.readyTarget)) return false
      settleTimer = setTimeout(() => {
        // The user may have started (or finished) it from the help menu in the meantime
        if (runningTourRef.current || hasSeenTour(personId, tour.id)) return
        const steps = getVisibleSteps(tour)
        if (steps.length > 0) showTour(tour.id, steps, "automatic")
      }, SETTLE_BEFORE_STARTING_MS)
      return true
    }

    if (startWhenReady()) return () => clearTimeout(settleTimer)

    const observer = new MutationObserver(() => {
      if (startWhenReady()) observer.disconnect()
    })
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      clearTimeout(settleTimer)
    }
  }, [tour, personId, showTour])

  // The satisfaction prompts wait until the tour is over
  useEffect(() => {
    if (!activeSteps) return
    claimFeedbackPromptSlot(TOUR_PROMPT_SLOT)
    return () => releaseFeedbackPromptSlot(TOUR_PROMPT_SLOT)
  }, [activeSteps])

  const closeTour = useCallback((outcome: TourOutcome, stepsViewed: number) => {
    if (runningTourRef.current) {
      trackEvent(outcome === "completed" ? "tour_completed" : "tour_dismissed", {
        ...runningTourRef.current,
        reason: outcome === "completed" ? undefined : "closed",
        steps_viewed: stepsViewed,
      })
      runningTourRef.current = null
    }
    if (tour && personId) markTourSeen(personId, tour.id)
    setActiveSteps(null)
    returnFocusRef.current?.focus()
    returnFocusRef.current = null
  }, [tour, personId])

  const startTour = useCallback(
    (returnFocusTo?: HTMLElement | null, trigger = "manual") => {
      if (!tour) return
      const steps = getVisibleSteps(tour)
      if (steps.length === 0) {
        toast({
          title: "Nothing to show here yet",
          description: "This page's tour starts once it has something on it.",
        })
        return
      }
      const focused = document.activeElement
      returnFocusRef.current = returnFocusTo ?? (focused instanceof HTMLElement ? focused : null)
      showTour(tour.id, steps, trigger)
    },
    [tour, toast, showTour]
  )

  const value = useMemo(() => ({ hasTour: Boolean(tour), startTour }), [tour, startTour])

  return (
    <TourContext.Provider value={value}>
      {children}
      {activeSteps && tour && <ProductTour steps={activeSteps} title={tour.title} onClose={closeTour} />}
    </TourContext.Provider>
  )
}
