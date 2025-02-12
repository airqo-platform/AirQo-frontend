"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useAppSelector } from "@/core/redux/hooks"
import { groups } from "@/core/apis/organizations"
import { useGroupsDetails } from "@/core/hooks/useGroups"

type OrganizationProfileProps = {
  organizationId: string
}

export function OrganizationProfile({ organizationId }: OrganizationProfileProps) {
//   const dispatch = useAppDispatch()
  const { group, isLoading, error } = useGroupsDetails(organizationId)
  const status = isLoading ? "loading" : error ? "failed" : "success"
  const organization = group;
  const [grp_title, setName] = useState(organization?.grp_title || "")
  const [grp_description, setDescription] = useState(organization?.grp_description || "")

  useEffect(() => {
    if (organization) {
      setName(organization.grp_title)
      setDescription(organization.grp_description)
    }
  }, [organization])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
        await groups.updateGroupDetailsApi(organizationId, {
          ...organization,
          grp_title, 
          grp_description 
        })
    } catch (error) {
      console.error("Failed to update organization profile", error)
        
    }
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "failed") {
    return <div>Error loading roles. Please try again.</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Organization Name</Label>
        <Input id="name" value={grp_title} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" value={grp_description} onChange={(e) => setDescription(e.target.value)} rows={4} />
      </div>
      <Button type="submit">Update Profile</Button>
    </form>
  )
}

