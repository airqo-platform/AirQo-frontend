"use client"

import Link from "next/link"
import { Home, Package, Layers, Box, ChevronRight, Wrench, FlaskConical, FileText, MessageSquare } from "lucide-react"
import { AqMonitor, AqAirQlouds } from '@/components/icons'
import { useGroup } from '@/lib/group-context'
import { openFeedbackDialog } from '@/components/features/feedback/feedback-dialog'
import { FeedbackLauncher } from '@/components/features/feedback/feedback-launcher'

interface SidebarProps {
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export default function Sidebar({ sidebarOpen, onToggleSidebar }: Readonly<SidebarProps>) {
  const { activeGroup, isActiveGroupAdmin, hasPermission } = useGroup()
  const isAirqoGroup = activeGroup?.toLowerCase() === 'airqo'

  // DEVICE_MAINTAIN permission (or group admin role) is required to see org devices, performance analysis, collocation, maintenance, reports
  const canMaintainDevices = hasPermission('DEVICE_MAINTAIN') || isActiveGroupAdmin

  const canViewOverview = isAirqoGroup && canMaintainDevices
  const canViewDevices = true // Devices tab is accessible
  const canViewAnalytics = canMaintainDevices
  const canViewAirqoAdminTools = isAirqoGroup && canMaintainDevices
  const canViewMaintenance = canMaintainDevices
  const canViewReports = canMaintainDevices

  return (
    <div
      className={`bg-white text-gray-700 transition-all duration-300 flex-shrink-0 border border-gray-300 ${sidebarOpen ? "w-56" : "w-16"
        } flex flex-col ml-4 mt-20 mb-4 rounded-xl shadow-sm`}
    >

      <nav className="px-2 py-3 flex-1">
        <ul className="space-y-1">
          {canViewOverview && (
            <li>
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
            </li>
          )}
          {canViewDevices && (
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
          )}
          {canViewAnalytics && (
            <li className="relative group/analytics">
            <div
              className={`flex items-center rounded-md hover:bg-gray-100 transition-colors cursor-pointer ${sidebarOpen ? "px-3 py-2" : "p-2 justify-center"
                }`}
              title={!sidebarOpen ? "Performance Analysis" : ""}
            >
              <AqAirQlouds size={25} color="#374151" />
              {sidebarOpen && (
                <>
                  <span className="ml-3 text-sm flex-1 text-left">Performance Analysis</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
              {!sidebarOpen && (
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover/analytics:opacity-100 pointer-events-none transition-opacity z-50">
                  Performance Analysis
                </span>
              )}
            </div>
            <div className="absolute left-full top-0 ml-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover/analytics:opacity-100 group-hover/analytics:visible transition-all duration-150 z-50">
              <Link
                href="/dashboard/analytics?analysis=cohorts"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cohort analysis
              </Link>
              <Link
                href="/dashboard/analytics?analysis=grids"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Grid analysis
              </Link>
            </div>
          </li>
          )}

          {canViewAirqoAdminTools && (
            <>
              {/* Collocation - hover flyout menu */}
              <li className="relative group/collocation">
                <div
                  className={`flex items-center rounded-md hover:bg-gray-100 transition-colors cursor-pointer ${sidebarOpen ? "px-3 py-2" : "p-2 justify-center"
                    }`}
                >
                  <FlaskConical className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="ml-3 text-sm flex-1 text-left">Collocation</span>
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </div>
                {/* Flyout submenu */}
                <div className="absolute left-full top-0 ml-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover/collocation:opacity-100 group-hover/collocation:visible transition-all duration-150 z-50">
                  <Link
                    href="/dashboard/collocation/inlab"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Inlab collocation
                  </Link>
                  <Link
                    href="/dashboard/collocation/site"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Site collocation
                  </Link>
                </div>
              </li>

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
            </>
          )}

          {canViewMaintenance && (
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
          )}

          {canViewReports && (
            <li>
              <Link
                href="/dashboard/reports"
                className={`flex items-center rounded-md hover:bg-gray-100 transition-colors group relative ${sidebarOpen ? "px-3 py-2" : "p-2 justify-center"
                  }`}
                title={!sidebarOpen ? "Reports" : ""}
              >
                <FileText className="h-5 w-5 flex-shrink-0" />
                {sidebarOpen && <span className="ml-3 text-sm">Reports</span>}
                {!sidebarOpen && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    Reports
                  </span>
                )}
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Bottom Section */}
      <div className="px-2 py-3 border-t border-gray-200">
        <button
          onClick={openFeedbackDialog}
          className={`w-full flex items-center rounded-md hover:bg-gray-100 transition-colors group relative ${
            sidebarOpen ? "px-3 py-2" : "p-2 justify-center"
          }`}
          title={!sidebarOpen ? "Feedback" : ""}
        >
          <MessageSquare className="h-5 w-5 flex-shrink-0" />
          {sidebarOpen && <span className="ml-3 text-sm">Feedback</span>}
          {!sidebarOpen && (
            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
              Feedback
            </span>
          )}
        </button>
      </div>

      <FeedbackLauncher />
    </div>
  )
}
