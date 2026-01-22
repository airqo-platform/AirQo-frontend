"use client"

import Link from "next/link"
import { Home, Bell, Settings, Package, Layers, Box, ChevronLeft, ChevronRight, Wrench } from "lucide-react"
import { AqMonitor, AqAirQlouds } from '@airqo/icons-react'

interface SidebarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export default function Sidebar({ sidebarOpen, onToggleSidebar }: SidebarProps) {
  return (
    <div
      className={`bg-white text-gray-700 transition-all duration-300 flex-shrink-0 border border-gray-300 ${sidebarOpen ? "w-56" : "w-16"
        } flex flex-col ml-4 mt-20 mb-4 rounded-xl shadow-sm`}
    >

      <nav className="px-2 py-3 flex-1">
        <ul className="space-y-1">
          {/* <li>
            <Link
              href="/dashboard"
              className={`flex items-center rounded-md hover:bg-gray-100 transition-colors group relative ${
                sidebarOpen ? "px-3 py-2" : "p-2 justify-center"
              }`}
              title={!sidebarOpen ? "Overview" : ""}
            >
              <Home className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="ml-3 text-sm">Overview</span>}
              {!sidebarOpen && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Overview
                </span>
              )}
            </Link>
          </li> */}
          <li>
            <Link
              href="/dashboard/devices"
              className={`flex items-center rounded-md hover:bg-gray-100 transition-colors group relative ${sidebarOpen ? "px-3 py-2" : "p-2 justify-center"
                }`}
              title={!sidebarOpen ? "Devices" : ""}
            >
              <AqMonitor size={25} color="#374151" />
              {sidebarOpen && <span className="ml-3 text-sm">Devices</span>}
              {!sidebarOpen && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Devices
                </span>
              )}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/analytics"
              className={`flex items-center rounded-md hover:bg-gray-100 transition-colors group relative ${sidebarOpen ? "px-3 py-2" : "p-2 justify-center"
                }`}
              title={!sidebarOpen ? "AirQloud Uptime" : ""}
            >
              <AqAirQlouds size={25} color="#374151" />
              {sidebarOpen && <span className="ml-3 text-sm">AirQloud Uptime</span>}
              {!sidebarOpen && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  AirQloud Uptime
                </span>
              )}
            </Link>
          </li>
          {/* <li>
            <Link
              href="/dashboard/alerts"
              className={`flex items-center rounded-md hover:bg-gray-100 transition-colors group relative ${
                sidebarOpen ? "px-3 py-2" : "p-2 justify-center"
              }`}
              title={!sidebarOpen ? "Alerts" : ""}
            >
              <Bell className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="ml-3 text-sm">Alerts</span>}
              {!sidebarOpen && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Alerts
                </span>
              )}
            </Link>
          </li> */}
          <li>
            <Link
              href="/dashboard/firmware"
              className={`flex items-center rounded-md hover:bg-gray-100 transition-colors group relative ${sidebarOpen ? "px-3 py-2" : "p-2 justify-center"
                }`}
              title={!sidebarOpen ? "Firmware" : ""}
            >
              <Package className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="ml-3 text-sm">Firmware</span>}
              {!sidebarOpen && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Firmware
                </span>
              )}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/category"
              className={`flex items-center rounded-md hover:bg-gray-100 transition-colors group relative ${sidebarOpen ? "px-3 py-2" : "p-2 justify-center"
                }`}
              title={!sidebarOpen ? "Categories" : ""}
            >
              <Layers className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="ml-3 text-sm">Categories</span>}
              {!sidebarOpen && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Categories
                </span>
              )}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/stock"
              className={`flex items-center rounded-md hover:bg-gray-100 transition-colors group relative ${sidebarOpen ? "px-3 py-2" : "p-2 justify-center"
                }`}
              title={!sidebarOpen ? "Stock" : ""}
            >
              <Box className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="ml-3 text-sm">Stock</span>}
              {!sidebarOpen && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Stock
                </span>
              )}
            </Link>
          </li>
          <li>
            <Link
              href="/dashboard/maintenance"
              className={`flex items-center rounded-md hover:bg-gray-100 transition-colors group relative ${sidebarOpen ? "px-3 py-2" : "p-2 justify-center"
                }`}
              title={!sidebarOpen ? "Maintenance" : ""}
            >
              <Wrench className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="ml-3 text-sm">Maintenance</span>}
              {!sidebarOpen && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Maintenance
                </span>
              )}
            </Link>
          </li>

          {/* <li>
            <Link
              href="/dashboard/settings"
              className={`flex items-center rounded-md hover:bg-gray-100 transition-colors group relative ${
                sidebarOpen ? "px-3 py-2" : "p-2 justify-center"
              }`}
              title={!sidebarOpen ? "Settings" : ""}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="ml-3 text-sm">Settings</span>}
              {!sidebarOpen && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  Settings
                </span>
              )}
            </Link>
          </li> */}
        </ul>
      </nav>
    </div>
  )
}
