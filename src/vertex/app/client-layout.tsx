"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import { Toaster } from "@/components/ui/sonner"
import Providers from "./providers"
import { cn } from "@/lib/utils"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isNetworkMap = pathname === "/network-map"

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(inter.className, "min-h-screen bg-background antialiased", isNetworkMap && "overflow-hidden")}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  )
}
