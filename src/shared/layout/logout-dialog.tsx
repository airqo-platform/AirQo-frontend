"use client"

import { Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"

/**
 * Confirmation before logging out.
 *
 * Copied from Beacon's components/dashboard/top-nav.tsx. Nexus has
 * header/components/logout-confirmation-dialog.tsx (amber, "Log out") and Vertex
 * builds one with ReusableDialog in layout/topbar.tsx (red, "Sign out of your
 * AirQo account?"). The wording differs in all three; pass `title` and
 * `description` to settle on one.
 */
interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isLoggingOut?: boolean
  title?: string
  description?: string
}

export function LogoutDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoggingOut = false,
  title = "Are you sure you want to logout?",
  description = "You will be redirected to the login page and will need to sign in again to access your account.",
}: Readonly<LogoutDialogProps>) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-xl">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoggingOut} className="rounded-lg">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoggingOut}
            className="rounded-lg bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoggingOut ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging out...
              </>
            ) : (
              "Logout"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
