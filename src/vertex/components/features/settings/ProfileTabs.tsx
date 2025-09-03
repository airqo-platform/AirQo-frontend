"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MyProfile from "./MyProfile"
import PasswordEdit from "./PasswordEdit"
import ApiTokens from "./ApiTokens"
import ClientManagement from "./Clients"
import { usePermissions } from "@/core/hooks/usePermissions"
import { PERMISSIONS } from "@/core/permissions/constants"

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState("profile")
  const permissions: Record<string, boolean> = usePermissions([PERMISSIONS.USER.MANAGEMENT])
  const canManageClients = permissions[PERMISSIONS.USER.MANAGEMENT]

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className={`grid w-full ${canManageClients ? "grid-cols-4" : "grid-cols-3"}`}>
        <TabsTrigger value="profile">My Profile</TabsTrigger>
        <TabsTrigger value="password">Reset Password</TabsTrigger>
        <TabsTrigger value="api">API Access Tokens</TabsTrigger>
        {canManageClients && <TabsTrigger value="clients">Clients</TabsTrigger>}
      </TabsList>
      <TabsContent value="profile">
        <MyProfile />
      </TabsContent>
      <TabsContent value="password">
        <PasswordEdit />
      </TabsContent>
      <TabsContent value="api">
        <ApiTokens />
      </TabsContent>
      {canManageClients && (
        <TabsContent value="clients">
          <ClientManagement />
        </TabsContent>
      )}
    </Tabs>
  )
}
