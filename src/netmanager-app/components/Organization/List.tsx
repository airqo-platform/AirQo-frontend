"use client"

import { useState } from "react"
import { Search, Loader2, ArrowUpDown, Eye, Building2, Users, Filter, AlertCircle, CheckCircle2 } from "lucide-react"
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
import { CreateOrganizationDialog } from "./create-organization-dialog"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const ITEMS_PER_PAGE = 8

type SortField = "grp_title" | "grp_industry" | "numberOfGroupUsers" | "createdAt"
type SortOrder = "asc" | "desc"

const formatTitle = (title: string) => {
  return title.replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

export function OrganizationList() {
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

  const sortOrganizations = (orgsToSort: any[]) => {
    return [...orgsToSort].sort((a, b) => {
      if (sortField === "createdAt") {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA
      }

      let compareA = a[sortField]
      let compareB = b[sortField]

      if (!compareA || !compareB) {
        return sortOrder === "asc" ? -1 : 1
      }

      if (typeof compareA === "string") {
        compareA = formatTitle(compareA).toLowerCase()
        compareB = formatTitle(compareB).toLowerCase()
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

  const getInitials = (name: string) => {
    return name
      .split(/\s+/)
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  // For demonstration purposes, we'll simulate the pending statuses
  // In a real app, this would come from your API
  const getPendingStatuses = (org: any) => {
    // These would normally be properties on your organization object
    // For this example, we're simulating them
    const hasSites = org.hasSites || false
    const hasDevices = org.hasDevices || false
    const hasMembers = org.numberOfGroupUsers > 0

    return {
      sites: !hasSites,
      devices: !hasDevices,
      members: !hasMembers,
    }
  }

  const renderPendingStatuses = (org: any) => {
    // These would normally be properties on your organization object
    // For this example, we're using the properties from your hooks
    const hasSites = org.hasSites || false
    const hasDevices = org.hasDevices || false
    const hasMembers = org.numberOfGroupUsers > 0

    const pendingStatuses = {
      sites: !hasSites,
      devices: !hasDevices,
      members: !hasMembers,
    }

    const pendingItems = []

    if (pendingStatuses.sites) {
      pendingItems.push("Sites")
    }

    if (pendingStatuses.devices) {
      pendingItems.push("Devices")
    }

    if (pendingStatuses.members) {
      pendingItems.push("Members")
    }

    if (pendingItems.length === 0) {
      return (
        <Badge className="bg-green-500 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" /> Complete
        </Badge>
      )
    }

    return (
      <div className="flex flex-wrap gap-1">
        {pendingItems.map((item) => (
          <TooltipProvider key={item}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="text-amber-500 border-amber-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {item}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pending: Assign {item.toLowerCase()}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>
    )
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
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Building2 className="mr-2 h-6 w-6" /> Organizations
          </h1>
          <p className="text-muted-foreground mt-1">Manage your organizations and their resources</p>
        </div>
        <CreateOrganizationDialog />
      </div>

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
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
              <DropdownMenuItem onClick={() => handleSort("grp_industry")}>
                Industry {sortField === "grp_industry" && (sortOrder === "asc" ? "↑" : "↓")}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSort("numberOfGroupUsers")}>
                Users {sortField === "numberOfGroupUsers" && (sortOrder === "asc" ? "↑" : "↓")}
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

      {viewMode === "table" ? (
        <div className="border rounded-lg overflow-hidden bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[30%] cursor-pointer" onClick={() => handleSort("grp_title")}>
                  <div className="flex items-center">
                    Name {sortField === "grp_title" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                  </div>
                </TableHead>
                <TableHead className="w-[15%] cursor-pointer" onClick={() => handleSort("grp_industry")}>
                  <div className="flex items-center">
                    Industry {sortField === "grp_industry" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                  </div>
                </TableHead>
                <TableHead className="w-[10%] cursor-pointer" onClick={() => handleSort("numberOfGroupUsers")}>
                  <div className="flex items-center">
                    Users {sortField === "numberOfGroupUsers" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                  </div>
                </TableHead>
                <TableHead className="w-[25%]">Pending Setup</TableHead>
                <TableHead className="w-[20%] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentOrganizations.map((org) => (
                <TableRow key={org._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={org.grp_profile_picture || ""} alt={formatTitle(org.grp_title)} />
                        <AvatarFallback>{getInitials(formatTitle(org.grp_title))}</AvatarFallback>
                      </Avatar>
                      <div>
                        {formatTitle(org.grp_title)}
                        {org.grp_country && <div className="text-xs text-muted-foreground mt-1">{org.grp_country}</div>}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center font-medium capitalize">
                      {org.grp_industry ? org.grp_industry : "Not provided"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      {org.numberOfGroupUsers}
                    </div>
                  </TableCell>
                  <TableCell>{renderPendingStatuses(org)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="default" size="sm">
                      <Link href={`/organizations/${org._id}`}>
                        <Eye className="mr-2 h-4 w-4" /> View Details
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {currentOrganizations.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center">
                      <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">No organizations found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your search or create a new organization
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {currentOrganizations.map((org) => (
            <Card key={org._id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={org.grp_profile_picture || ""} alt={formatTitle(org.grp_title)} />
                    <AvatarFallback>{getInitials(formatTitle(org.grp_title))}</AvatarFallback>
                  </Avatar>
                  {renderPendingStatuses(org)}
                </div>
                <CardTitle className="mt-2">{formatTitle(org.grp_title)}</CardTitle>
                <CardDescription>
                  {org.grp_industry ? org.grp_industry : "Industry not specified"}
                  {org.grp_country && ` • ${org.grp_country}`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{org.numberOfGroupUsers} members</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {org.createdAt && new Date(org.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <Button asChild variant="default" className="w-full">
                  <Link href={`/organizations/${org._id}`}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}

          {currentOrganizations.length === 0 && (
            <div className="col-span-full flex items-center justify-center p-8 border rounded-lg">
              <div className="flex flex-col items-center justify-center">
                <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">No organizations found</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search or create a new organization
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {sortedOrganizations.length > 0 && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, sortedOrganizations.length)} of {sortedOrganizations.length}{" "}
            organizations
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
  )
}

