"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAppDispatch } from "@/core/redux/hooks"
import { roles } from "@/core/apis/roles"
import { useOrgRole } from "@/core/hooks/useRoles"



type OrganizationRolesProps = {
  organizationId: string
}

export function OrganizationRoles({ organizationId }: OrganizationRolesProps) {
  const dispatch = useAppDispatch()
  const {grproles, isLoading, error} = useOrgRole(organizationId)
  const [newRoleName, setNewRoleName] = useState("")
  const status = isLoading ? "loading" : error ? "failed" : "success"


  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();

    const data = {
      role_name: newRoleName,
      network_id: selectedNetworkId,
      group_id: organizationId,
    };

    try {
      const newRole = await roles.createRoleApi(data);
      console.log("Role created successfully:", newRole);
    } catch (error) {
      console.error("Error creating role:", error);
    }

    setNewRoleName("");
};


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
          {grproles.map((role) => (
            <TableRow key={role._id}>
              <TableCell>{role.role_name}</TableCell>
              <TableCell>{role.permissions.join(", ")}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  onClick={() => {
                    const newName = prompt("Enter new role name:", role.name)
                    if (newName) handleUpdateRole(role._id, newName)
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

