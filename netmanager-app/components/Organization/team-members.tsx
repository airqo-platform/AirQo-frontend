"use client"

import { useState } from "react"
// import { useAppDispatch } from "@/core/redux/hooks"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRoles } from "@/core/hooks/useRoles"
import type { GroupMember } from "@/app/types/groups"
import { Skeleton } from "@/components/ui/skeleton"
import { groupMembers } from "@/core/apis/organizations"
import { toast } from "@/components/ui/use-toast"
import { useTeamMembers } from "@/core/hooks/useGroups"
// import { updateMemberRole } from "@/core/redux/slices/groups" // Import the missing action

type TeamMembersProps = {
  organizationId: string
}

export function TeamMembers({ organizationId }: TeamMembersProps) {
  // const dispatch = useAppDispatch()
  const { team, isLoading, error } = useTeamMembers(organizationId)
  const { roles, isLoading: rolesLoading, error: rolesError } = useRoles()
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newRoleId, setNewRoleId] = useState<string>("")

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

  const handleUpdateRole = async () => {
    if (!selectedMember || !newRoleId) return

    try {
      // await dispatch(updateMemberRole({ organizationId, memberId: selectedMember._id, roleId: newRoleId })).unwrap()
      toast({
        title: "Role updated",
        description: "The member's role has been successfully updated.",
      })
      setIsDialogOpen(false)
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
                <TableCell>{member.role_name || "No role assigned"}</TableCell>
                <TableCell>
                  <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSelectedMember(member)
                          setNewRoleId(member.role_id || "")
                        }}
                      >
                        Update Role
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          Update Role for {member.firstName} {member.lastName}
                        </DialogTitle>
                      </DialogHeader>
                      <Select value={newRoleId} onValueChange={setNewRoleId}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a new role" />
                        </SelectTrigger>
                        <SelectContent>
                          {rolesLoading ? (
                            <SelectItem value="loading" disabled>
                              Loading roles...
                            </SelectItem>
                          ) : rolesError ? (
                            <SelectItem value="error" disabled>
                              Error loading roles
                            </SelectItem>
                          ) : (
                            roles.map((role) => (
                              <SelectItem key={role._id} value={role._id}>
                                {role.role_name}
                              </SelectItem>
                            ))
                          )}
                        </SelectContent>
                      </Select>
                      <Button onClick={handleUpdateRole}>Update Role</Button>
                    </DialogContent>
                  </Dialog>
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

