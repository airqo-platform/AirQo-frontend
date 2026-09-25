"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Menu, X } from "lucide-react"
import Image from "next/image"
import { useSiteSettings } from "@/hooks/use-site-settings"

export default function Navigation({ ...props }) {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const settings = useSiteSettings()
  const navItems = settings.pages
    .filter((page) => page.enabled)
    .map((page) => ({ name: page.name, href: page.path }))

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        <Link href="/" className="text-blue-600 text-xl font-semibold">
           <Image src="/images/logo_rus4my.webp" alt="AirQo" width={50} height={50} />
        </Link>

        {/* Mobile Menu Button */}
        <button className="text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white lg:hidden" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8" {...props}>
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "relative py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white",
                pathname === item.href &&
                  "text-gray-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-blue-600 dark:text-white dark:after:bg-blue-400",
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <nav className="border-t border-gray-200 bg-white shadow-md dark:border-slate-800 dark:bg-slate-950 lg:hidden">
          <div className="container mx-auto px-4 py-4 space-y-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "block text-base font-medium text-gray-600 hover:text-gray-900 dark:text-slate-300 dark:hover:text-white",
                  pathname === item.href && "text-gray-900 dark:text-white",
                )}
                onClick={() => setIsOpen(false)}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  )
}
