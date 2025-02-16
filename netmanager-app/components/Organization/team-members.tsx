"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRoles } from "@/core/hooks/useRoles"
import type { GroupMember } from "@/app/types/groups"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useTeamMembers, useInviteUserToGroup } from "@/core/hooks/useGroups"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination"
import { Label } from "@/components/ui/label"
import { UserPlus, Search, ArrowUpDown } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type TeamMembersProps = {
  organizationId: string
}

const ITEMS_PER_PAGE = 6

type SortField = "firstName" | "lastName" | "email" | "role_name"
type SortOrder = "asc" | "desc"

export function TeamMembers({ organizationId }: TeamMembersProps) {
  const { toast } = useToast()
  const { team, isLoading, error } = useTeamMembers(organizationId)
  const { roles, isLoading: rolesLoading, error: rolesError } = useRoles()
  const inviteUserMutation = useInviteUserToGroup(organizationId)
  const [newMemberEmail, setNewMemberEmail] = useState("")
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false)
  const [newRoleId, setNewRoleId] = useState<string>("")
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<SortField>("lastName")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    inviteUserMutation.mutate(newMemberEmail, {
      onSuccess: () => {
        toast({
          title: "Invitation sent",
          description: `An invitation has been sent to ${newMemberEmail}`,
        })
        setNewMemberEmail("")
        setIsInviteDialogOpen(false)
      },
      onError: (error: Error) => {
        console.error("Error inviting member:", error)
        toast({
          title: "Invitation Failed",
          description: error.message || "Failed to invite member. Please try again.",
          variant: "destructive",
        })
      },
    })
  }

  const handleUpdateRole = async () => {
    if (!selectedMember || !newRoleId) return

    try {
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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const sortedAndFilteredTeam = useMemo(() => {
    return team
      .filter((member: GroupMember) => {
        const searchLower = searchQuery.toLowerCase()
        return (
          member.firstName.toLowerCase().includes(searchLower) ||
          member.lastName.toLowerCase().includes(searchLower) ||
          member.email.toLowerCase().includes(searchLower) ||
          member.role_name?.toLowerCase().includes(searchLower)
        )
      })
      .sort((a: GroupMember, b: GroupMember) => {
        const compareA = a[sortField].toString().toLowerCase()
        const compareB = b[sortField].toString().toLowerCase()

        return sortOrder === "asc" ? compareA.localeCompare(compareB) : compareB.localeCompare(compareA)
      })
  }, [team, searchQuery, sortField, sortOrder])

  const totalPages = Math.ceil(sortedAndFilteredTeam.length / ITEMS_PER_PAGE)
  const currentTeamMembers = sortedAndFilteredTeam.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

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
    return <div className="text-center text-red-500">Error loading members. Please try again.</div>
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Team Members</CardTitle>
        <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite New Team Member</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email to invite"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit">Send Invitation</Button>
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
              placeholder="Search members..."
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
              {["firstName", "lastName", "email", "role_name"].map((field) => (
                <DropdownMenuItem key={field} onClick={() => handleSort(field as SortField)}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}{" "}
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
                <TableHead className="cursor-pointer" onClick={() => handleSort("firstName")}>
                  First Name {sortField === "firstName" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("lastName")}>
                  Last Name {sortField === "lastName" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("email")}>
                  Email {sortField === "email" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort("role_name")}>
                  Role {sortField === "role_name" && (sortOrder === "asc" ? "↑" : "↓")}
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentTeamMembers.map((member: GroupMember) => (
                <TableRow key={member._id}>
                  <TableCell>{member.firstName}</TableCell>
                  <TableCell>{member.lastName}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>{member.role_name || "No role assigned"}</TableCell>
                  <TableCell>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
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
                        <DialogFooter>
                          <Button onClick={handleUpdateRole}>Update Role</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
              {currentTeamMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No team members found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {sortedAndFilteredTeam.length > ITEMS_PER_PAGE && (
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

