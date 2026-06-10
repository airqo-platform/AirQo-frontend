/**
 * Authentication Service
 * Handles all authentication operations for the AirQo platform
 */

import { config } from '@/lib/config'

interface LoginCredentials {
  userName: string
  password: string
}

interface ApiResponse {
  success?: boolean
  message?: string
  token?: string
  user?: any
  _id?: string
  userName?: string
  email?: string
  [key: string]: any
}

interface ApiError {
  status: number
  message: string
  data?: any
}

// Helper to check if we're in browser
const isBrowser = () => !config.isServer

class AuthService {
  private readonly baseUrl: string
  private token: string | null = null
  private readonly TOKEN_KEY = 'authToken'
  private readonly USER_DATA_KEY = 'userData'
  private readonly TOKEN_COOKIE_NAME = 'token'
  private readonly TOKEN_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds
  
  constructor() {
    // Use centralized config for API URL
    this.baseUrl = config.airqoPlatformUrl
    
    // Restore token from storage if available
    if (isBrowser()) {
      this.token = this.getStoredToken()
    }
  }

  /**
   * Gets token from various storage locations
   */
  private getStoredToken(): string | null {
    if (!isBrowser()) {
      return null
    }

    // Check localStorage first
    const localToken = localStorage.getItem(this.TOKEN_KEY)
    if (localToken) return localToken

    // Check sessionStorage
    const sessionToken = sessionStorage.getItem(this.TOKEN_KEY)
    if (sessionToken) return sessionToken

    // Check cookies
    const cookieToken = this.getCookieValue(this.TOKEN_COOKIE_NAME)
    if (cookieToken) return cookieToken

    return null
  }

  /**
   * Gets cookie value by name
   */
  private getCookieValue(name: string): string | null {
    if (typeof document === 'undefined') return null
    
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    
    return null
  }

  /**
   * Handles API response and extracts data
   */
  private async handleResponse(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type')
    const isJson = contentType?.includes('application/json')
    
    // Parse response based on content type
    const data = isJson ? await response.json() : await response.text()

    // Handle non-successful responses
    if (!response.ok) {
      const error: ApiError = {
        status: response.status,
        message: isJson && data.message 
          ? data.message 
          : `Request failed with status ${response.status}`,
        data: data
      }
      throw error
    }

    return data
  }

  /**
   * Sets authentication cookie for middleware
   */
  private setAuthCookie(token: string): void {
    if (typeof document !== 'undefined') {
      const cookieString = `${this.TOKEN_COOKIE_NAME}=${token}; path=/; max-age=${this.TOKEN_MAX_AGE}; SameSite=Strict; Secure`
      document.cookie = cookieString
    }
  }

