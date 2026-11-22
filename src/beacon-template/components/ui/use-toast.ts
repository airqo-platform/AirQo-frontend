"use client"

// The mounted <Toaster> listens to the store in @/hooks/use-toast, so this path has to share it:
// a second copy of the store would hold toasts that never reach the screen.
export { reducer, toast, useToast } from "@/hooks/use-toast"
