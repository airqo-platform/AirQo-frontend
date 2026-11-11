"use client"

import { useMemo, useState } from "react"
import { useGroup } from "@/lib/group-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ExternalAppLink } from "@/components/onboarding/external-app-link"
import { useDiscoverOrganisations } from "@/hooks/use-discover-organisations"
import { APP_LINKS } from "@/lib/app-links"
import { trackEvent } from "@/lib/analytics"
import { mergeOrganisationOptions, type OrganisationOption } from "@/lib/organisations"
import { Loader2 } from "lucide-react"
import { AqLinkExternal01, AqSearchMd } from "@airqo/icons-react"

/**
 * Get the initial letter for the group badge avatar
 */
function getGroupInitial(grpTitle: string): string {
  return grpTitle.charAt(0).toUpperCase()
}

/** Organisation names are stored as slugs like "green_city", so show them with spaces. */
function formatOrganisationName(title: string): string {
  return title.replace(/[_-]/g, " ")
}

/**
 * GroupSelector — badge in the header bar that opens a centered modal listing the person's
 * organisations and, as in Nexus, the others they could join. Beacon only switches between
 * organisations: access is requested in Nexus, so those rows link out.
 */
export default function GroupSelector() {
  const { activeGroup, availableGroups, setActiveGroup, loading } = useGroup()
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const discovery = useDiscoverOrganisations(isOpen)

  const displayName = activeGroup ? formatOrganisationName(activeGroup).toUpperCase() : "ORGANISATION"

  const options = useMemo(
    () => mergeOrganisationOptions(availableGroups, discovery.data),
    [availableGroups, discovery.data]
  )

  const filteredOptions = searchTerm
    ? options.filter((option) => option.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : options

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) setSearchTerm("")
  }

  const handleSelect = (option: OrganisationOption) => {
    if (option.title !== activeGroup) {
      trackEvent("organization_switched", {
        member_organization_count: availableGroups.length,
        used_search: Boolean(searchTerm),
      })
    }
    setActiveGroup(option.title)
    handleOpenChange(false)
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-muted/50">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="text-sm text-muted-foreground">Loading...</span>
      </div>
    )
  }

  return (
    <>
      {/* Badge Button — shown in the header */}
      <button
        type="button"
        data-tour="organisation-switcher"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted hover:border-border/80 transition-all cursor-pointer shadow-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        title={activeGroup ? `Active organisation: ${activeGroup}` : "Switch organisation"}
        aria-label="Switch organisation"
      >
        {/* Group initial avatar */}
        <div className="h-6 w-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold transition-colors">
          {getGroupInitial(activeGroup || "O")}
        </div>

        {/* Group name */}
        <span className="text-sm font-semibold text-foreground tracking-wide hidden sm:inline-block">
          {displayName}
        </span>

        {/* Grid icon */}
        <svg
          className="h-4 w-4 text-muted-foreground"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      </button>

      {/* Centered Modal — lists the person's organisations and the others they could join */}
      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-[480px] rounded-xl border border-border bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-foreground">
              Switch organisation
            </DialogTitle>
            <DialogDescription>
              You&apos;re in {availableGroups.length}{" "}
              {availableGroups.length === 1 ? "organisation" : "organisations"}. Join others through Nexus.
            </DialogDescription>
          </DialogHeader>

          {/* Search */}
          {options.length > 3 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/60 border border-border">
              <AqSearchMd className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <input
                type="text"
                placeholder="Search organisations..."
                aria-label="Search organisations"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-sm text-foreground placeholder-muted-foreground outline-none w-full"
                autoFocus
              />
            </div>
          )}

          {/* Organisation List */}
          <div className="max-h-[320px] overflow-y-auto space-y-1">
            {filteredOptions.map((option) => {
              if (!option.isMember) {
                return (
                  <div key={option.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg">
                    <div className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 bg-muted text-muted-foreground">
                      {getGroupInitial(option.title)}
                    </div>
                    <div className="flex-1 min-w-0 text-sm font-medium text-foreground truncate uppercase">
                      {formatOrganisationName(option.title)}
                    </div>
                    <a
                      href={APP_LINKS.nexus}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() =>
                        trackEvent("app_link_opened", { destination: "nexus", source: "organisation_switcher_join" })
                      }
                      className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-md border border-primary/40 px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Request in Nexus
                      <AqLinkExternal01 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </div>
                )
              }

              const isActive = option.title === activeGroup
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => handleSelect(option)}
                  aria-current={isActive ? "true" : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                    isActive
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-muted border border-transparent"
                  }`}
                >
                  {/* Group avatar */}
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {getGroupInitial(option.title)}
                  </div>

                  {/* Group info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate uppercase text-foreground">
                      {formatOrganisationName(option.title)}
                    </div>
                    {option.roleName && (
                      <div className="text-xs text-muted-foreground truncate">{option.roleName}</div>
                    )}
                  </div>

                  <span
                    className={`flex-shrink-0 text-xs font-semibold ${
                      isActive ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {isActive ? "Current" : "Member"}
                  </span>
                </button>
              )
            })}

            {filteredOptions.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">No organisations found</div>
            )}
            {discovery.isLoading && (
              <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Loading organisations...
              </div>
            )}
            {discovery.isError && (
              <p className="p-4 text-center text-sm text-muted-foreground">
                We couldn&apos;t load other organisations here, but you can still find them in{" "}
                <a
                  href={APP_LINKS.nexus}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() =>
                    trackEvent("app_link_opened", { destination: "nexus", source: "organisation_switcher_error" })
                  }
                  className="font-medium text-primary hover:underline"
                >
                  Nexus
                </a>
                .
              </p>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
            <ExternalAppLink
              href={APP_LINKS.nexusRequestOrganisation}
              destination="nexus"
              source="organisation_switcher_request_new"
            >
              Request a new organisation
            </ExternalAppLink>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
