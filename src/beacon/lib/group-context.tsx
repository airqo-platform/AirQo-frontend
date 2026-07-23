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

// ─── Constants & Helpers ───────────────────────────────────────────────────

export const ADMIN_PERMISSIONS = [
  'SUPER_ADMIN',
  'SYSTEM_ADMIN',
  'ADMIN_FULL_ACCESS',
  'GROUP_MANAGEMENT',
  'USER_MANAGEMENT',
  'ROLE_CREATE',
  'ROLE_EDIT',
  'ROLE_DELETE',
  'ROLE_ASSIGNMENT',
  'DEVICE_MAINTAIN',
  'DEVICE_RECALL',
  'DEVICE_DELETE',
  'ORG_CREATE',
  'ORG_UPDATE',
  'ORG_DELETE',
  'ORG_APPROVE',
] as const;

export function isGroupAdmin(group: UserGroup | null | undefined): boolean {
  if (!group) return false;

  const permissions = group.role?.role_permissions?.map((p) => p.permission) || [];
  return permissions.some((p) =>
    (ADMIN_PERMISSIONS as readonly string[]).includes(p)
  );
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
  /** Active group role permissions */
  activeGroupPermissions: string[]
  /** Check if active group role has a specific permission */
  hasPermission: (permission: string) => boolean
  /** Check if active group role has any of the specified permissions */
  hasAnyPermission: (permissions: string[]) => boolean
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
  activeGroupPermissions: [],
  hasPermission: () => false,
  hasAnyPermission: () => false,
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
      // 1. Try to load from cache first (Stale-While-Revalidate pattern)
      if (typeof globalThis.window !== "undefined") {
        try {
          const cachedGroupsStr = globalThis.localStorage.getItem("beacon_available_groups")
          if (cachedGroupsStr) {
            const cachedGroups = JSON.parse(cachedGroupsStr)
            if (Array.isArray(cachedGroups) && cachedGroups.length > 0) {
              setAvailableGroups(cachedGroups)
              
              const persisted = globalThis.localStorage.getItem(STORAGE_KEY)
              if (persisted && cachedGroups.some((g: any) => g.grp_title === persisted)) {
                setCurrentActiveGroup(persisted)
              }
              // Immediately show UI since we have cached data
              setLoading(false)
            }
          }
        } catch (e) {
          // Ignore parse errors for cache
        }
      }

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

        // Only update availableGroups if the data actually changed
        setAvailableGroups((prevGroups) => {
          if (JSON.stringify(prevGroups) === JSON.stringify(groups)) {
            return prevGroups
          }
          return groups
        })
        
        if (typeof globalThis.window !== "undefined") {
          globalThis.localStorage.setItem("beacon_available_groups", JSON.stringify(groups))
        }

        // Check if user is an AirQo Admin via role permissions
        const isAirqoAdmin = groups.some(g => {
          if (g.grp_title?.toLowerCase() === 'airqo') {
             return isGroupAdmin(g)
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
             return isGroupAdmin(g)
          }
          return true
        })

        if (nonAirqoOrAdminAirqo) {
           defaultGroup = nonAirqoOrAdminAirqo.grp_title
        }

        setCurrentActiveGroup((prevActive) => {
          if (persisted && groups.some((g) => g.grp_title === persisted)) {
            return prevActive === persisted ? prevActive : persisted
          } else if (defaultGroup) {
            if (typeof globalThis.window !== "undefined") {
              globalThis.localStorage.setItem(STORAGE_KEY, defaultGroup)
            }
            return prevActive === defaultGroup ? prevActive : defaultGroup
          }
          return prevActive
        })
      } catch (err: any) {
        console.error("Error fetching user groups:", err)
        setError(err.message || "Failed to load groups")

        // Fallback: try persisted value
        const persisted =
          typeof globalThis.window !== "undefined"
            ? globalThis.localStorage.getItem(STORAGE_KEY)
            : null
        if (persisted) {
          setCurrentActiveGroup((prevActive) => (prevActive === persisted ? prevActive : persisted))
        }
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [session?.accessToken, status])

  const activeGroupData = useMemo(() => {
    return availableGroups.find(g => g.grp_title === activeGroup) || null
  }, [activeGroup, availableGroups])

  const isActiveGroupAdmin = useMemo(() => {
    return isGroupAdmin(activeGroupData)
  }, [activeGroupData])

  const activeGroupPermissions = useMemo(() => {
    if (!activeGroupData?.role?.role_permissions) return []
    return activeGroupData.role.role_permissions.map((p) => p.permission)
  }, [activeGroupData])

  const hasPermission = useCallback((permission: string): boolean => {
    return activeGroupPermissions.includes(permission)
  }, [activeGroupPermissions])

  const hasAnyPermission = useCallback((permissions: string[]): boolean => {
    return permissions.some((p) => activeGroupPermissions.includes(p))
  }, [activeGroupPermissions])

  const value = useMemo(
    () => ({
      activeGroup,
      availableGroups,
      setActiveGroup,
      loading,
      error,
      activeGroupData,
      isActiveGroupAdmin,
      activeGroupPermissions,
      hasPermission,
      hasAnyPermission,
    }),
    [
      activeGroup,
      availableGroups,
      setActiveGroup,
      loading,
      error,
      activeGroupData,
      isActiveGroupAdmin,
      activeGroupPermissions,
    ]
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
