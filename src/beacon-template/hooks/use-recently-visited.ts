"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { getRecentPage, type RecentPage } from "@/lib/navigation"

const MAX_RECENT_PAGES = 4
const STORAGE_KEY = "beacon_recently_visited"

export function useRecentlyVisited() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userKey = session?.user?._id || session?.user?.email
  const storageKey = userKey ? `${STORAGE_KEY}_${userKey}` : null

  const [visitedPages, setVisitedPages] = useState<RecentPage[]>([])
  const [loadedKey, setLoadedKey] = useState<string | null>(null)

  useEffect(() => {
    if (!storageKey) {
      setVisitedPages([])
      setLoadedKey(null)
      return
    }

    try {
      const stored = globalThis.localStorage.getItem(storageKey)
      const parsed = stored ? JSON.parse(stored) : []
      setVisitedPages(Array.isArray(parsed) ? parsed : [])
    } catch {
      setVisitedPages([])
    }
    setLoadedKey(storageKey)
  }, [storageKey])

  useEffect(() => {
    // Wait until this user's history is loaded so we never overwrite it.
    if (!pathname || !storageKey || loadedKey !== storageKey) return

    const page = getRecentPage(pathname)
    if (!page) return

    setVisitedPages((previous) => {
      if (previous[0]?.href === page.href) return previous

      const updated = [page, ...previous.filter((p) => p.href !== page.href)].slice(0, MAX_RECENT_PAGES)
      try {
        globalThis.localStorage.setItem(storageKey, JSON.stringify(updated))
      } catch {
        // Storage can be full or blocked; the in-memory list still works.
      }
      return updated
    })
  }, [pathname, storageKey, loadedKey])

  return { visitedPages }
}
