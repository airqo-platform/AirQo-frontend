"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useGroups } from "@/core/hooks/useGroups"

export function OrganizationList() {
  // const dispatch = useAppDispatch()
  const [searchTerm, setSearchTerm] = useState("")
  const { groups, isLoading, error } = useGroups()

  const filteredOrganizations = groups.filter((org) => org.grp_title.toLowerCase().includes(searchTerm.toLowerCase()))
  const status = isLoading ? "loading" : error ? "failed" : "success"

  if (status === "failed") {
    return <div>Error loading organizations. Please try again.</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <Input
          className="max-w-sm"
          placeholder="Search organizations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button asChild>
          <Link href="/admin/organization-settings/create">Create Organization</Link>
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOrganizations.map((org) => (
            <TableRow key={org._id}>
              <TableCell>{org.grp_title}</TableCell>
              <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button asChild variant="link">
                  <Link href={`/organizations/${org._id}`}>View Details</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

