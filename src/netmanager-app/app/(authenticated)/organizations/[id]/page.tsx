"use client"

import type React from "react"

import { useParams } from "next/navigation"
import { useGroupsDetails } from "@/core/hooks/useGroups"
import { Loader2, ArrowLeftIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { OrganizationSetupCard } from "@/components/Organization/organization-setup-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { RouteGuard } from "@/components/route-guard"
import { OrganizationProfile } from "@/components/Organization/organization-profile"
import { TeamMembers } from "@/components/Organization/team-members"
import { OrganizationRoles } from "@/components/Organization/organization-roles"

const LoadingFallback = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-64 w-full" />
  </div>
)

const TabContent = ({
  value,
  children,
}: {
  value: string
  children: React.ReactNode
}) => (
  <TabsContent value={value}>
    <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
  </TabsContent>
)

export default function OrganizationDetailsPage() {
  const params = useParams()
  const organizationId = params.id as string
  const router = useRouter()

  const { group, isLoading: isLoadingGroup, error } = useGroupsDetails(organizationId)

  if (isLoadingGroup) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <RouteGuard permission="CREATE_UPDATE_AND_DELETE_NETWORK_USERS">
      <div className="container mx-auto">
        {/* Back button */}
        <Button
          variant="ghost"
          className="flex items-center space-x-2 mb-6"
          onClick={() => router.push("/organizations")}
        >
          <ArrowLeftIcon className="h-4 w-4" />
          <span>Back to Organizations</span>
        </Button>

        {/* Setup Status Card - uses our hook internally to determine setup status */}
        <OrganizationSetupCard organizationId={organizationId} organizationName={group.grp_title || "Organization"} />

        <Tabs defaultValue="profile">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="profile">Organization Profile</TabsTrigger>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="roles">Organization Roles</TabsTrigger>
          </TabsList>
          <TabContent value="profile">
            <OrganizationProfile organizationId={organizationId} />
          </TabContent>
          <TabContent value="members">
            <TeamMembers organizationId={organizationId} />
          </TabContent>
          <TabContent value="roles">
            <OrganizationRoles organizationId={organizationId} />
          </TabContent>
        </Tabs>
      </div>
    </RouteGuard>
  )
}

