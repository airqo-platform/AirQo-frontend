"use client"

import { useMemo } from "react"
import { useGroup } from "@/lib/group-context"
import { getNavigationAccess, type NavigationAccess } from "@/lib/navigation"

export function useNavigationAccess(): NavigationAccess & { loading: boolean } {
  const { activeGroup, isActiveGroupAdmin, hasPermission, hasAnyPermission, loading } = useGroup()

  return useMemo(
    () => ({
      ...getNavigationAccess({ activeGroup, isActiveGroupAdmin, hasPermission, hasAnyPermission }),
      loading,
    }),
    [activeGroup, isActiveGroupAdmin, hasPermission, hasAnyPermission, loading]
  )
}
