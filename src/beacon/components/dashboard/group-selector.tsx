"use client"

import { useState } from "react"
import { useGroup, type UserGroup } from "@/lib/group-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CheckCircle2, Search, Loader2 } from "lucide-react"

/**
 * Get the initial letter for the group badge avatar
 */
function getGroupInitial(grpTitle: string): string {
  return grpTitle.charAt(0).toUpperCase()
}

/**
 * GroupSelector — badge in the header bar that opens a centered modal listing
 * all available groups. Mirrors the "A AIRQO 🔲" pattern from the AirQo
 * platform screenshot.
 */
export default function GroupSelector() {
  const { activeGroup, availableGroups, setActiveGroup, loading } = useGroup()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const displayName = activeGroup?.toUpperCase() ?? "GROUP"

  const filteredGroups = searchTerm
    ? availableGroups.filter((g) =>
        g.grp_title.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : availableGroups

  const handleSelect = (group: UserGroup) => {
    setActiveGroup(group.grp_title)
    setIsOpen(false)
    setSearchTerm("")
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-gray-50">
        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
        <span className="text-sm text-gray-400">Loading...</span>
      </div>
    )
  }

  return (
    <>
      {/* Badge Button — shown in the header */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all cursor-pointer shadow-sm"
        title={`Active group: ${activeGroup}`}
      >
        {/* Group initial avatar */}
        <div className="h-6 w-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
          {getGroupInitial(activeGroup || "G")}
        </div>

        {/* Group name */}
        <span className="text-sm font-semibold text-gray-700 tracking-wide hidden sm:inline-block">
          {displayName}
        </span>

        {/* Grid icon (matches the screenshot) */}
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>

      {/* Centered Modal — lists all available groups */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Switch Group
            </DialogTitle>
          </DialogHeader>

          {/* Search */}
          {availableGroups.length > 3 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 mb-2">
              <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-sm text-gray-700 placeholder-gray-400 outline-none w-full"
                autoFocus
              />
            </div>
          )}

          {/* Group List */}
          <div className="max-h-[320px] overflow-y-auto space-y-1">
            {filteredGroups.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-400">
                No groups found
              </div>
            ) : (
              filteredGroups.map((group) => {
                const isActive = group.grp_title === activeGroup
                return (
                  <button
                    key={group._id}
                    onClick={() => handleSelect(group)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors ${
                      isActive
                        ? "bg-blue-50 border border-blue-200"
                        : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    {/* Group avatar / profile picture */}
                    {group.grp_profile_picture ? (
                      <img
                        src={group.grp_profile_picture}
                        alt={group.grp_title}
                        className="h-9 w-9 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div
                        className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {getGroupInitial(group.grp_title)}
                      </div>
                    )}

                    {/* Group info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-sm font-medium truncate ${
                          isActive ? "text-blue-700" : "text-gray-800"
                        }`}
                      >
                        {group.grp_title}
                      </div>
                      {group.role?.role_name && (
                        <div className="text-xs text-gray-400 truncate">
                          {group.role.role_name
                            .replaceAll("_", " ")
                            .toLowerCase()}
                        </div>
                      )}
                    </div>

                    {/* Active indicator */}
                    {isActive && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    )}
                  </button>
                )
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
