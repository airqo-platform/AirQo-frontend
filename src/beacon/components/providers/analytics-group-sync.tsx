"use client"

import { useEffect } from "react"
import { useGroup } from "@/lib/group-context"
import { setActiveOrganization } from "@/lib/analytics"

/** Keeps PostHog's `organization` group in step with the active group. Renders nothing. */
export function AnalyticsGroupSync() {
  const { activeGroupData } = useGroup()
  const id = activeGroupData?._id
  const title = activeGroupData?.grp_title
  const slug = activeGroupData?.organization_slug

  useEffect(() => {
    setActiveOrganization(id ? { id, title, slug } : null)
  }, [id, title, slug])

  return null
}
