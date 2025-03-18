"use client"

import { useState, useEffect, useMemo } from "react"
import Head from "next/head"
import Link from "next/link"
import {
  Search,
  ArrowUpDown,
  Eye,
  Building2,
  Users,
  Filter,
  AlertCircle,
  CheckCircle2,
  Download,
  SlidersHorizontal,
  Calendar,
  X,
} from "lucide-react"

// UI Components
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"

// Custom Components
import { CreateOrganizationDialog } from "@/components/Organization/create-organization-dialog"
import { EmptyState } from "@/components/ui/empty-state"

// Hooks and Types
import { useGroups } from "@/core/hooks/useGroups"
import { useOrganizationResources, usePrefetchResources } from "@/core/hooks/use-resources"
import type { Group } from "@/app/types/groups"

// Constants
const ITEMS_PER_PAGE = 10
const INDUSTRY_OPTIONS = [
  "All Industries",
  "Technology",
  "Healthcare",
  "Education",
  "Manufacturing",
  "Retail",
  "Finance",
  "Government",
  "Non-profit",
  "Other",
]

// Types
type SortField = "grp_title" | "grp_industry" | "numberOfGroupUsers" | "createdAt"
type SortOrder = "asc" | "desc"
type ViewMode = "table" | "grid"
type FilterState = {
  industry: string
  status: "all" | "complete" | "incomplete"
}

/**
 * Formats a title string by replacing underscores and hyphens with spaces
 * and capitalizing the first letter of each word
 */
