"use client"

import type React from "react"

import { useState, useMemo, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAppSelector } from "@/core/redux/hooks"
import { useGroupRoles } from "@/core/hooks/useRoles"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Search, ArrowUpDown, Plus, Shield, RefreshCw } from "lucide-react"
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { roles } from "@/core/apis/roles"
import { usePermissions } from "@/core/hooks/usePermission"
import type { Role, Permission } from "@/app/types/roles"

type OrganizationRolesProps = {
  organizationId: string
}

const ITEMS_PER_PAGE = 8

type SortField = "role_name" | "permissions"
type SortOrder = "asc" | "desc"

export function OrganizationRoles({ organizationId }: OrganizationRolesProps) {
  const { grproles, isLoading: isRolesLoading, error: rolesError } = useGroupRoles(organizationId)
  const {
    permissions: allPermissions,
    isLoading: isPermissionsLoading,
    error: permissionsError,
    fetchNetworkPermissions,
    updateRolePermissions,
  } = usePermissions()

  // Use a ref to track if we've already fetched permissions
  const permissionsFetched = useRef(false)

  const [newRoleName, setNewRoleName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("role_name")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false)
  const [editRoleId, setEditRoleId] = useState<string>("")
  const [editRoleName, setEditRoleName] = useState("")
  const [permissionsSearch, setPermissionsSearch] = useState("")
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const network = useAppSelector((state) => state.user.activeNetwork)

  const loadPermissions = async () => {
    try {
      permissionsFetched.current = true
      await fetchNetworkPermissions()
    } catch (error) {
      console.error("Failed to fetch permissions:", error)
      toast({
        title: "Error",
        description: "Failed to load permissions. Please try again.",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    // Only fetch permissions once when the component mounts
    if (!permissionsFetched.current) {
      loadPermissions()
    }
  }, [fetchNetworkPermissions])

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
    setEditRoleId(role._id)
    setEditRoleName(role.role_name)

    // Extract permission IDs from the role's permissions
    const permissionIds = role.role_permissions.map((perm: Permission) => perm._id)
    setSelectedPermissions(permissionIds)
    setIsPermissionsDialogOpen(true)

    // Ensure permissions are loaded when dialog opens
    if (!Array.isArray(allPermissions) || allPermissions.length === 0) {
      loadPermissions()
    }
  }

  const handleUpdatePermissions = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await updateRolePermissions(editRoleId, selectedPermissions)

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
    if (!Array.isArray(grproles)) return []

    return grproles
      .filter((role: Role) => {
        const searchLower = searchQuery.toLowerCase()
        return (
          role.role_name.toLowerCase().includes(searchLower) ||
          role.role_permissions.some((perm: Permission) => perm.permission.toLowerCase().includes(searchLower))
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
    // Ensure allPermissions is an array before filtering
    if (!Array.isArray(allPermissions)) return []

    return allPermissions.filter(
      (permission) =>
        permission.permission.toLowerCase().includes(permissionsSearch.toLowerCase()) ||
        (permission.description && permission.description.toLowerCase().includes(permissionsSearch.toLowerCase())),
    )
  }, [allPermissions, permissionsSearch])

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

  const isLoading = isRolesLoading || isPermissionsLoading
  const error = rolesError || permissionsError

  if (isLoading) {
    return <Skeleton className="w-full h-96" />
  }

  if (error) {
    return <div className="text-center text-red-500">Error loading data. Please try again.</div>
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
                  <TableCell className="font-medium">{role.role_name}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {role.role_permissions && role.role_permissions.length > 0 ? (
                        role.role_permissions.slice(0, 3).map((perm: Permission) => (
                          <TooltipProvider key={perm._id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-xs">
                                  {perm.permission}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{perm.description || "No description available"}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))
                      ) : (
                        <span className="text-muted-foreground text-sm">No permissions assigned</span>
                      )}
                      {role.role_permissions && role.role_permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.role_permissions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
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
          <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Manage Permissions: {editRoleName}</DialogTitle>
              <DialogDescription>
                Select the permissions you want to assign to this role. The role name cannot be changed.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdatePermissions} className="space-y-4 flex-1 overflow-hidden flex flex-col">
              <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search permissions..."
                    className="pl-8"
                    value={permissionsSearch}
                    onChange={(e) => setPermissionsSearch(e.target.value)}
                  />
                </div>

                {/* Custom scrollable container with visible scrollbar */}
                <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
                  <div
                    className="flex-1 overflow-y-auto p-4 space-y-3"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "rgba(156, 163, 175, 0.5) transparent",
                    }}
                  >
                    {filteredPermissions.length > 0 ? (
                      filteredPermissions.map((permission) => (
                        <div
                          key={permission._id}
                          className="flex items-start space-x-2 py-2 border-b border-gray-100 last:border-0"
                        >
                          <Checkbox
                            id={permission._id}
                            checked={selectedPermissions.includes(permission._id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedPermissions([...selectedPermissions, permission._id])
                              } else {
                                setSelectedPermissions(selectedPermissions.filter((p) => p !== permission._id))
                              }
                            }}
                            className="mt-1"
                          />
                          <div className="grid gap-1">
                            <Label
                              htmlFor={permission._id}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {permission.permission}
                            </Label>
                            {permission.description && (
                              <p className="text-xs text-muted-foreground">{permission.description}</p>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 space-y-4 text-center">
                        <p className="text-muted-foreground">
                          {permissionsSearch
                            ? "No permissions found matching your search"
                            : "No permissions available."}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={loadPermissions}
                          disabled={isPermissionsLoading}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${isPermissionsLoading ? "animate-spin" : ""}`} />
                          Refresh Permissions
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm pt-2">
                  <span className="text-muted-foreground">
                    {selectedPermissions.length} of {Array.isArray(allPermissions) ? allPermissions.length : 0}{" "}
                    permissions selected
                  </span>
                  <div className="space-x-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => setSelectedPermissions([])}>
                      Clear All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (Array.isArray(allPermissions)) {
                          setSelectedPermissions(allPermissions.map((p) => p._id))
                        }
                      }}
                    >
                      Select All
                    </Button>
                  </div>
                </div>
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
