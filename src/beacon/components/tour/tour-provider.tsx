"use client"

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  claimFeedbackPromptSlot,
  releaseFeedbackPromptSlot,
} from "@/components/features/feedback/feedback-prompt-slot"
import { ProductTour } from "@/components/tour/product-tour"
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
  /** Replays the tour. Focus returns to `returnFocusTo` afterwards, or else to whatever had it. */
  startTour: (returnFocusTo?: HTMLElement | null) => void
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

  const personId = session?.user?._id || session?.user?.email || ""
  const tour = pathname && !access.loading ? getTourForPath(pathname, access) : null

  useEffect(() => {
    setActiveSteps(null)
    returnFocusRef.current = null
  }, [pathname])

  useEffect(() => {
    if (!tour || !personId || hasSeenTour(personId, tour.id)) return

    let settleTimer: ReturnType<typeof setTimeout> | undefined
    const startWhenReady = () => {
      if (!findVisibleTarget(tour.readyTarget)) return false
      settleTimer = setTimeout(() => {
        const steps = getVisibleSteps(tour)
        if (steps.length > 0) setActiveSteps(steps)
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
  }, [tour, personId])

  // The satisfaction prompts wait until the tour is over
  useEffect(() => {
    if (!activeSteps) return
    claimFeedbackPromptSlot(TOUR_PROMPT_SLOT)
    return () => releaseFeedbackPromptSlot(TOUR_PROMPT_SLOT)
  }, [activeSteps])

  const closeTour = useCallback(() => {
    if (tour && personId) markTourSeen(personId, tour.id)
    setActiveSteps(null)
    returnFocusRef.current?.focus()
    returnFocusRef.current = null
  }, [tour, personId])

  const startTour = useCallback(
    (returnFocusTo?: HTMLElement | null) => {
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
      setActiveSteps(steps)
    },
    [tour, toast]
  )

  const value = useMemo(() => ({ hasTour: Boolean(tour), startTour }), [tour, startTour])

  return (
    <TourContext.Provider value={value}>
      {children}
      {activeSteps && tour && <ProductTour steps={activeSteps} title={tour.title} onClose={closeTour} />}
    </TourContext.Provider>
  )
}
