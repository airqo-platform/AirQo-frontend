import { config, buildPlatformApiUrl } from '@/lib/config'
import authService from './api-service'
import {
  ThemeData,
  applyThemeImmediately,
  saveThemeToStorage,
  getStoredTheme,
} from '@/lib/theme-utils'

class ThemeService {
  /**
   * Helper to build request headers with valid Authorization token
   */
  private getHeaders(customToken?: string | null): HeadersInit {
    const rawToken = customToken || authService.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    if (rawToken) {
      // Ensure token is cleanly formatted as 'JWT <token>' or 'Bearer <token>' without double prefixes
      const cleanToken = rawToken.trim()
      if (cleanToken.startsWith('JWT ') || cleanToken.startsWith('Bearer ')) {
        headers['Authorization'] = cleanToken
      } else {
        headers['Authorization'] = `JWT ${cleanToken}`
      }
    }

    return headers
  }

  /**
   * Fetch user theme from AirQo Platform API with fallbacks
   */
  async fetchUserTheme(
    groupId?: string | null,
    userId?: string | null,
    tokenOverride?: string | null
  ): Promise<ThemeData | null> {
    try {
      const headers = this.getHeaders(tokenOverride)

      // If no token is available at all, return stored local theme
      if (!('Authorization' in headers)) {
        return getStoredTheme(groupId || undefined)
      }

      // Build endpoints to try in priority order:
      // 1. Group-specific user preference (e.g. /users/preferences/theme/user/:userId/group/:groupId)
      // 2. User general theme (/users/theme)
      // 3. Organization group theme (/users/preferences/theme/organization/group/:groupId)
      const endpointsToTry: string[] = []

      if (userId && groupId && groupId !== 'all') {
        endpointsToTry.push(
          buildPlatformApiUrl(`users/preferences/theme/user/${userId}/group/${groupId}`)
        )
      }

      endpointsToTry.push(buildPlatformApiUrl('users/theme'))

      if (groupId && groupId !== 'all') {
        endpointsToTry.push(
          buildPlatformApiUrl(`users/preferences/theme/organization/group/${groupId}`)
        )
      }

      for (const url of endpointsToTry) {
        try {
          const response = await fetch(url, {
            method: 'GET',
            headers,
          })

          if (!response.ok) {
            continue
          }

          const data = await response.json()
          const payload =
            data?.data?.theme ||
            data?.data ||
            data?.theme ||
            data?.preferences?.theme ||
            data

          if (payload && (payload.primaryColor || payload.color || payload.mode)) {
            const themeData: ThemeData = {
              mode: payload.mode || 'light',
              primaryColor: payload.primaryColor || payload.color || '#145FFF',
              interfaceStyle: payload.interfaceStyle || 'default',
              contentLayout: payload.contentLayout || 'wide',
            }

            // Save to localStorage & immediately apply to DOM
            saveThemeToStorage(themeData, groupId || undefined)
            applyThemeImmediately(themeData)
            return themeData
          }
        } catch (endpointError) {
          console.debug(`Theme fetch failed for endpoint ${url}:`, endpointError)
        }
      }

      // If API calls did not return a theme, fallback to local storage
      const fallback = getStoredTheme(groupId || undefined)
      if (fallback) {
        applyThemeImmediately(fallback)
      }
      return fallback
    } catch (error) {
      console.debug('Error in fetchUserTheme:', error)
      return getStoredTheme(groupId || undefined)
    }
  }

  /**
   * Update theme via AirQo backend Platform API
   */
  async updateUserTheme(
    themeData: Partial<ThemeData>,
    groupId?: string | null,
    tokenOverride?: string | null
  ): Promise<boolean> {
    try {
      const headers = this.getHeaders(tokenOverride)
      if (!('Authorization' in headers)) {
        return false
      }

      let url = buildPlatformApiUrl('users/theme')
      if (groupId && groupId !== 'all') {
        url = buildPlatformApiUrl(`users/preferences/theme/organization/group/${groupId}`)
      }

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(
          groupId && groupId !== 'all' ? { theme: themeData } : themeData
        ),
      })

      return response.ok
    } catch (error) {
      console.error('Failed to update theme via API:', error)
      return false
    }
  }
}

export const themeService = new ThemeService()
export default themeService
