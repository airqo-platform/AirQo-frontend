"use client"

import { useState, type ReactNode } from "react"
import { Loader2 } from "lucide-react"
import { AqLinkExternal01, AqSearchMd } from "@airqo/icons-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { Button } from "../ui/button"

export interface OrganisationOption {
  id: string
  title: string
  /** Only members can switch to it. Everyone else gets the join action. */
  isMember: boolean
  roleName?: string
}

function getGroupInitial(grpTitle: string): string {
  return grpTitle.charAt(0).toUpperCase()
}

/** Organisation names are stored as slugs like "green_city", so show them with spaces. */
function formatOrganisationName(title: string): string {
  return title.replace(/[_-]/g, " ")
}

/**
 * Badge in the top bar that opens a modal listing the person's organisations and
 * the others they could join.
 *
 * Markup copied from Beacon's components/dashboard/group-selector.tsx, which was
 * built to match Nexus's header/components/organization-selector.tsx. Vertex's
 * version is features/org-picker/organization-picker.tsx + organization-modal.tsx.
 * Where Beacon read its group context and discovery hook, this takes props.
 */
interface OrganisationSwitcherProps {
  /** Title of the active organisation. */
  activeOrganisation: string | null
  /** Memberships first, then organisations the person could join. */
  options: OrganisationOption[]
  /** Memberships are still loading: shows the loading pill instead of the badge. */
  loading?: boolean
  /** Organisations to join are still loading. */
  discoveryLoading?: boolean
  /** Organisations to join failed to load. */
  discoveryError?: boolean
  onSelect: (option: OrganisationOption) => void
  /** Told when the modal opens, so discovery can be fetched only then. */
  onOpenChange?: (open: boolean) => void
  /** Where people join or request access to an organisation (Nexus). */
  joinHref: string
  /** Replaces the default "Request in Nexus" link on a non-member row. */
  renderJoinAction?: (option: OrganisationOption) => ReactNode
  /** Replaces the line under the title. */
  description?: ReactNode
  /** Extra footer action beside Close, e.g. "Request a new organisation". */
  footerAction?: ReactNode
}

export function OrganisationSwitcher({
  activeOrganisation,
  options,
  loading = false,
  discoveryLoading = false,
  discoveryError = false,
  onSelect,
  onOpenChange,
  joinHref,
  renderJoinAction,
  description,
  footerAction,
}: Readonly<OrganisationSwitcherProps>) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const memberCount = options.filter((option) => option.isMember).length
  const displayName = activeOrganisation
    ? formatOrganisationName(activeOrganisation).toUpperCase()
    : "ORGANISATION"

  const filteredOptions = searchTerm
    ? options.filter((option) => option.title.toLowerCase().includes(searchTerm.toLowerCase()))
    : options

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) setSearchTerm("")
    onOpenChange?.(open)
  }

  const handleSelect = (option: OrganisationOption) => {
    onSelect(option)
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
        onClick={() => handleOpenChange(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-card hover:bg-muted hover:border-border/80 transition-all cursor-pointer shadow-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        title={activeOrganisation ? `Active organisation: ${activeOrganisation}` : "Switch organisation"}
        aria-label="Switch organisation"
      >
        {/* Group initial avatar */}
        <div className="h-6 w-6 rounded-md bg-primary/10 text-primary flex items-center justify-center text-xs font-bold transition-colors">
          {getGroupInitial(activeOrganisation || "O")}
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
              {description ?? (
                <>
                  You&apos;re in {memberCount} {memberCount === 1 ? "organisation" : "organisations"}.
                  Join others through Nexus.
                </>
              )}
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
                    {renderJoinAction ? (
                      renderJoinAction(option)
                    ) : (
                      <a
                        href={joinHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-md border border-primary/40 px-2.5 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        Request in Nexus
                        <AqLinkExternal01 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    )}
                  </div>
                )
              }

              const isActive = option.title === activeOrganisation
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
            {discoveryLoading && (
              <div className="flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Loading organisations...
              </div>
            )}
            {discoveryError && (
              <p className="p-4 text-center text-sm text-muted-foreground">
                We couldn&apos;t load other organisations here, but you can still find them in{" "}
                <a
                  href={joinHref}
                  target="_blank"
                  rel="noopener noreferrer"
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
            {footerAction}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
