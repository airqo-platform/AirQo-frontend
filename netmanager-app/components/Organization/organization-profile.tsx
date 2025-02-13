"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { groups } from "@/core/apis/organizations"
import { useGroupsDetails } from "@/core/hooks/useGroups"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

type OrganizationProfileProps = {
  organizationId: string
}

export function OrganizationProfile({ organizationId }: OrganizationProfileProps) {
  const { group, isLoading, error } = useGroupsDetails(organizationId)
  const [grpTitle, setGrpTitle] = useState("")
  const [grpDescription, setGrpDescription] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (group) {
      setGrpTitle(group.grp_title || "")
      setGrpDescription(group.grp_description || "")
    }
  }, [group])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      await groups.updateGroupDetailsApi(organizationId, {
        grp_title: grpTitle,
        grp_description: grpDescription,
      })
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
    return <Skeleton className="w-full h-64" />
  }

  if (error) {
    return <div>Error loading organization details. Please try again.</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Organization Name</Label>
        <Input id="name" value={grpTitle} onChange={(e) => setGrpTitle(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={grpDescription}
          onChange={(e) => setGrpDescription(e.target.value)}
          rows={4}
        />
      </div>
      <Button type="submit" disabled={isUpdating}>
        {isUpdating ? "Updating..." : "Update Profile"}
      </Button>
    </form>
  )
}

