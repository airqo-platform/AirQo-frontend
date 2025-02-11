// import { redirect } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrganizationProfile } from "@/components/Organization/organization-profile"
import { TeamMembers } from "@/components/Organization/team-members"
import { OrganizationRoles } from "@/components/Organization/organization-roles"
// import { useAppSelector } from "@/core/redux/hooks"

export const  OrganizationDetailsPage = ({ params }: { params: { id: string } }) => {
  // const user = useAppSelector((state) => state.user.userDetails)

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

