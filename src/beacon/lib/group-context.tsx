"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from "react"
import { useSession } from "next-auth/react"
import { themeService } from "@/services/theme-service"

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

/** The group named by a `?group=` link, e.g. from Vertex's Open in Beacon. */
export function getGroupLink(search: string): string | null {
  return new URLSearchParams(search).get("group")?.trim() || null;
}

/** The user's own title for a linked group, or null if they don't belong to it. Vertex's admin pages always link `airqo`. */
export function findGroupTitle(groups: UserGroup[], title: string | null): string | null {
  if (!title) return null;

  const wanted = title.toLowerCase();
  return groups.find((g) => g.grp_title?.toLowerCase() === wanted)?.grp_title ?? null;
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
  /** A `?group=` link couldn't be confirmed, so `loading` stays true until it's retried or dropped */
  groupLinkFailed: boolean
  /** Ask for the profile again to confirm the link */
  retryGroupLink: () => void
  /** Carry on without the link, as if it had never been opened */
  dropGroupLink: () => void
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
  groupLinkFailed: false,
  retryGroupLink: () => {},
  dropGroupLink: () => {},
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
  // A `?group=` link applies once per load, so a token refresh can't undo a later manual switch
  const groupLinkPending = useRef(true)
  const [groupLinkFailed, setGroupLinkFailed] = useState(false)
  const [fetchAttempt, setFetchAttempt] = useState(0)

  // Persist group selection
  const setActiveGroup = useCallback((grpTitle: string) => {
    groupLinkPending.current = false
    setCurrentActiveGroup(grpTitle)
    if (typeof globalThis.window !== "undefined") {
      globalThis.localStorage.setItem(STORAGE_KEY, grpTitle)
    }
  }, [])

  const retryGroupLink = useCallback(() => {
    setFetchAttempt((attempt) => attempt + 1)
  }, [])

  const dropGroupLink = useCallback(() => {
    groupLinkPending.current = false
    setFetchAttempt((attempt) => attempt + 1)
  }, [])

  // On mount/session change: fetch user profile → extract groups → pick active group
  useEffect(() => {
    if (status === "loading") return
    
    if (status === "unauthenticated") {
      setLoading(false)
      return
    }

    // Set when a newer request takes over, so a slower older profile can't undo its result or a manual switch
    let superseded = false

    const fetchGroups = async () => {
      const groupLink = groupLinkPending.current ? getGroupLink(globalThis.location.search) : null
      // Until the profile settles a link the cache couldn't, the page stays held back:
      // any fallback would show the wrong organisation, and having none would leave the page
      const isLinkUnconfirmed = () => Boolean(groupLink) && groupLinkPending.current

      setError(null)
      setGroupLinkFailed(false)

      // 1. Try to load from cache first (Stale-While-Revalidate pattern)
      if (typeof globalThis.window !== "undefined") {
        try {
          const cachedGroupsStr = globalThis.localStorage.getItem("beacon_available_groups")
          if (cachedGroupsStr) {
            const cachedGroups = JSON.parse(cachedGroupsStr)
            if (Array.isArray(cachedGroups) && cachedGroups.length > 0) {
              setAvailableGroups(cachedGroups)

              const linkedGroup = findGroupTitle(cachedGroups, groupLink)
              if (linkedGroup) setActiveGroup(linkedGroup)

              // A link the cache can't confirm waits for the profile: starting under the
              // persisted group would fetch for the wrong one, and the route guard could leave the page
              if (linkedGroup || !groupLink) {
                const persisted = globalThis.localStorage.getItem(STORAGE_KEY)
                if (persisted && cachedGroups.some((g: any) => g.grp_title === persisted)) {
                  setCurrentActiveGroup(persisted)
                }
                // Immediately show UI since we have cached data
                setLoading(false)
              }
            }
          }
        } catch (e) {
          // Ignore parse errors for cache
        }
      }

      try {
        const token = session?.accessToken
        if (!token) {
          if (isLinkUnconfirmed()) setGroupLinkFailed(true)
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

        if (superseded) return

        if (!response.ok) {
          throw new Error(`Failed to fetch user profile (${response.status})`)
        }

        const data = await response.json()

        if (superseded) return

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

        // The profile settles a link the cache couldn't: it applies, or it's ignored for good
        if (groupLinkPending.current) {
          const linkedGroup = findGroupTitle(groups, groupLink)
          if (linkedGroup) setActiveGroup(linkedGroup)
          groupLinkPending.current = false
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
        if (superseded) return

        console.error("Error fetching user groups:", err)
        setError(err.message || "Failed to load groups")

        if (isLinkUnconfirmed()) {
          setGroupLinkFailed(true)
          return
        }

        // Fallback: try persisted value
        const persisted =
          typeof globalThis.window !== "undefined"
            ? globalThis.localStorage.getItem(STORAGE_KEY)
            : null
        if (persisted) {
          setCurrentActiveGroup((prevActive) => (prevActive === persisted ? prevActive : persisted))
        }
      } finally {
        if (!superseded && !isLinkUnconfirmed()) setLoading(false)
      }
    }

    fetchGroups()

    return () => {
      superseded = true
    }
  }, [session?.accessToken, status, setActiveGroup, fetchAttempt])

  const activeGroupData = useMemo(() => {
    return availableGroups.find(g => g.grp_title === activeGroup) || null
  }, [activeGroup, availableGroups])

  // Sync group-specific theme on active group change
  useEffect(() => {
    if (activeGroupData?._id) {
      themeService.fetchUserTheme(
        activeGroupData._id,
        (session?.user as any)?.id || (session?.user as any)?._id,
        (session as any)?.accessToken || (session?.user as any)?.accessToken
      ).catch(() => {})
    }
  }, [activeGroupData?._id, session])

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
      groupLinkFailed,
      retryGroupLink,
      dropGroupLink,
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
      groupLinkFailed,
      retryGroupLink,
      dropGroupLink,
      activeGroupData,
      isActiveGroupAdmin,
      activeGroupPermissions,
      hasPermission,
      hasAnyPermission,
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
