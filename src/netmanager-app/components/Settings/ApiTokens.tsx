"use client"

import { useState } from "react"
import moment from "moment"
import { useAppDispatch } from "@/core/redux/hooks"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { performRefresh } from "@/core/redux/slices/clientsSlice"
import EditClientForm from "./EditClientForm"
import CreateClientForm from "./CreateClientForm"
import DialogWrapper from "./DialogWrapper"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Copy, Info, Plus, Search, ArrowUpDown, Loader2 } from "lucide-react"
import type { Client } from "@/app/types/clients"
import { settings } from "@/core/apis/settings"
import { useUserClients } from "@/core/hooks/useUserClients"
import { Input } from "@/components/ui/input"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { useQueryClient } from "@tanstack/react-query"

const ITEMS_PER_PAGE = 8

type SortField = "name" | "ip_addresses" | "isActive" | "createdAt"
type SortOrder = "asc" | "desc"

const UserClientsTable = () => {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()
  const { toast } = useToast()
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [isLoadingToken, setIsLoadingToken] = useState(false)
  const [isLoadingActivationRequest, setIsLoadingActivationRequest] = useState(false)
  const [openEditForm, setOpenEditForm] = useState(false)
  const [openCreateForm, setOpenCreateForm] = useState(false)
  const [selectedClient, setSelectedClient] = useState({} as Client)
  const { clients, isLoading, error } = useUserClients()

  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const sortClients = (clientsToSort: Client[]) => {
    return [...clientsToSort].sort((a, b) => {
      if (sortField === "createdAt") {
        const dateA = new Date(a.createdAt || 0).getTime()
        const dateB = new Date(b.createdAt || 0).getTime()
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA
      }

      let compareA = a[sortField]?.toString() || ""
      let compareB = b[sortField]?.toString() || ""

      if (sortField === "isActive") {
        return sortOrder === "asc" ? Number(b.isActive) - Number(a.isActive) : Number(a.isActive) - Number(b.isActive)
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

  const filteredClients = clients.filter((client: Client) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      client.name?.toLowerCase().includes(searchLower) ||
      client.ip_addresses?.join(", ").toLowerCase().includes(searchLower)
    )
  })

  const sortedClients = sortClients(filteredClients)

  const totalPages = Math.ceil(sortedClients.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const currentClients = sortedClients.slice(startIndex, endIndex)

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

  const hasAccessToken = (clientId: string): boolean => {
    const client = clients?.find((client: Client) => client._id === clientId)
    return client?.access_token?.token ? true : false
  }

  const getClientToken = (clientID: string) => {
    const client = clients?.find((client: Client) => client._id === clientID)
    return client && client.access_token && client.access_token.token
  }

  const getClientTokenExpiryDate = (clientID: string) => {
    const client = clients?.find((client: Client) => client._id === clientID)
    return client && client.access_token && client.access_token.expires
  }

  const getClientTokenCreateAt = (clientID: string) => {
    const client = clients?.find((client: Client) => client._id === clientID)
    return client && client.access_token && client.access_token.createdAt
  }

  const handleGenerateToken = async (res: Client) => {
    setIsLoadingToken(true)
    if (!res?.isActive) {
      setShowInfoModal(true)
      setIsLoadingToken(false)
      return
    } else {
      try {
        const response = await settings.generateTokenApi(res)
        await queryClient.invalidateQueries({ queryKey: ["clients"] })
        if (response) {
          toast({
            title: "Success",
            description: "Token generated successfully",
          })
        }
        dispatch(performRefresh())
      } catch (error: any) {
        const errorMessage = error?.response?.data?.message || error.message || "Failed to generate token"
        toast({
          title: "Error",
          description: errorMessage,
        })
      } finally {
        setIsLoadingToken(false)
      }
    }
  }

  const handleActivationRequest = async () => {
    setIsLoadingActivationRequest(true)
    try {
      const clientID = selectedClient?._id
      const response = await settings.activationRequestApi(clientID)
      if (response) {
        setShowInfoModal(false)
        setTimeout(() => {
          toast({
            title: "Success",
            description: "Activation request sent successfully",
          })
        }, 3000)
      }
    } catch (error: any) {
      setShowInfoModal(false)
      setTimeout(() => {
        toast({
          title: "Error",
          description: error.message || "Failed to send activation request",
          variant: "destructive",
        })
      }, 3000)
    } finally {
      setIsLoadingActivationRequest(false)
    }
  }

  const displayIPAddresses = (client: Client) => {
    return Array.isArray(client.ip_addresses) ? client.ip_addresses.join(", ") : client.ip_addresses
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
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Clients</h2>
        <Button onClick={() => setOpenCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create Client
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search clients..."
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
            <DropdownMenuItem onClick={() => handleSort("name")}>
              Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("ip_addresses")}>
              IP Address {sortField === "ip_addresses" && (sortOrder === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleSort("isActive")}>
              Status {sortField === "isActive" && (sortOrder === "asc" ? "↑" : "↓")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Client name</TableHead>
              <TableHead className="w-[138px]">IP Address</TableHead>
              <TableHead className="w-[142px]">Client Status</TableHead>
              <TableHead className="w-[138px]">Created</TableHead>
              <TableHead className="w-[138px]">Token</TableHead>
              <TableHead className="w-[138px]">Expires</TableHead>
              <TableHead className="w-24"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentClients.map((client: Client, index: number) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{client?.name}</TableCell>
                <TableCell>{displayIPAddresses(client)}</TableCell>
                <TableCell>
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      client?.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {client?.isActive ? "Activated" : "Not Activated"}
                  </span>
                </TableCell>
                <TableCell>
                  {getClientTokenCreateAt(client._id) &&
                    moment(getClientTokenCreateAt(client._id)).format("MMM DD, YYYY")}
                </TableCell>
                <TableCell>
                  {hasAccessToken(client._id) ? (
                    <div className="flex items-center">
                      <span className="mr-2 text-slate-700 font-mono">
                        {getClientToken(client._id)?.slice(0, 2)}
                        <span className="mx-1">•••••••</span>
                        {getClientToken(client._id)?.slice(-2)}
                      </span>
                      <Button
                        title="Copy full token"
                        variant="ghost"
                        size="sm"
                        onClick={async () => {
                          const token = await getClientToken(client._id)
                          if (token) {
                            navigator.clipboard.writeText(token)
                            toast({
                              title: "Success",
                              description: "API token copied to clipboard",
                              variant: "default",
                            })
                          }
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant={!hasAccessToken(client._id) ? "default" : "secondary"}
                      size="sm"
                      disabled={isLoadingToken}
                      onClick={() => {
                        setSelectedClient(client)
                        handleGenerateToken(client)
                      }}
                    >
                      Generate
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  {getClientTokenExpiryDate(client._id) &&
                    moment(getClientTokenExpiryDate(client._id)).format("MMM DD, YYYY")}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setOpenEditForm(true)
                      setSelectedClient(client)
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {currentClients.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No clients found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {sortedClients.length > 0 && (
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

      <EditClientForm open={openEditForm} onClose={() => setOpenEditForm(false)} data={selectedClient} />
      <CreateClientForm open={openCreateForm} onClose={() => setOpenCreateForm(false)} />
      <DialogWrapper
        open={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        handleClick={handleActivationRequest}
        primaryButtonText={"Send activation request"}
        loading={isLoadingActivationRequest}
      >
        <div className="flex items-center">
          <Info className="h-5 w-5 mr-2 text-blue-500" />
          <p className="text-sm text-gray-600">
            You cannot generate a token for an inactive client. Reach out to support for assistance at support@airqo.net
            or send an activation request.
          </p>
        </div>
      </DialogWrapper>
    </div>
  )
}

export default UserClientsTable

