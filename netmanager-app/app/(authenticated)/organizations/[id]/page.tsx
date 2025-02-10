import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/session"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrganizationProfile } from "./organization-profile"
import { TeamMembers } from "./team-members"
import { OrganizationRoles } from "./organization-roles"

export default async function OrganizationDetailsPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser()

  if (!user || user.role !== "AIRQO_SUPER_ADMIN") {
    redirect("/")
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Organization Details</h1>
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Organization Profile</TabsTrigger>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="roles">Organization Roles</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <OrganizationProfile organizationId={params.id} />
        </TabsContent>
        <TabsContent value="members">
          <TeamMembers organizationId={params.id} />
        </TabsContent>
        <TabsContent value="roles">
          <OrganizationRoles organizationId={params.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