  /**
   * Removes authentication cookie
   */
  private removeAuthCookie(): void {
    if (typeof document !== 'undefined') {
      // Remove cookie by setting expiry in the past
      document.cookie = `${this.TOKEN_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure`
      
      // Also try without Secure flag in case of local development
      document.cookie = `${this.TOKEN_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict`
      
      // Try removing from all possible paths
      document.cookie = `${this.TOKEN_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      document.cookie = `${this.TOKEN_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    }
  }

  /**
   * Clears all authentication data from all storage locations
   */
  private clearAllAuthData(): void {
    if (!isBrowser()) return

    // Clear from localStorage
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.USER_DATA_KEY)
    
    // Clear from sessionStorage
    sessionStorage.removeItem(this.TOKEN_KEY)
    sessionStorage.removeItem(this.USER_DATA_KEY)
    
    // Clear any other auth-related items
    const keysToRemove: string[] = []
    
    // Check localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('auth') || key.includes('token') || key.includes('user'))) {
        keysToRemove.push(key)
      }
    }
    
    // Remove collected keys
    for (const key of keysToRemove) {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    }
    
    // Clear all auth-related cookies
    this.removeAuthCookie()
    
    // Clear the token from memory
    this.token = null
  }

  /**
   * Authenticates user with email and password
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse> {
    try {
      // Clear any existing auth data before login
      this.clearAllAuthData()
      
      // Use local API proxy to avoid CORS issues
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'same-origin'
      })

      const data = await this.handleResponse(response)
      
      // Store authentication data
      if (data.token) {
        this.token = data.token
        if (isBrowser()) {
          localStorage.setItem(this.TOKEN_KEY, data.token)
          sessionStorage.setItem(this.TOKEN_KEY, data.token)
          this.setAuthCookie(data.token)
        }
      }
      
      // Store user information
      if (data.user || data._id) {
        const userData = data.user || {
          _id: data._id,
          email: data.email || credentials.userName,
          userName: data.userName || credentials.userName
        }
        if (isBrowser()) {
          localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData))
          sessionStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData))
        }
      }

      return data
    } catch (error: any) {
      // Handle CORS errors specifically
      if (error.message?.includes('Failed to fetch')) {
        throw new Error('Unable to connect to the server. Please check your connection.')
      }
      
      throw new Error(error.message || 'Authentication failed. Please try again.')
    }
  }

  /**
   * Logs out the current user and clears all authentication data
   */
  logout(): void {
    this.clearAllAuthData()
    
    if (isBrowser() && !globalThis.location.pathname.includes('/login')) {
      globalThis.location.replace('/login')
    }
  }

  /**
   * Force logout - more aggressive clearing
   */
  forceLogout(): void {
    if (!isBrowser()) return
    
    this.clearAllAuthData()
    
    // Clear all cookies
    for (const c of document.cookie.split(";")) {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    }
    
    sessionStorage.clear()
    
    const authKeys = ['authToken', 'userData', 'token', 'user']
    for (const key of authKeys) {
      localStorage.removeItem(key)
    }
    
    if (!globalThis.location.pathname.includes('/login')) {
      globalThis.location.href = '/login'
    }
  }

  /**
   * Checks if user is currently authenticated
   */
  isAuthenticated(): boolean {
    if (!isBrowser()) {
      return false
    }

    const token = this.getStoredToken()
    
    if (!token) {
      return false
    }
    
    this.token = token
    
    try {
      if (this.isTokenExpired(token)) {
        this.clearAllAuthData()
        return false
      }
    } catch {
      // If we can't decode the token, assume it's valid
    }
    
    return true
  }

  /**
   * Checks if a JWT token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      
      if (payload.exp) {
        const expirationTime = payload.exp * 1000
        return Date.now() > expirationTime
      }
      
      return false
    } catch {
      return false
    }
  }

  /**
   * Retrieves stored user data
   */
  getUserData(): any {
    if (isBrowser()) {
      const localData = localStorage.getItem(this.USER_DATA_KEY)
      if (localData) {
        try {
          return JSON.parse(localData)
        } catch {
          localStorage.removeItem(this.USER_DATA_KEY)
        }
      }
      
      const sessionData = sessionStorage.getItem(this.USER_DATA_KEY)
      if (sessionData) {
        try {
          return JSON.parse(sessionData)
        } catch {
          sessionStorage.removeItem(this.USER_DATA_KEY)
        }
      }
    }
    return null
  }

  /**
   * Gets the current authentication token
   */
  getToken(): string | null {
    this.token = this.getStoredToken()
    return this.token
  }

  /**
   * Refreshes authentication status
   */
  refreshAuthStatus(): boolean {
    const isAuth = this.isAuthenticated()
    if (!isAuth) {
      this.clearAllAuthData()
    }
    return isAuth
  }
}

// Export singleton instance
const authService = new AuthService()

// Add event listener for storage changes (logout from other tabs)
if (!config.isServer) {
  globalThis.addEventListener('storage', (e: StorageEvent) => {
    if (e.key === 'authToken' && !e.newValue) {
      authService.logout()
    }
  })
}

export default authService
