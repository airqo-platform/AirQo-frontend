import { Clock, AlertCircle, Globe, Laptop, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface OrganizationSetupCardProps {
  organizationId: string
  organizationName: string
  setupStatus: {
    sitesAssigned: boolean
    devicesAssigned: boolean
    membersInvited: boolean
  }
}

export function OrganizationSetupCard({ organizationId, organizationName, setupStatus }: OrganizationSetupCardProps) {
  const { sitesAssigned, devicesAssigned, membersInvited } = setupStatus

  const isSetupComplete = sitesAssigned && devicesAssigned && membersInvited

  if (isSetupComplete) {
    return null // Don't show the card if setup is complete
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
          {!sitesAssigned && (
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

          {!devicesAssigned && (
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

          {!membersInvited && (
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

