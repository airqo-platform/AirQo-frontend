"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

interface UserSearchProps {
  searchTerm: string
  setSearchTerm: (value: string) => void
}

export function UserSearch({ searchTerm, setSearchTerm }: UserSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search users..."
        className="pl-8 w-full md:w-[250px] lg:w-[300px]"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  )
}
