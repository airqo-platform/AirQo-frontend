"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { DataTable } from "./data-table"
import { columns } from "./columns"
import { ActivateClientDialog, DeactivateClientDialog } from "./dialogs"
import { getClientsApi, activateUserClientApi } from "@/core/apis/analytics"
import { useToast } from "@/components/ui/use-toast"
import type { Client } from "@/app/types/clients"

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

  const activatedClients = clients.filter((client) => client.isActive).length
  const deactivatedClients = clients.filter((client) => !client.isActive).length

  const handleActivateClick = (client: Client) => {
    setSelectedClient(client)
    setActivateDialogOpen(true)
  }

  const handleDeactivateClick = (client: Client) => {
    setSelectedClient(client)
    setDeactivateDialogOpen(true)
  }

  const nearestExpiringToken = clients
    .filter((client) => client.access_token && client.access_token.expires)
    .filter((client) => {
      const expiryDate = new Date(client.access_token.expires)
      return expiryDate > new Date()
    })
    .sort((a, b) => {
      const dateA = new Date(a.access_token.expires).getTime()
      const dateB = new Date(b.access_token.expires).getTime()
      return dateA - dateB
    })[0]

  const nearestExpiryDate = nearestExpiringToken
    ? formatDate(nearestExpiringToken.access_token.expires)
    : "No upcoming expiries"

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Client Management</h1>
        <Button onClick={fetchClients}>Refresh</Button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Activated Clients</h2>
          <p className="text-3xl font-bold">{activatedClients}</p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Deactivated Clients</h2>
          <p className="text-3xl font-bold">{deactivatedClients}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <h2 className="text-lg font-semibold">Nearest Token Expiry</h2>
          <p className="text-xl font-bold">
            {nearestExpiringToken ? formatDate(nearestExpiringToken.access_token.expires) : "No upcoming expiries"}
          </p>
          <p className="text-sm">{nearestExpiringToken?.name || "N/A"}</p>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={clients}
        onActivate={handleActivateClick}
        onDeactivate={handleDeactivateClick}
      />

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
    </div>
  )
}

export default ClientManagement;

