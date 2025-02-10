"use client"

import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AppDispatch, RootState } from "@/lib/store"
import { fetchRoles, createRole, updateRole } from "@/lib/slices/rolesSlice"

type OrganizationRolesProps = {
  organizationId: string
}

export function OrganizationRoles({ organizationId }: OrganizationRolesProps) {
  const dispatch = useDispatch<AppDispatch>()
  const roles = useSelector((state: RootState) => state.roles.list)
  const status = useSelector((state: RootState) => state.roles.status)
  const [newRoleName, setNewRoleName] = useState("")

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchRoles(organizationId))
    }
  }, [status, dispatch, organizationId])

  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault()
    dispatch(createRole({ organizationId, name: newRoleName }))
    setNewRoleName("")
  }

  const handleUpdateRole = (roleId: string, newName: string) => {
    dispatch(updateRole({ id: roleId, name: newName }))
  }

  if (status === "loading") {
    return <div>Loading...</div>
  }

  if (status === "failed") {
    return <div>Error loading roles. Please try again.</div>
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreateRole} className="space-y-4">
        <div>
          <Label htmlFor="newRole">New Role Name</Label>
          <Input id="newRole" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} required />
        </div>
        <Button type="submit">Create New Role</Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role Name</TableHead>
            <TableHead>Permissions</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>{role.name}</TableCell>
              <TableCell>{role.permissions.join(", ")}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  onClick={() => {
                    const newName = prompt("Enter new role name:", role.name)
                    if (newName) handleUpdateRole(role.id, newName)
                  }}
                >
                  Edit
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

