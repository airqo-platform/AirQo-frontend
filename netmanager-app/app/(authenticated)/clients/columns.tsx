"use client"

import type { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Client } from "@/app/types/clients"

interface ColumnProps {
  onActivate: (client: Client) => void
  onDeactivate: (client: Client) => void
}

export const columns = ({ onActivate, onDeactivate }: ColumnProps): ColumnDef<Client>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Client Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
  },
  {
    accessorKey: "_id",
    header: "Client ID",
  },
  {
    accessorKey: "user.email",
    header: "User Email",
  },
  {
    accessorKey: "access_token.expires",
    header: "Token Expiry",
    cell: ({ row }) => {
      const accessToken = row.original.access_token
      if (!accessToken || !accessToken.expires) return "N/A"
      const expires = new Date(accessToken.expires)
      if (isNaN(expires.getTime())) return "Invalid Date"

      const now = new Date()
      const diffTime = expires.getTime() - now.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      if (diffDays < 0) return "Expired"
      if (diffDays === 0) return "Expires today"
      if (diffDays === 1) return "Expires tomorrow"
      return `Expires in ${diffDays} days`
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive")
      return (
        <div className={`px-2 py-1 rounded-full text-white text-center ${isActive ? "bg-green-500" : "bg-red-500"}`}>
          {isActive ? "Activated" : "Not Activated"}
        </div>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const client = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(client._id)}>
              Copy client ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => (client.isActive ? onDeactivate(client) : onActivate(client))}>
              {client.isActive ? "Deactivate" : "Activate"}
            </DropdownMenuItem>
            <DropdownMenuItem>View client details</DropdownMenuItem>
            <DropdownMenuItem>Update client information</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