const formatTitle = (title: string): string => {
  return title.replace(/[_-]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
}

/**
 * Gets initials from a name (up to 2 characters)
 */
const getInitials = (name: string): string => {
  return name
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Formats a date to a readable string
 */
const formatDate = (dateString: string): string => {
  if (!dateString) return "N/A"

  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date)
}

const OrganizationsPage =() => {
  // Start prefetching resources for frequently accessed groups
  usePrefetchResources()

  // State for UI controls
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [viewMode, setViewMode] = useState<ViewMode>("table")
  const [filters, setFilters] = useState<FilterState>({
    industry: "All Industries",
    status: "all",
  })

  // Fetch data
  const { groups, isLoading: isLoadingGroups, error: groupsError } = useGroups()
  const { data: resourceMap, isLoading: isLoadingResources, error: resourcesError } = useOrganizationResources()

  // Combined loading and error states
  const isLoading = isLoadingGroups || isLoadingResources
  const error = groupsError || resourcesError

  // Reset to first page when search query or filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, filters])

  // Handle sort changes
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  // Filter and sort organizations
  const filteredAndSortedOrganizations = useMemo(() => {
    if (!groups) return []

    // First apply text search filter
    let filtered = groups.filter((org) => org.grp_title.toLowerCase().includes(searchQuery.toLowerCase()))

    // Then apply industry filter
    if (filters.industry !== "All Industries") {
      filtered = filtered.filter((org) => org.grp_industry?.toLowerCase() === filters.industry.toLowerCase())
    }

    // Then apply status filter
    if (filters.status !== "all" && resourceMap) {
      filtered = filtered.filter((org) => {
        const resourceStatus = resourceMap.get(org._id) || { hasSites: false, hasDevices: false }
        const hasMembers = org.numberOfGroupUsers > 0
        const isComplete = resourceStatus.hasSites && resourceStatus.hasDevices && hasMembers

        return filters.status === "complete" ? isComplete : !isComplete
      })
    }

    // Finally sort the filtered results
    return [...filtered].sort((a, b) => {
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
        compareA = compareA.toLowerCase()
        compareB = compareB.toLowerCase()
      }

      if (compareA < compareB) return sortOrder === "asc" ? -1 : 1
      if (compareA > compareB) return sortOrder === "asc" ? 1 : -1
      return 0
    })
  }, [groups, searchQuery, filters, sortField, sortOrder, resourceMap])

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedOrganizations.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentOrganizations = filteredAndSortedOrganizations.slice(startIndex, endIndex)

  // Generate page numbers for pagination
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

  // Render status badges for an organization
  const renderStatusBadges = (org: Group) => {
    // Get resource status from our map
    const resourceStatus = resourceMap?.get(org._id) || { hasSites: false, hasDevices: false }

    // Check if the group has members
    const hasMembers = org.numberOfGroupUsers > 0

    const pendingStatuses = {
      sites: !resourceStatus.hasSites,
      devices: !resourceStatus.hasDevices,
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

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Skeleton className="h-10 w-48" />
        </div>

        <div className="border rounded-lg overflow-hidden bg-card">
          <div className="p-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-4 py-4 border-b last:border-0">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-9 w-32" />
                </div>
              ))}
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <Alert variant="destructive" className="max-w-md">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error Loading Organizations</AlertTitle>
          <AlertDescription>
            {error.message || "Failed to load organizations. Please try again later."}
          </AlertDescription>
          <Button variant="outline" className="mt-4 w-full" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Alert>
      </div>
    )
  }

  // Empty state
  if (groups.length === 0) {
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

        <EmptyState
          icon={<Building2 className="h-12 w-12 text-muted-foreground" />}
          title="No Organizations Found"
          description="Get started by creating your first organization."
          action={<CreateOrganizationDialog />}
        />
      </div>
    )
  }

  // Empty search results
  if (filteredAndSortedOrganizations.length === 0) {
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
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter Organizations</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Industry</DropdownMenuLabel>
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <DropdownMenuItem
                      key={industry}
                      onClick={() => setFilters({ ...filters, industry })}
                      className="flex items-center justify-between"
                    >
                      {industry}
                      {filters.industry === industry && <CheckCircle2 className="h-4 w-4 ml-2" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Status</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => setFilters({ ...filters, status: "all" })}
                    className="flex items-center justify-between"
                  >
                    All
                    {filters.status === "all" && <CheckCircle2 className="h-4 w-4 ml-2" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilters({ ...filters, status: "complete" })}
                    className="flex items-center justify-between"
                  >
                    Complete
                    {filters.status === "complete" && <CheckCircle2 className="h-4 w-4 ml-2" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilters({ ...filters, status: "incomplete" })}
                    className="flex items-center justify-between"
                  >
                    Incomplete
                    {filters.status === "incomplete" && <CheckCircle2 className="h-4 w-4 ml-2" />}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <EmptyState
          icon={<Search className="h-12 w-12 text-muted-foreground" />}
          title="No Results Found"
          description="We couldn't find any organizations matching your search criteria."
          action={
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setFilters({ industry: "All Industries", status: "all" })
              }}
            >
              Clear Filters
            </Button>
          }
        />
      </div>
    )
  }

  // Main content
  return (
    <>
      <Head>
        <title>Organizations | Dashboard</title>
      </Head>

      <div className="p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              <Building2 className="mr-2 h-6 w-6" /> Organizations
            </h1>
            <p className="text-muted-foreground mt-1">Manage your organizations and their resources</p>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Export as CSV</DropdownMenuItem>
                <DropdownMenuItem>Export as PDF</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <CreateOrganizationDialog />
          </div>
        </div>

        {/* Filters and View Controls */}
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
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  {(filters.industry !== "All Industries" || filters.status !== "all") && (
                    <Badge
                      variant="secondary"
                      className="ml-2 px-1 py-0 h-5 min-w-5 flex items-center justify-center rounded-full"
                    >
                      {(filters.industry !== "All Industries" ? 1 : 0) + (filters.status !== "all" ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter Organizations</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Industry</DropdownMenuLabel>
                  {INDUSTRY_OPTIONS.map((industry) => (
                    <DropdownMenuItem
                      key={industry}
                      onClick={() => setFilters({ ...filters, industry })}
                      className="flex items-center justify-between"
                    >
                      {industry}
                      {filters.industry === industry && <CheckCircle2 className="h-4 w-4 ml-2" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Status</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => setFilters({ ...filters, status: "all" })}
                    className="flex items-center justify-between"
                  >
                    All
                    {filters.status === "all" && <CheckCircle2 className="h-4 w-4 ml-2" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilters({ ...filters, status: "complete" })}
                    className="flex items-center justify-between"
                  >
                    Complete
                    {filters.status === "complete" && <CheckCircle2 className="h-4 w-4 ml-2" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setFilters({ ...filters, status: "incomplete" })}
                    className="flex items-center justify-between"
                  >
                    Incomplete
                    {filters.status === "incomplete" && <CheckCircle2 className="h-4 w-4 ml-2" />}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                {(filters.industry !== "All Industries" || filters.status !== "all") && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setFilters({ industry: "All Industries", status: "all" })}
                      className="text-destructive focus:text-destructive"
                    >
                      Clear All Filters
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-10">
                  <SlidersHorizontal className="mr-2 h-4 w-4" /> Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleSort("createdAt")} className="flex items-center justify-between">
                  Date Created
                  {sortField === "createdAt" && <ArrowUpDown className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("grp_title")} className="flex items-center justify-between">
                  Name
                  {sortField === "grp_title" && <ArrowUpDown className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSort("grp_industry")}
                  className="flex items-center justify-between"
                >
                  Industry
                  {sortField === "grp_industry" && <ArrowUpDown className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleSort("numberOfGroupUsers")}
                  className="flex items-center justify-between"
                >
                  Users
                  {sortField === "numberOfGroupUsers" && <ArrowUpDown className="h-4 w-4 ml-2" />}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <Tabs
            defaultValue="table"
            value={viewMode}
            onValueChange={(value) => setViewMode(value as ViewMode)}
            className="w-full md:w-auto"
          >
            <TabsList className="grid w-full grid-cols-2 max-w-[200px]">
              <TabsTrigger value="table">Table View</TabsTrigger>
              <TabsTrigger value="grid">Grid View</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Active Filters Display */}
        {(filters.industry !== "All Industries" || filters.status !== "all") && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active Filters:</span>

            {filters.industry !== "All Industries" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Industry: {filters.industry}
                <button
                  onClick={() => setFilters({ ...filters, industry: "All Industries" })}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            {filters.status !== "all" && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Status: {filters.status === "complete" ? "Complete" : "Incomplete"}
                <button
                  onClick={() => setFilters({ ...filters, status: "all" })}
                  className="ml-1 rounded-full hover:bg-muted p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setFilters({ industry: "All Industries", status: "all" })}
            >
              Clear All
            </Button>
          </div>
        )}

        {/* Table View */}
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
                  <TableHead className="w-[15%] cursor-pointer" onClick={() => handleSort("createdAt")}>
                    <div className="flex items-center">
                      Created {sortField === "createdAt" && <ArrowUpDown className="ml-2 h-4 w-4" />}
                    </div>
                  </TableHead>
                  <TableHead className="w-[15%]">Status</TableHead>
                  <TableHead className="w-[15%] text-right">Actions</TableHead>
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
                          {org.grp_country && (
                            <div className="text-xs text-muted-foreground mt-1">{org.grp_country}</div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center font-medium capitalize">
                        {org.grp_industry ? formatTitle(org.grp_industry) : "Not provided"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                        {org.numberOfGroupUsers}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDate(org.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>{renderStatusBadges(org)}</TableCell>
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
                    <TableCell colSpan={6} className="text-center py-8">
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
          /* Grid View */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {currentOrganizations.map((org) => (
              <Card key={org._id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={org.grp_profile_picture || ""} alt={formatTitle(org.grp_title)} />
                      <AvatarFallback>{getInitials(formatTitle(org.grp_title))}</AvatarFallback>
                    </Avatar>
                    {renderStatusBadges(org)}
                  </div>
                  <CardTitle className="mt-2">{formatTitle(org.grp_title)}</CardTitle>
                  <CardDescription>
                    {org.grp_industry ? formatTitle(org.grp_industry) : "Industry not specified"}
                    {org.grp_country && ` • ${org.grp_country}`}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{org.numberOfGroupUsers} members</span>
                    </div>
                    <div className="text-sm text-muted-foreground">{formatDate(org.createdAt)}</div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Button asChild variant="default" className="w-full">
                    <Link href={`/organizations/${org._id}`}>
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </Link>
                  </Button>
                </CardFooter>
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

        {/* Pagination */}
        {filteredAndSortedOrganizations.length > 0 && (
          <div className="mt-6 flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, filteredAndSortedOrganizations.length)} of{" "}
              {filteredAndSortedOrganizations.length} organizations
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
    </>
  )
}

export default OrganizationsPage;