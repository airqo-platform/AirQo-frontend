"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAppSelector } from "@/core/redux/hooks"
import { useGroupRoles } from "@/core/hooks/useRoles"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Search, ArrowUpDown, Plus, Shield } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { toast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Permission, Role } from "@/app/types/roles"
import { roles } from "@/core/apis/roles"

type OrganizationRolesProps = {
  organizationId: string
}

const ITEMS_PER_PAGE = 10

type SortField = "role_name" | "permissions"
type SortOrder = "asc" | "desc"

// This would typically come from your API or be defined elsewhere
const ALL_PERMISSIONS = [
  "view:users",
  "create:users",
  "edit:users",
  "delete:users",
  "view:roles",
  "create:roles",
  "edit:roles",
  "delete:roles",
  "view:content",
  "create:content",
  "edit:content",
  "delete:content",
  "admin:access",
  "reports:view",
  "billing:manage",
]

export function OrganizationRoles({ organizationId }: OrganizationRolesProps) {

  // Removed unused editRoleId state
  const { grproles, isLoading, error } = useGroupRoles(organizationId)
  const [newRoleName, setNewRoleName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("role_name")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  // Removed unused editRoleId state
  const [editRoleName, setEditRoleName] = useState("")
  const [permissionsSearch, setPermissionsSearch] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const network = useAppSelector((state) => state.user.activeNetwork)

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!network) {
      console.error("Network is null")
      return
    }

    const data = {
      role_name: newRoleName,
      network_id: network._id,
      group_id: organizationId,
    }

    try {
      await roles.createRoleApi(data)
      toast({
        title: "Role created",
        description: `The role "${newRoleName}" has been successfully created.`,
      })
      setNewRoleName("")
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error("Error creating role:", error)
      toast({
        title: "Error",
        description: "Failed to create role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const openPermissionsDialog = (role: Role) => {
    // Removed unused editRoleId state
    setEditRoleName(role.role_name)
    // Initialize selected permissions from the role
    setSelectedPermissions(role.role_permissions.map((perm: Permission) => perm.permission))
    setIsPermissionsDialogOpen(true)
  }

  const handleUpdatePermissions = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Convert selected permissions to the format expected by your API
      // const permissionsData = selectedPermissions.map((permission) => ({ permission }))

      // await roles.updateRolePermissionsApi(editRoleId, { role_permissions: permissionsData })
      // This is a placeholder for the actual API call

      toast({
        title: "Permissions updated",
        description: `Permissions for "${editRoleName}" have been successfully updated.`,
      })
      setIsPermissionsDialogOpen(false)
    } catch (error) {
      console.error("Error updating permissions:", error)
      toast({
        title: "Error",
        description: "Failed to update permissions. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const sortedAndFilteredRoles = useMemo(() => {
    return grproles
      .filter((role: Role) => {
        const searchLower = searchQuery.toLowerCase()
        return (
          role.role_name.toLowerCase().includes(searchLower) ||
          role.role_permissions.some((perm: { permission: string }) =>
            perm.permission.toLowerCase().includes(searchLower),
          )
        )
      })
      .sort((a: Role, b: Role) => {
        if (sortField === "role_name") {
          return sortOrder === "asc" ? a.role_name.localeCompare(b.role_name) : b.role_name.localeCompare(a.role_name)
        } else {
          const permissionsA = a.role_permissions.map((perm: Permission) => perm.permission).join(", ")
          const permissionsB = b.role_permissions.map((perm: Permission) => perm.permission).join(", ")
          return sortOrder === "asc"
            ? permissionsA.localeCompare(permissionsB)
            : permissionsB.localeCompare(permissionsA)
        }
      })
  }, [grproles, searchQuery, sortField, sortOrder])

  const filteredPermissions = useMemo(() => {
    return ALL_PERMISSIONS.filter((permission) => permission.toLowerCase().includes(permissionsSearch.toLowerCase()))
  }, [permissionsSearch])

  const totalPages = Math.ceil(sortedAndFilteredRoles.length / ITEMS_PER_PAGE)
  const currentRoles = sortedAndFilteredRoles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i)
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("ellipsis")
        pageNumbers.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1)
        pageNumbers.push("ellipsis")
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i)
        }
      } else {
        pageNumbers.push(1)
        pageNumbers.push("ellipsis")
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i)
        }
        pageNumbers.push("ellipsis")
        pageNumbers.push(totalPages)
      }
    }
    return pageNumbers
  }

  if (isLoading) {
    return <Skeleton className="w-full h-96" />
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading roles. Please try again.</div>
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Organization Roles</CardTitle>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Role
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateRole} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newRole">Role Name</Label>
                <Input id="newRole" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} required />
              </div>
              <DialogFooter>
                <Button type="submit">Create Role</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search roles..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-2">
                Sort by <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {["role_name", "permissions"].map((field) => (
                <DropdownMenuItem key={field} onClick={() => handleSort(field as SortField)}>
                  {field === "role_name" ? "Role Name" : "Permissions"}{" "}
                  {sortField === field && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("role_name")}>
                  Role Name {sortField === "role_name" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("permissions")}>
                  Permissions {sortField === "permissions" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentRoles.map((role: Role) => (
                <TableRow key={role._id}>
                  <TableCell>{role.role_name}</TableCell>
                  <TableCell>{role.role_permissions.map((perm: Permission) => perm.permission).join(", ")}</TableCell>
                  <TableCell>
                    <Button variant="outline" onClick={() => openPermissionsDialog(role)}>
                      <Shield className="h-4 w-4 mr-2" />
                      Manage Permissions
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {currentRoles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-8">
                    No roles found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Permissions Management Dialog */}
        <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Manage Permissions: {editRoleName}</DialogTitle>
              <DialogDescription>
                Select the permissions you want to assign to this role. The role name cannot be changed.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdatePermissions} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search permissions..."
                    className="pl-8"
                    value={permissionsSearch}
                    onChange={(e) => setPermissionsSearch(e.target.value)}
                  />
                </div>
                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <div className="space-y-4">
                    {filteredPermissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <Checkbox
                          id={permission}
                          checked={selectedPermissions.includes(permission)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedPermissions([...selectedPermissions, permission])
                            } else {
                              setSelectedPermissions(selectedPermissions.filter((p) => p !== permission))
                            }
                          }}
                        />
                        <Label
                          htmlFor={permission}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          {permission}
                        </Label>
                      </div>
                    ))}
                    {filteredPermissions.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        No permissions found matching your search
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Permissions</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {sortedAndFilteredRoles.length > ITEMS_PER_PAGE && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {getPageNumbers().map((pageNumber, index) => (
                  <PaginationItem key={index}>
                    {pageNumber === "ellipsis" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNumber as number)}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
