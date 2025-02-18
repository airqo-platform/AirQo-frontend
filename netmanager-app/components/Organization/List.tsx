"use client"

import { useState } from "react"
import { Search, Loader2, ArrowUpDown, Eye, Power } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { useGroups, useActivateGroup } from "@/core/hooks/useGroups"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { CreateOrganizationDialog } from "./Create-group"
import { toast } from "@/components/ui/use-toast"

const ITEMS_PER_PAGE = 8

type SortField = "grp_title" | "grp_status" | "numberOfGroupUsers" | "createdAt"
type SortOrder = "asc" | "desc"

export function OrganizationList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const { groups, isLoading, error } = useGroups()
  const activateGroupMutation = useActivateGroup()

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const sortOrganizations = (orgsToSort: any[]) => {
    return [...orgsToSort].sort((a, b) => {
      if (sortField === "createdAt") {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA
      }

      let compareA = a[sortField]
      let compareB = b[sortField]

      if (typeof compareA === "string") {
        compareA = compareA.toLowerCase()
        compareB = compareB.toLowerCase()
      }

      if (compareA < compareB) return sortOrder === "asc" ? -1 : 1
      if (compareA > compareB) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }

  const filteredOrganizations = groups.filter((org) => org.grp_title.toLowerCase().includes(searchQuery.toLowerCase()))

  const sortedOrganizations = sortOrganizations(filteredOrganizations)

  const totalPages = Math.ceil(sortedOrganizations.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentOrganizations = sortedOrganizations.slice(startIndex, endIndex)

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

  const handleActivateGroup = async (groupId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    try {
      await activateGroupMutation.mutateAsync({ groupId, status: newStatus })
      toast({
        title: "Success",
        description: `Group ${newStatus === "ACTIVE" ? "activated" : "deactivated"} successfully.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update group status. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-2">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Organizations</h1>
        <CreateOrganizationDialog />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search organizations..."
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
            <DropdownMenuItem onClick={() => handleSort("createdAt")}>
              Date Created {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("grp_title")}>
              Name {sortField === "grp_title" && (sortOrder === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("grp_status")}>
              Status {sortField === "grp_status" && (sortOrder === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("numberOfGroupUsers")}>
              Users {sortField === "numberOfGroupUsers" && (sortOrder === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%] cursor-pointer" onClick={() => handleSort("grp_title")}>
                Name {sortField === "grp_title" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="w-[20%] cursor-pointer" onClick={() => handleSort("grp_status")}>
                Status {sortField === "grp_status" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="w-[20%] cursor-pointer" onClick={() => handleSort("numberOfGroupUsers")}>
                Users {sortField === "numberOfGroupUsers" && (sortOrder === "asc" ? "↑" : "↓")}
              </TableHead>
              <TableHead className="w-[30%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentOrganizations.map((org) => (
              <TableRow key={org._id}>
                <TableCell className="font-medium">{org.grp_title}</TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      org.grp_status === "ACTIVE" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}
                  >
                    {org.grp_status === "ACTIVE" ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell>{org.numberOfGroupUsers}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Button asChild variant="ghost" size="sm" className="w-1/2">
                      <Link href={`/organizations/${org._id}`}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-1/2"
                      onClick={() => handleActivateGroup(org._id, org.grp_status)}
                      disabled={activateGroupMutation.isLoading}
                    >
                      <Power className={`mr-2 h-4 w-4 ${org.grp_status === "ACTIVE" ? "text-green-500" : "text-red-500"}`} />
                      {org.grp_status === "ACTIVE" ? "Deactivate" : "Activate"}
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {currentOrganizations.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8">
                  No organizations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {sortedOrganizations.length > 0 && (
        <div className="mt-4 flex justify-between items-center">
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
    </div>
  )
}