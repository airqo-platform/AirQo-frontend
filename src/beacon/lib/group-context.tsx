"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { useSession } from "next-auth/react"

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
  /** Active group details */
  activeGroupData: UserGroup | null
  /** Whether the user is an admin of the active group */
  isActiveGroupAdmin: boolean
}

const STORAGE_KEY = "beacon_active_group"

const GroupContext = createContext<GroupContextValue>({
  activeGroup: null,
  availableGroups: [],
  setActiveGroup: () => {},
  loading: true,
  error: null,
  activeGroupData: null,
  isActiveGroupAdmin: false,
})

// ─── Provider ────────────────────────────────────────────────────────────────

export function GroupProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const { data: session, status } = useSession()
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

  // On mount/session change: fetch user profile → extract groups → pick active group
  useEffect(() => {
    if (status === "loading") return
    
    if (status === "unauthenticated") {
      setLoading(false)
      return
    }

    const fetchGroups = async () => {
      try {
        const token = session?.accessToken
        if (!token) {
          setLoading(false)
          return
        }

        const rawToken = token.replace(/^(JWT|Bearer)\s+/i, '')
        const response = await fetch("/api/auth/user", {
          method: "GET",
          headers: {
            Authorization: `JWT ${rawToken}`,
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

        // Check if user is an AirQo Admin
        const isAirqoAdmin = groups.some(g => {
          if (g.grp_title?.toLowerCase() === 'airqo') {
             const roleName = g.role?.role_name?.toLowerCase() || ''
             return roleName.includes('admin') || roleName === 'super' || roleName === 'net admin'
          }
          return false
        })

        // Set isAirqoAdmin cookie and localStorage
        if (typeof globalThis.window !== "undefined") {
          const maxAge = 7 * 24 * 60 * 60 // 7 days
          globalThis.document.cookie = `isAirqoAdmin=${isAirqoAdmin}; path=/; max-age=${maxAge}; SameSite=Strict`
          globalThis.localStorage.setItem('isAirqoAdmin', String(isAirqoAdmin))
        }

        // Pick active group: persisted selection → first group returned by profile
        const persisted =
          typeof globalThis.window !== "undefined"
            ? globalThis.localStorage.getItem(STORAGE_KEY)
            : null

        // Default logic: Skip AirQo if not admin
        let defaultGroup = groups[0]?.grp_title
        const nonAirqoOrAdminAirqo = groups.find(g => {
          if (g.grp_title.toLowerCase() === 'airqo') {
             const roleName = g.role?.role_name?.toLowerCase() || ''
             return roleName.includes('admin') || roleName === 'super' || roleName === 'net admin'
          }
          return true
        })

        if (nonAirqoOrAdminAirqo) {
           defaultGroup = nonAirqoOrAdminAirqo.grp_title
        }

        if (persisted && groups.some((g) => g.grp_title === persisted)) {
          setCurrentActiveGroup(persisted)
        } else if (defaultGroup) {
          setCurrentActiveGroup(defaultGroup)
          if (typeof globalThis.window !== "undefined") {
            globalThis.localStorage.setItem(STORAGE_KEY, defaultGroup)
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
  }, [session, status])

  const activeGroupData = useMemo(() => {
    return availableGroups.find(g => g.grp_title === activeGroup) || null
  }, [activeGroup, availableGroups])

  const isActiveGroupAdmin = useMemo(() => {
    if (!activeGroupData?.role?.role_name) return false
    const role = activeGroupData.role.role_name.toLowerCase()
    return role.includes('admin') || role === 'super' || role === 'net admin'
  }, [activeGroupData])

  const value = useMemo(
    () => ({ activeGroup, availableGroups, setActiveGroup, loading, error, activeGroupData, isActiveGroupAdmin }),
    [activeGroup, availableGroups, setActiveGroup, loading, error, activeGroupData, isActiveGroupAdmin]
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
