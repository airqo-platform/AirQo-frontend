"use client"

import { useState } from "react"
import { Search, Loader2, ArrowUpDown, Eye, Building2, Globe, Users, Filter } from "lucide-react"
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
import { useGroups } from "@/core/hooks/useGroups"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Group } from "@/app/types/groups"
import { CreateOrganizationDialog } from "./create-organization-dialog"

const ITEMS_PER_PAGE = 8

type SortField = "grp_title" | "grp_industry" | "createdAt" | "numberOfGroupUsers"
type SortOrder = "asc" | "desc"

const formatTitle = (title: string) => {
  return title.replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

export function GroupList() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [viewMode, setViewMode] = useState<"table" | "grid">("table")
  const { groups, isLoading, error } = useGroups()

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const sortGroups = (groupsToSort: Group[]) => {
    return [...groupsToSort].sort((a, b) => {
      if (sortField === "createdAt") {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA
      }

      if (sortField === "numberOfGroupUsers") {
        const usersA = a.numberOfGroupUsers || 0
        const usersB = b.numberOfGroupUsers || 0
        return sortOrder === "asc" ? usersA - usersB : usersB - usersA
      }

      let compareA = a[sortField]
      let compareB = b[sortField]

      if (!compareA || !compareB) {
        return sortOrder === "asc" ? -1 : 1
      }

      if (typeof compareA === "string") {
        compareA = compareA.toLowerCase()
        compareB = compareB.toLowerCase()
      }

      if (compareA < compareB) return sortOrder === "asc" ? -1 : 1
      if (compareA > compareB) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }

  const filteredGroups = groups.filter((group: Group) =>
    group.grp_title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const sortedGroups = sortGroups(filteredGroups)

  const totalPages = Math.ceil(sortedGroups.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentGroups = sortedGroups.slice(startIndex, endIndex)

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

  const getInitials = (name: string) => {
    return name
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading organizations...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Building2 className="mr-2 h-6 w-6 text-primary" /> Organizations
          </h1>
          <p className="text-muted-foreground mt-1">Manage your organizations</p>
        </div>
        <CreateOrganizationDialog />
      </div>

      <div className="bg-card rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
              <div className="relative w-full sm:w-auto max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search organizations..."
                  className="pl-8 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10">
                    <Filter className="mr-2 h-4 w-4" /> Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleSort("createdAt")}>
                    Date Created {sortField === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("grp_title")}>
                    Name {sortField === "grp_title" && (sortOrder === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("numberOfGroupUsers")}>
                    Members {sortField === "numberOfGroupUsers" && (sortOrder === "asc" ? "↑" : "↓")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <Tabs
              defaultValue="table"
              className="w-full md:w-auto"
              onValueChange={(value) => setViewMode(value as "table" | "grid")}
            >
              <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
                <TabsTrigger value="table">Table View</TabsTrigger>
                <TabsTrigger value="grid">Grid View</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {viewMode === "table" ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-[40%] cursor-pointer" onClick={() => handleSort("grp_title")}>
                    <div className="flex items-center">
                      Name {sortField === "grp_title" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                    </div>
                  </TableHead>
                  <TableHead className="w-[30%]">Website</TableHead>
                  <TableHead className="w-[15%] cursor-pointer" onClick={() => handleSort("numberOfGroupUsers")}>
                    <div className="flex items-center">
                      Members {sortField === "numberOfGroupUsers" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                    </div>
                  </TableHead>
                  <TableHead className="w-[15%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentGroups.map((group) => (
                  <TableRow key={group._id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="border">
                          <AvatarImage src={group.grp_profile_picture || ""} alt={formatTitle(group.grp_title)} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {getInitials(formatTitle(group.grp_title))}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          {formatTitle(group.grp_title)}
                          {group.grp_country && (
                            <div className="text-xs text-muted-foreground mt-1">{group.grp_country}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {group.grp_website ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <a
                                href={group.grp_website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center text-sm text-primary hover:underline truncate max-w-[200px]"
                              >
                                <Globe className="h-3.5 w-3.5 mr-1.5" />
                                {group.grp_website.replace(/^https?:\/\//, "")}
                              </a>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Visit website</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <span className="text-muted-foreground text-sm">Not provided</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        {group.numberOfGroupUsers || 0}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/organizations/${group._id}`}>
                          <Eye className="mr-2 h-4 w-4" /> View
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {currentGroups.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-10">
                      <div className="flex flex-col items-center justify-center">
                        <Building2 className="h-10 w-10 text-muted-foreground mb-3" />
                        <p className="text-muted-foreground font-medium">No organizations found</p>
                        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                          {searchQuery
                            ? `No results for "${searchQuery}". Try adjusting your search or filters.`
                            : "Try creating a new organization to get started."}
                        </p>
                        {!searchQuery && <CreateOrganizationDialog />}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentGroups.map((group) => (
              <Card key={group._id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="pb-2 space-y-4">
                  <div className="flex justify-between items-start">
                    <Avatar className="h-14 w-14 border">
                      <AvatarImage src={group.grp_profile_picture || ""} alt={formatTitle(group.grp_title)} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg">
                        {getInitials(formatTitle(group.grp_title))}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div>
                    <CardTitle className="line-clamp-1">{formatTitle(group.grp_title)}</CardTitle>
                    <CardDescription className="mt-1 flex items-center">
                      <Users className="h-3.5 w-3.5 mr-1.5" />
                      {group.numberOfGroupUsers || 0} members
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  {group.grp_website && (
                    <a
                      href={group.grp_website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-sm text-primary hover:underline truncate"
                    >
                      <Globe className="h-3.5 w-3.5 mr-1.5" />
                      {group.grp_website.replace(/^https?:\/\//, "")}
                    </a>
                  )}
                </CardContent>
                <CardFooter className="pt-2">
                  <Button asChild variant="default" className="w-full">
                    <Link href={`/organizations/${group._id}`}>
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}

            {currentGroups.length === 0 && (
              <div className="col-span-full flex items-center justify-center p-10 border rounded-lg">
                <div className="flex flex-col items-center justify-center">
                  <Building2 className="h-10 w-10 text-muted-foreground mb-3" />
                  <p className="text-muted-foreground font-medium">No organizations found</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-sm text-center">
                    {searchQuery
                      ? `No results for "${searchQuery}". Try adjusting your search or filters.`
                      : "Try creating a new organization to get started."}
                  </p>
                  {!searchQuery && (
                    <div className="mt-4">
                      <CreateOrganizationDialog />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {sortedGroups.length > 0 && (
          <div className="p-4 border-t flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, sortedGroups.length)} of {sortedGroups.length} organizations
            </div>
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
    </div>
  )
}

