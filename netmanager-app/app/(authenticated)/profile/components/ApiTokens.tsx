"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import type { Client } from "@/app/types/clients"
import { getUserClientsApi } from "@/core/apis/settings"
import { useAppSelector } from "@/core/redux/hooks"

export default function ApiTokens() {
  const [clients, setClients] = useState<Client[]>([])
  const [newTokenName, setNewTokenName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const currentuser = useAppSelector((state) => state.user.userDetails)

  useEffect(() => {
    const fetchClients = async () => {
      try {
        setIsLoading(true)
        const userID = currentuser?._id || ""
        const response = await getUserClientsApi(userID)
        setClients(response)
      } catch (error) {
        console.error("Failed to fetch clients:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [currentuser?._id])

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle token creation logic here if needed
    console.log("Create token feature is not implemented yet.")
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">API Access Tokens</h2>
      <p className="text-sm text-gray-500">
        Clients are used to generate API tokens that can be used to authenticate with the API. Your secret API tokens
        are listed below. Remember to keep them secure and never share them.
      </p>
      <form onSubmit={handleCreateToken} className="space-y-4">
        <div className="flex space-x-2">
          <div className="flex-grow">
            <Label htmlFor="new-token-name" className="sr-only">
              New Token Name
            </Label>
            <Input
              id="new-token-name"
              placeholder="Enter new token name"
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              required
            />
          </div>
          <Button type="submit">Create New Token</Button>
        </div>
      </form>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Client Name</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Client Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Token</TableHead>
            <TableHead>Expires</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <TableRow key={index}>
                {Array.from({ length: 6 }).map((_, cellIndex) => (
                  <TableCell key={cellIndex}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : clients.length > 0 ? (
            clients.map((client) => (
              <TableRow key={client._id}>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.ip_addresses.length > 0 ? client.ip_addresses[0] : "N/A"}</TableCell>
                <TableCell>{client.isActive ? "Active" : "Inactive"}</TableCell>
                <TableCell>{new Date(client.access_token.createdAt).toLocaleDateString()}</TableCell>
                <TableCell>{client.access_token.token}</TableCell>
                <TableCell>
                  {client.access_token.expires
                    ? new Date(client.access_token.expires).toLocaleDateString()
                    : "No Expiration"}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No clients found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

