"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type TeamMembersProps = {
  organizationId: string
}

export function TeamMembers({ organizationId }: TeamMembersProps) {
  const dispatch = useDispatch<AppDispatch>()
  const members = useSelector((state: RootState) => state.members.list)
  const status = useSelector((state: RootState) => state.members.status)
  const [newMemberEmail, setNewMemberEmail] = useState("")

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchMembers(organizationId))
    }
  }, [status, dispatch, organizationId])

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(inviteMember({ organizationId, email: newMemberEmail }))
    setNewMemberEmail("")
  }

  const handleUpdateRole = (memberId: string, newRole: string) => {
    dispatch(updateMemberRole({ memberId, role: newRole }))
  }

  if (status === "loading") {
    return <div>Loading...</div>
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
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.name}</TableCell>
              <TableCell>{member.email}</TableCell>
              <TableCell>
                <Select value={member.role} onValueChange={(value) => handleUpdateRole(member.id, value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Member">Member</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  onClick={() => handleUpdateRole(member.id, "Manager")}
                  disabled={member.role === "Manager"}
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

