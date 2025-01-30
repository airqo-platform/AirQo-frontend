"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ActivateClientDialog, DeactivateClientDialog } from "@/components/clients/dialogs"
import { getClientsApi, activateUserClientApi } from "@/core/apis/analytics"
import { useToast } from "@/components/ui/use-toast"
import type { Client } from "@/app/types/clients"
import { Search, ArrowUpDown, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

const ITEMS_PER_PAGE = 8

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "Invalid Date"

  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays < 0) return "Expired"
  if (diffDays === 0) return "Expires today"
  if (diffDays === 1) return "Expires tomorrow"
  return `Expires in ${diffDays} days`
}


const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [activateDialogOpen, setActivateDialogOpen] = useState(false)
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [sortField, setSortField] = useState<keyof Client>("name")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const { toast } = useToast()

  const fetchClients = async () => {
    setLoading(true)
    try {
      const response = await getClientsApi()
      setClients(response.clients)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCopyClientId = (clientId: string) => {
    navigator.clipboard.writeText(clientId)
    toast({
      title: "Client ID Copied",
      description: "The client ID has been copied to your clipboard.",
    })
  }

  useEffect(() => {
    fetchClients()
  }, [])

  const handleActivateDeactivate = async (clientId: string, activate: boolean) => {
    try {
      await activateUserClientApi({ _id: clientId, isActive: activate })
      await fetchClients()
      toast({
        title: "Success",
        description: `Client ${activate ? "activated" : "deactivated"} successfully`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${activate ? "activate" : "deactivate"} client`,
        variant: "destructive",
      })
    } finally {
      setActivateDialogOpen(false)
      setDeactivateDialogOpen(false)
      setSelectedClient(null)
    }
  }

  const handleActivateClick = (client: Client) => {
    setSelectedClient(client)
    setActivateDialogOpen(true)
  }

  const handleDeactivateClick = (client: Client) => {
    setSelectedClient(client)
    setDeactivateDialogOpen(true)
  }

  const handleSort = (field: keyof Client) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const sortedClients = [...filteredClients].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortOrder === "asc" ? -1 : 1
    if (a[sortField] > b[sortField]) return sortOrder === "asc" ? 1 : -1
    return 0
  })

  const totalPages = Math.ceil(sortedClients.length / ITEMS_PER_PAGE)
  const paginatedClients = sortedClients.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const activatedClients = clients.filter((client) => client.isActive).length
  const deactivatedClients = clients.filter((client) => !client.isActive).length



  return (
    <div className=" py-2">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Client Management</h1>
            <Button onClick={fetchClients}>Refresh</Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-green-100 p-4 rounded-lg">
              <h2 className="text-md font-semibold">Activated Clients</h2>
              <p className="text-lg font-semibold">{activatedClients}</p>
            </div>
            <div className="bg-red-100 p-4 rounded-lg">
              <h2 className="text-md font-semibold">Deactivated Clients</h2>
              <p className="text-lg font-semibold">{deactivatedClients}</p>
            </div>

          </div>

          <div className="flex items-center gap-2 mb-4">
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
                <DropdownMenuItem onClick={() => handleSort("name")}>
                  Name {sortField === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSort("isActive")}>
                  Status {sortField === "isActive" && (sortOrder === "asc" ? "↑" : "↓")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[250px]">Client Name</TableHead>
                  <TableHead>User Email</TableHead>
                  <TableHead>Token Expiry</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedClients.map((client) => (
                  <TableRow key={client._id}>
                    <TableCell>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-muted-foreground">{client._id}</div>
                    </TableCell>
                    <TableCell>{client.user.email}</TableCell>
                    <TableCell>
                      {client.access_token?.expires 
                        ? formatDate(client.access_token.expires) 
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            client.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                      >
                        {client.isActive ? "Activated" : "Not Activated"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        onClick={() => (client.isActive ? handleDeactivateClick(client) : handleActivateClick(client))}
                      >
                        {client.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="ghost" onClick={() => handleCopyClientId(client._id)}>
                        Copy ID
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink onClick={() => setCurrentPage(page)} isActive={currentPage === page}>
                      {page}
                    </PaginationLink>
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

          <ActivateClientDialog
            open={activateDialogOpen}
            onOpenChange={setActivateDialogOpen}
            onConfirm={() => selectedClient && handleActivateDeactivate(selectedClient._id, true)}
            clientName={selectedClient?.name}
          />

          <DeactivateClientDialog
            open={deactivateDialogOpen}
            onOpenChange={setDeactivateDialogOpen}
            onConfirm={() => selectedClient && handleActivateDeactivate(selectedClient._id, false)}
            clientName={selectedClient?.name}
          />
        </>
      )}
    </div>
  )
}

export default ClientManagement

