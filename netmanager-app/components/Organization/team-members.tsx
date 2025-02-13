"use client"

import { useState } from "react"
import { useAppDispatch } from "@/core/redux/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRoles } from "@/core/hooks/useRoles"
import { GroupMember } from "@/app/types/groups"
import { Skeleton } from "@/components/ui/skeleton"
import { groupMembers } from "@/core/apis/organizations"
import { toast } from "@/components/ui/use-toast"
import { useTeamMembers } from "@/core/hooks/useGroups"

type TeamMembersProps = {
  organizationId: string
}

export function TeamMembers({ organizationId }: TeamMembersProps) {
  const dispatch = useAppDispatch()
  const { team, isLoading, error } = useTeamMembers(organizationId)
  const { roles, isLoading: rolesLoading, error: rolesError } = useRoles()
  const [newMemberEmail, setNewMemberEmail] = useState("")


  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await groupMembers.inviteUserToGroupTeam(organizationId, newMemberEmail)
      toast({
        title: "Invitation sent",
        description: `An invitation has been sent to ${newMemberEmail}`,
      })
      setNewMemberEmail("")
    } catch (error) {
      console.error("Error inviting member:", error)
      toast({
        title: "Error",
        description: "Failed to invite member. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleUpdateRole = async (memberId: string, roleId: string) => {
    try {
      await dispatch(updateMemberRole({ organizationId, memberId, roleId })).unwrap()
      toast({
        title: "Role updated",
        description: "The member's role has been successfully updated.",
      })
    } catch (error) {
      console.error("Error updating role:", error)
      toast({
        title: "Error",
        description: "Failed to update role. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <Skeleton className="w-full h-64" />
  }

  if (error) {
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
          {team.length > 0 ? (
            team.map((member: GroupMember) => (
              <TableRow key={member._id}>
                <TableCell>{`${member.firstName} ${member.lastName}`}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>
                  <Select
                    value={member.role_id}
                    onValueChange={(newRoleId) => handleUpdateRole(member._id, newRoleId)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={member.role_name} />
                    </SelectTrigger>
                    <SelectContent>
                      {rolesLoading ? (
                        <SelectItem value="" disabled>
                          Loading roles...
                        </SelectItem>
                      ) : rolesError ? (
                        <SelectItem value="" disabled>
                          Error loading roles
                        </SelectItem>
                      ) : (
                        roles
                          .filter((role) => role._id !== member.role_id)
                          .map((role) => (
                            <SelectItem key={role._id} value={role._id}>
                              {role.role_name}
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
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                No team members found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

