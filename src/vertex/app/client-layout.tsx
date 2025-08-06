"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { Toaster } from "@/components/ui/sonner"
import Providers from "./providers"
import { cn } from "@/lib/utils"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isNetworkMap = pathname === "/network-map"

  return (
      <body
      className={cn("min-h-screen bg-background antialiased", isNetworkMap && "overflow-hidden")}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
  )
}
