"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Token {
  id: string
  name: string
  ipAddress: string
  status: "Active" | "Inactive"
  created: string
  token: string
  expires: string
}

export default function ApiTokens() {
  const [tokens, setTokens] = useState<Token[]>([
    {
      id: "1",
      name: "Production API",
      ipAddress: "192.168.1.1",
      status: "Active",
      created: "2023-01-01",
      token: "abc123xyz789",
      expires: "2024-01-01",
    },
    {
      id: "2",
      name: "Development API",
      ipAddress: "192.168.1.2",
      status: "Active",
      created: "2023-02-01",
      token: "def456uvw890",
      expires: "2024-02-01",
    },
  ])

  const [newTokenName, setNewTokenName] = useState("")

  const handleCreateToken = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically send a request to your backend to create a new token
    const newToken: Token = {
      id: String(tokens.length + 1),
      name: newTokenName,
      ipAddress: "192.168.1." + (tokens.length + 1),
      status: "Active",
      created: new Date().toISOString().split("T")[0],
      token: Math.random().toString(36).substring(2, 15),
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    }
    setTokens([...tokens, newToken])
    setNewTokenName("")
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
            <TableHead>Client name</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Client Status</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Token</TableHead>
            <TableHead>Expires</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.map((token) => (
            <TableRow key={token.id}>
              <TableCell>{token.name}</TableCell>
              <TableCell>{token.ipAddress}</TableCell>
              <TableCell>{token.status}</TableCell>
              <TableCell>{token.created}</TableCell>
              <TableCell>{token.token}</TableCell>
              <TableCell>{token.expires}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

