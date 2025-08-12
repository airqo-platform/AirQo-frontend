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

class AuthService {
  private baseUrl: string
  private token: string | null = null
  private readonly TOKEN_KEY = 'authToken'
  private readonly USER_DATA_KEY = 'userData'
  private readonly TOKEN_COOKIE_NAME = 'token'
  private readonly TOKEN_MAX_AGE = 7 * 24 * 60 * 60 // 7 days in seconds
  
  constructor() {
    // Initialize base URL from environment or use default
    this.baseUrl = process.env.NEXT_PUBLIC_AIRQO_API_BASE_URL || 'https://platform.airqo.net'
    
    // Restore token from storage if available
    if (typeof window !== 'undefined') {
      this.token = this.getStoredToken()
    }
  }

  /**
   * Gets token from various storage locations
   */
  private getStoredToken(): string | null {
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
    const isJson = contentType && contentType.includes('application/json')
    
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
      // Set cookie with all security flags
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
    if (typeof window === 'undefined') return

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
    keysToRemove.forEach(key => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    })
    
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
        credentials: 'same-origin' // Include cookies in the request
      })

      const data = await this.handleResponse(response)
      
      // Store authentication data
      if (data.token) {
        this.token = data.token
        if (typeof window !== 'undefined') {
          // Store in both localStorage and sessionStorage for redundancy
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
        if (typeof window !== 'undefined') {
          localStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData))
          sessionStorage.setItem(this.USER_DATA_KEY, JSON.stringify(userData))
        }
      }

      return data
    } catch (error: any) {
      // Handle CORS errors specifically
      if (error.message?.includes('Failed to fetch')) {
        throw {
          message: 'Unable to connect to the server. Please check your connection.',
          status: 0,
          ...error
        }
      }
      
      throw {
        message: error.message || 'Authentication failed. Please try again.',
        ...error
      }
    }
  }

  /**
   * Logs out the current user and clears all authentication data
   */
  logout(): void {
    // Clear all authentication data
    this.clearAllAuthData()
    
    // Only redirect if we're not already on the login page
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
      // Use replace to prevent going back to authenticated pages
      window.location.replace('/login')
    }
  }

  /**
   * Force logout - more aggressive clearing
   */
  forceLogout(): void {
    if (typeof window === 'undefined') return
    
    // Clear all storage
    this.clearAllAuthData()
    
    // Clear all cookies (not just auth-related)
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    
    // Clear session storage completely
    sessionStorage.clear()
    
    // Clear specific localStorage items but preserve non-auth data
    const authKeys = ['authToken', 'userData', 'token', 'user']
    authKeys.forEach(key => localStorage.removeItem(key))
    
    // Only force redirect if not already on login page
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login'
    }
  }

  /**
   * Checks if user is currently authenticated
   */
  isAuthenticated(): boolean {
    // Check multiple sources for token
    const token = this.getStoredToken()
    
    if (!token) {
      return false
    }
    
    // Update memory token if found in storage
    this.token = token
    
    // Optional: Check if token is expired (if JWT)
    try {
      if (this.isTokenExpired(token)) {
        this.clearAllAuthData()
        return false
      }
    } catch {
      // If we can't decode the token, assume it's valid
      // The server will reject if invalid
    }
    
    return true
  }

  /**
   * Checks if a JWT token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      // Decode JWT without verifying signature (client-side check only)
      const payload = JSON.parse(atob(token.split('.')[1]))
      
      // Check expiration
      if (payload.exp) {
        const expirationTime = payload.exp * 1000 // Convert to milliseconds
        return Date.now() > expirationTime
      }
      
      return false
    } catch {
      // If we can't decode, assume not expired
      return false
    }
  }

  /**
   * Retrieves stored user data
   */
  getUserData(): any {
    if (typeof window !== 'undefined') {
      // Try localStorage first
      const localData = localStorage.getItem(this.USER_DATA_KEY)
      if (localData) {
        try {
          return JSON.parse(localData)
        } catch {
          // Invalid JSON, remove it
          localStorage.removeItem(this.USER_DATA_KEY)
        }
      }
      
      // Try sessionStorage
      const sessionData = sessionStorage.getItem(this.USER_DATA_KEY)
      if (sessionData) {
        try {
          return JSON.parse(sessionData)
        } catch {
          // Invalid JSON, remove it
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
    // Always get fresh token from storage
    this.token = this.getStoredToken()
    return this.token
  }

  /**
   * Updates the API base URL
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url
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


const authService = new AuthService()


if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'authToken' && !e.newValue) {
     
      authService.logout()
    }
  })
}

export default authService