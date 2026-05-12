"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import authService from "@/services/api-service"

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserGroup {
  grp_title: string
  _id: string
  grp_profile_picture?: string | null
  organization_slug?: string
  status?: string
  createdAt?: string
  role?: {
    _id: string
    role_name: string
    role_permissions?: Array<{
      _id: string
      permission: string
    }>
  }
}

interface GroupContextValue {
  /** The currently active group title (e.g. "airqo") */
  activeGroup: string | null
  /** Full list of groups the user belongs to */
  availableGroups: UserGroup[]
  /** Set the active group and persist to localStorage */
  setActiveGroup: (grpTitle: string) => void
  /** Whether the groups are still loading */
  loading: boolean
  /** Error message if fetching failed */
  error: string | null
}

const STORAGE_KEY = "beacon_active_group"

const GroupContext = createContext<GroupContextValue>({
  activeGroup: null,
  availableGroups: [],
  setActiveGroup: () => {},
  loading: true,
  error: null,
})

// ─── Provider ────────────────────────────────────────────────────────────────

export function GroupProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [activeGroup, setCurrentActiveGroup] = useState<string | null>(null)
  const [availableGroups, setAvailableGroups] = useState<UserGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Persist group selection
  const setActiveGroup = useCallback((grpTitle: string) => {
    setCurrentActiveGroup(grpTitle)
    if (typeof globalThis.window !== "undefined") {
      globalThis.localStorage.setItem(STORAGE_KEY, grpTitle)
    }
  }, [])

  // On mount: fetch user profile → extract groups → pick active group
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const token = authService.getToken()
        if (!token) {
          setLoading(false)
          return
        }

        const response = await fetch("/api/auth/user", {
          method: "GET",
          headers: {
            Authorization: token,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch user profile (${response.status})`)
        }

        const data = await response.json()

        // The platform returns { success, users: [{ groups: [...] }] }
        const user = data.users?.[0]
        const groups: UserGroup[] = user?.groups ?? []

        setAvailableGroups(groups)

        // Pick active group: persisted selection → first group returned by profile
        const persisted =
          typeof globalThis.window !== "undefined"
            ? globalThis.localStorage.getItem(STORAGE_KEY)
            : null

        if (persisted && groups.some((g) => g.grp_title === persisted)) {
          setCurrentActiveGroup(persisted)
        } else if (groups.length > 0) {
          const first = groups[0].grp_title
          setCurrentActiveGroup(first)
          if (typeof globalThis.window !== "undefined") {
            globalThis.localStorage.setItem(STORAGE_KEY, first)
          }
        }
      } catch (err: any) {
        console.error("Error fetching user groups:", err)
        setError(err.message || "Failed to load groups")

        // Fallback: try persisted value
        const persisted =
          typeof globalThis.window !== "undefined"
            ? globalThis.localStorage.getItem(STORAGE_KEY)
            : null
        if (persisted) {
          setCurrentActiveGroup(persisted)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [])

  const value = useMemo(
    () => ({ activeGroup, availableGroups, setActiveGroup, loading, error }),
    [activeGroup, availableGroups, setActiveGroup, loading, error]
  )

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  )
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useGroup() {
  const context = useContext(GroupContext)
  if (!context) {
    throw new Error("useGroup must be used within a GroupProvider")
  }
  return context
}
