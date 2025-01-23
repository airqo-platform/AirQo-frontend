"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MyProfile from "./MyProfile"
import PasswordEdit from "./PasswordEdit"
import ApiTokens from "./ApiTokens"

export default function ProfileTabs() {
  const [activeTab, setActiveTab] = useState("profile")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile">My Profile</TabsTrigger>
        <TabsTrigger value="password">Password Edit</TabsTrigger>
        <TabsTrigger value="api">API Access Tokens</TabsTrigger>
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
    </Tabs>
  )
}

