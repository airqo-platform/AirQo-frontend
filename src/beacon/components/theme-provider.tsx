'use client'

import * as React from 'react'
import {
  ThemeData,
  initializeTheme,
  applyThemeImmediately,
  getStoredTheme,
} from '@/lib/theme-utils'
import { themeService } from '@/services/theme-service'
import { useSession } from 'next-auth/react'

const GROUP_THEME_STORAGE_PREFIX = 'theme_group_'

interface ThemeProviderProps {
  children: React.ReactNode
  activeGroupId?: string
}

export function ThemeProvider({ children, activeGroupId }: ThemeProviderProps) {
  const { data: session, status } = useSession()
  const userId = (session?.user as any)?.id || (session?.user as any)?._id
  const token = (session as any)?.accessToken || (session?.user as any)?.accessToken

  // 1. Ensure theme is initialized immediately on client mount
  React.useEffect(() => {
    initializeTheme(activeGroupId)
  }, [activeGroupId])

  // 2. Cross-tab & Cross-app live theme synchronization
  // Listens for localStorage updates made in Nexus (or another tab on same origin)
  React.useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (event: StorageEvent) => {
      if (!event.key || !event.newValue) return

      const isGroupTheme = event.key.startsWith(GROUP_THEME_STORAGE_PREFIX)
      const isGeneralTheme = event.key === 'theme'

      if (!isGroupTheme && !isGeneralTheme) return

      const currentGroupKey = activeGroupId
        ? `${GROUP_THEME_STORAGE_PREFIX}${activeGroupId}`
        : null
      const isCurrentGroupTheme = isGroupTheme && event.key === currentGroupKey
      const isFallbackTheme = isGeneralTheme && !currentGroupKey

      if (!isCurrentGroupTheme && !isFallbackTheme) return

      try {
        const themeData: ThemeData = JSON.parse(event.newValue)
        applyThemeImmediately(themeData)
      } catch (error) {
        console.debug('Failed to parse updated theme from storage event:', error)
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [activeGroupId])

  // 3. Fetch latest theme from backend API when authenticated or group changes
  React.useEffect(() => {
    if (status === 'authenticated') {
      themeService
        .fetchUserTheme(activeGroupId, userId, token)
        .catch((err) => {
          console.debug('Could not fetch theme from API:', err)
        })
    }
  }, [activeGroupId, userId, token, status])

  return <>{children}</>
}

export default ThemeProvider
