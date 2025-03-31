"use client"

import { Clock, AlertCircle, Globe, Laptop, Users, Loader2, CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useGroupResources } from "@/core/hooks/useGroupResources"

interface OrganizationSetupCardProps {
  organizationId: string
  organizationName: string
}

export function OrganizationSetupCard({ organizationId, organizationName }: OrganizationSetupCardProps) {
  // Use our hook to determine if the organization has sites, devices, and members assigned
  const { hasSites, hasDevices, hasMembers, isLoading, sites, devices } = useGroupResources(organizationId)

  // If we're still loading the resource data, show a loading indicator
  if (isLoading) {
    return (
      <Card className="border-l-4 border-l-amber-500 mb-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span>Checking organization setup status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If all setup tasks are complete, show a completion card
  const isSetupComplete = hasSites && hasDevices && hasMembers
  if (isSetupComplete) {
    return (
      <Card className="border-l-4 border-l-green-500 mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            Organization Setup Complete
          </CardTitle>
          <CardDescription>All resources have been assigned to {organizationName}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Sites assigned</span>
              </div>
              <span className="text-sm text-muted-foreground">{sites.length} sites</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Devices assigned</span>
              </div>
              <span className="text-sm text-muted-foreground">{devices.length} devices</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                <span>Team members added</span>
              </div>
              <span className="text-sm text-muted-foreground">Active</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-l-4 border-l-amber-500 mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
          Organization Setup Pending
        </CardTitle>
        <CardDescription>Complete the following steps to finish setting up {organizationName}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!hasSites && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <span>Assign Sites</span>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`/organizations/${organizationId}/sites`}>
                  <Globe className="mr-2 h-4 w-4" /> Assign Sites
                </Link>
              </Button>
            </div>
          )}

          {!hasDevices && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <span>Assign Devices</span>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`/organizations/${organizationId}/devices`}>
                  <Laptop className="mr-2 h-4 w-4" /> Assign Devices
                </Link>
              </Button>
            </div>
          )}

          {!hasMembers && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-500" />
                <span>Invite Team Members</span>
              </div>
              <Button asChild size="sm" variant="outline">
                <Link href={`/organizations/${organizationId}/members`}>
                  <Users className="mr-2 h-4 w-4" /> Invite Members
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

