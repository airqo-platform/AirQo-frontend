"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useAppSelector, useAppDispatch } from "@/core/redux/hooks"
import { fetchOrganizations } from "@/lib/slices/organizationsSlice"

export function OrganizationList() {
  const dispatch = useAppDispatch()
  const organizations = useAppSelector((state) => state.organizations.list)
  const status = useAppSelector((state) => state.organizations.status)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchOrganizations())
    }
  }, [status, dispatch])

  const filteredOrganizations = organizations.filter((org) => org.name.toLowerCase().includes(searchTerm.toLowerCase()))

  if (status === "loading") {
    return <div>Loading...</div>
  }

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
            <TableRow key={org.id}>
              <TableCell>{org.name}</TableCell>
              <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Button asChild variant="link">
                  <Link href={`/organizations/${org.id}`}>View Details</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

