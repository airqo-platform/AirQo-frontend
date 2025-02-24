"use client";

import type React from "react";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OrganizationProfile } from "@/components/Organization/organization-profile";
import { TeamMembers } from "@/components/Organization/team-members";
import { OrganizationRoles } from "@/components/Organization/organization-roles";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { RouteGuard } from "@/components/route-guard";

const LoadingFallback = () => (
  <div className="space-y-4">
    <Skeleton className="h-8 w-3/4" />
    <Skeleton className="h-64 w-full" />
  </div>
);

const TabContent = ({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) => (
  <TabsContent value={value}>
    <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
  </TabsContent>
);

const OrganizationDetailsPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();

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
        {/* Organization Details */}
        <h1 className="text-3xl font-bold mb-6">Organization Details</h1>
        <Tabs defaultValue="profile">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="profile">Organization Profile</TabsTrigger>
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="roles">Organization Roles</TabsTrigger>
          </TabsList>
          <TabContent value="profile">
            <OrganizationProfile organizationId={params.id} />
          </TabContent>
          <TabContent value="members">
            <TeamMembers organizationId={params.id} />
          </TabContent>
          <TabContent value="roles">
            <OrganizationRoles organizationId={params.id} />
          </TabContent>
        </Tabs>
      </div>
    </RouteGuard>
  );
};

export default OrganizationDetailsPage;
