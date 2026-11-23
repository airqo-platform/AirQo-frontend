"use client"

import { useState, type ReactNode } from "react"
import { LogOut, Loader2 } from "lucide-react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "../ui/dropdown-menu"
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar"
import { LogoutDialog } from "./logout-dialog"

/**
 * Avatar button at the right end of the top bar: name and email, any extra items,
 * then Log out behind a confirmation.
 *
 * Copied from the profile dropdown in Beacon's components/dashboard/top-nav.tsx.
 * Nexus has header/components/profile-dropdown.tsx (adds "My profile") and Vertex
 * draws it inside layout/topbar.tsx (adds the dark mode toggle); pass those as
 * `children`.
 */
export type ProfileMenuUser = {
  first_name?: string
  last_name?: string
  firstName?: string
  lastName?: string
  email?: string
  userName?: string
  profilePicture?: string
  image?: string
}

export function getUserInitials(user: ProfileMenuUser | null): string {
  if (!user) return "U"
  const firstInitial = (user.first_name || user.firstName)?.[0]?.toUpperCase() || ""
  const lastInitial = (user.last_name || user.lastName)?.[0]?.toUpperCase() || ""
  if (firstInitial || lastInitial) {
    return firstInitial + lastInitial
  }
  const emailOrUsername = user.email || user.userName
  return emailOrUsername?.[0]?.toUpperCase() || "U"
}

export function getDisplayName(user: ProfileMenuUser | null): string {
  if (!user) return "User"
  const firstName = user.first_name || user.firstName || ""
  const lastName = user.last_name || user.lastName || ""
  const fullName = `${firstName} ${lastName}`.trim()
  return fullName || user.email || user.userName || "User"
}

interface ProfileMenuProps {
  user: ProfileMenuUser | null
  loading?: boolean
  isLoggingOut?: boolean
  onLogout: () => void
  /** Extra items between the name and Log out, e.g. "My profile" or a theme toggle. */
  children?: ReactNode
}

export function ProfileMenu({
  user,
  loading = false,
  isLoggingOut = false,
  onLogout,
  children,
}: Readonly<ProfileMenuProps>) {
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const userInitials = getUserInitials(user)
  const displayName = getDisplayName(user)

  const handleLogoutClick = () => {
    setShowLogoutDialog(false)
    onLogout()
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center cursor-pointer hover:bg-transparent p-0 m-0 focus-visible:ring-0 rounded-full"
            title={`AirQo Account\n${displayName}`}
            aria-label="AirQo Account"
          >
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.profilePicture || user?.image || ""} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : userInitials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-56 px-2 bg-card border border-border shadow-lg rounded-xl mt-1 z-[9999]"
        >
          <div className="flex items-center p-2">
            <Avatar className="h-9 w-9">
              <AvatarImage src={user?.profilePicture || user?.image || ""} alt={displayName} />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col space-y-0.5 pl-2 truncate">
              <p className="text-sm font-semibold leading-none text-foreground truncate">
                {displayName.length > 18 ? displayName.slice(0, 18) + "..." : displayName}
              </p>
              <p className="text-xs leading-none text-muted-foreground truncate">
                {user?.email || user?.userName}
              </p>
            </div>
          </div>

          <DropdownMenuSeparator className="bg-border" />

          {children && (
            <>
              {children}
              <DropdownMenuSeparator className="bg-border" />
            </>
          )}

          <DropdownMenuItem
            className="flex items-center text-red-600 focus:text-red-600 cursor-pointer p-2 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={() => setShowLogoutDialog(true)}
          >
            <LogOut className="h-4 w-4 mr-2" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <LogoutDialog
        open={showLogoutDialog}
        onOpenChange={setShowLogoutDialog}
        isLoggingOut={isLoggingOut}
        onConfirm={handleLogoutClick}
      />
    </>
  )
}
