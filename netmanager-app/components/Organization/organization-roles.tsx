"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAppSelector } from "@/core/redux/hooks"
import { roles } from "@/core/apis/roles"
import { useOrgRole } from "@/core/hooks/useRoles"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Search, ArrowUpDown, Plus } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
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

type OrganizationRolesProps = {
  organizationId: string
}

const ITEMS_PER_PAGE = 10

type SortField = "role_name" | "permissions"
type SortOrder = "asc" | "desc"

export function OrganizationRoles({ organizationId }: OrganizationRolesProps) {
  const { grproles, isLoading, error } = useOrgRole(organizationId)
  const [newRoleName, setNewRoleName] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("role_name")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
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
      const newRole = await roles.createRoleApi(data)
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

  const handleUpdateRole = async (roleId: string, newName: string) => {
    try {
      // await roles.updateRoleApi(roleId, { role_name: newName })
      toast({
        title: "Role updated",
        description: `The role has been successfully updated to "${newName}".`,
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
      .filter((role) => {
        const searchLower = searchQuery.toLowerCase()
        return (
          role.role_name.toLowerCase().includes(searchLower) ||
          role.role_permissions.some((perm) => perm.permission.toLowerCase().includes(searchLower))
        )
      })
      .sort((a, b) => {
        if (sortField === "role_name") {
          return sortOrder === "asc" ? a.role_name.localeCompare(b.role_name) : b.role_name.localeCompare(a.role_name)
        } else {
          const permissionsA = a.role_permissions.map((perm) => perm.permission).join(", ")
          const permissionsB = b.role_permissions.map((perm) => perm.permission).join(", ")
          return sortOrder === "asc"
            ? permissionsA.localeCompare(permissionsB)
            : permissionsB.localeCompare(permissionsA)
        }
      })
  }, [grproles, searchQuery, sortField, sortOrder])

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
              {currentRoles.map((role) => (
                <TableRow key={role._id}>
                  <TableCell>{role.role_name}</TableCell>
                  <TableCell>{role.role_permissions.map((perm) => perm.permission).join(", ")}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newName = prompt("Enter new role name:", role.role_name)
                        if (newName) handleUpdateRole(role._id, newName)
                      }}
                    >
                      Edit
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

