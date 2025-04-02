"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { groupsApi } from "@/core/apis/organizations"
import { ResourceAssignmentPage } from "@/components/Organization/resource-assignment-page"

export default function AssignResourcesPage() {
  const params = useParams()
  const organizationId = params.id as string

  // Fetch organization details
  const { data: organizationData, isLoading } = useQuery({
    queryKey: ["groupDetails", organizationId],
    queryFn: async () => {
      const response = await groupsApi.getGroupDetailsApi(organizationId)
      return response
    },
    enabled: !!organizationId,
  })

  const organizationName = organizationData?.group?.grp_title || "Organization"

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <span className="ml-3">Loading organization details...</span>
      </div>
    )
  }

  return <ResourceAssignmentPage organizationId={organizationId} organizationName={organizationName} />
}

