"use client"

import { useQuery } from "@tanstack/react-query"
import { useSession } from "next-auth/react"
import { normalizeDiscoveredOrganisations } from "@/lib/organisations"

/**
 * Every active organisation the person could ask to join, the same list Nexus shows. Not having it
 * only shortens the switcher, so a failure is left to the caller rather than retried, and this
 * doesn't go through the handler that signs people out on a 401.
 */
export function useDiscoverOrganisations(enabled: boolean) {
  const { data: session } = useSession()
  const token = session?.accessToken

  return useQuery({
    queryKey: ["organisations", "discover", session?.user?._id],
    enabled: enabled && Boolean(token),
    staleTime: 5 * 60 * 1000,
    retry: false,
    queryFn: async () => {
      const rawToken = (token as string).replace(/^(JWT|Bearer)\s+/i, "")
      const response = await fetch("/api/proxy/v2/users/groups/discover", {
        headers: { Authorization: `JWT ${rawToken}` },
      })
      if (!response.ok) throw new Error(`Failed to load organisations (${response.status})`)
      return normalizeDiscoveredOrganisations(await response.json())
    },
  })
}
