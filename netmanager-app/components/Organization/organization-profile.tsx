"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { groups } from "@/core/apis/organizations"
import { useGroupsDetails } from "@/core/hooks/useGroups"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { UserIcon, UsersIcon } from "lucide-react"
import type React from "react" // Added import for React

type OrganizationProfileProps = {
  organizationId: string
}

export function OrganizationProfile({ organizationId }: OrganizationProfileProps) {
  const { group, isLoading, error } = useGroupsDetails(organizationId)
  const [formData, setFormData] = useState({
    grp_title: "",
    grp_description: "",
    grp_website: "",
    grp_status: "INACTIVE",
  })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (group) {
      setFormData({
        grp_title: group.grp_title || "",
        grp_description: group.grp_description || "",
        grp_website: group.grp_website || "",
        grp_status: group.grp_status || "INACTIVE",
      })
    }
  }, [group])


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, grp_status: checked ? "ACTIVE" : "INACTIVE" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      await groups.updateGroupDetailsApi(organizationId, formData)
      toast({
        title: "Profile Updated",
        description: "The organization profile has been successfully updated.",
      })
    } catch (error) {
      console.error("Failed to update organization profile", error)
      toast({
        title: "Update Failed",
        description: "There was an error updating the organization profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return <Skeleton className="w-full h-[600px]" />
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading organization details. Please try again.</div>
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Organization Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={group?.grp_profile_picture} alt={formData.grp_title} />
              <AvatarFallback>{formData.grp_title.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{formData.grp_title}</h2>
              <Badge variant={formData.grp_status === "ACTIVE" ? "default" : "secondary"}>{formData.grp_status}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="grp_title">Organization Name</Label>
            <Input id="grp_title" name="grp_title" value={formData.grp_title} onChange={handleInputChange} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grp_description">Description</Label>
            <Textarea
              id="grp_description"
              name="grp_description"
              value={formData.grp_description}
              onChange={handleInputChange}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="grp_website">Website</Label>
            <Input
              id="grp_website"
              name="grp_website"
              value={formData.grp_website}
              onChange={handleInputChange}
              type="url"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="grp_status" checked={formData.grp_status === "ACTIVE"} onCheckedChange={handleStatusChange} />
            <Label htmlFor="grp_status">Active Status</Label>
          </div>

          {group?.grp_manager && (
            <div className="flex items-center space-x-2">
              <UserIcon className="w-5 h-5 text-muted-foreground" />
              <span>Manager: {`${group.grp_manager.firstName} ${group.grp_manager.lastName}`}</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <UsersIcon className="w-5 h-5 text-muted-foreground" />
            <span>Number of Users: {group?.numberOfGroupUsers || 0}</span>
          </div>

          <Button type="submit" className="w-full" disabled={isUpdating}>
            {isUpdating ? "Updating..." : "Update Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

