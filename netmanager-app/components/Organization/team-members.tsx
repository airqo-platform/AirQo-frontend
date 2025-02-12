"use client"

import { useState } from "react"
import { useAppDispatch } from "@/core/redux/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useTeamMembers } from "@/core/hooks/useGroups"
import { groupMembers } from "@/core/apis/organizations"
import { useRoles } from "@/core/hooks/useRoles"

type TeamMembersProps = {
  organizationId: string
}

export function TeamMembers({ organizationId }: TeamMembersProps) {
  const dispatch = useAppDispatch()
  const { team, isLoading, error } = useTeamMembers(organizationId)
  const { roles, isLoading: rolesLoading, error: rolesError } = useRoles()
  const [newMemberEmail, setNewMemberEmail] = useState("")

  const status = isLoading ? "loading" : error ? "failed" : "success"
  const rolesStatus = rolesLoading ? "loading" : rolesError ? "failed" : "success"

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newRole = await groupMembers.inviteUserToGroupTeam(organizationId, newMemberEmail)
      return newRole
    } catch (error) {
      console.error("Error inviting member:", error)
    } finally {
      setNewMemberEmail("")
    }
  }

  const handleUpdateRole = (memberId: string, newRole: string) => {
    dispatch(updateMemberRole({ memberId, role: newRole }))
  }

  if (status === "loading") {
    return <div>Loading members...</div>
  }

  if (status === "failed") {
    return <div>Error loading members. Please try again.</div>
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleInvite} className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter email to invite"
          value={newMemberEmail}
          onChange={(e) => setNewMemberEmail(e.target.value)}
          required
        />
        <Button type="submit">Invite Member</Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {team.map((member) => (
            <TableRow key={member._id}>
              <TableCell>{`${member.firstName} ${member.lastName}`}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                <Select value={member.role_name} onValueChange={(value) => handleUpdateRole(member._id, value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesStatus === "loading" ? (
                      <SelectItem value="" disabled>Loading roles...</SelectItem>
                    ) : rolesStatus === "failed" ? (
                      <SelectItem value="" disabled>Error loading roles</SelectItem>
                    ) : (
                      roles.map((role) => (
                        <SelectItem key={role._id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateRole(member._id, "Manager")}
                  disabled={member.role_name === "Manager"}
                >
                  Assign as Manager
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
