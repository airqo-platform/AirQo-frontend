/**
 * API Route: /api/auth/user
 * Proxies user profile requests to AirQo Platform API.
 * Decodes the JWT to extract user_id, then fetches the full user profile
 * (including groups) from the platform.
 */
import { NextRequest, NextResponse } from 'next/server'

const getApiBaseUrl = () => {
  return (
    process.env.AIRQO_STAGING_API_BASE_URL ||
    process.env.NEXT_PUBLIC_AIRQO_STAGING_API_BASE_URL ||
    process.env.AIRQO_API_BASE_URL ||
    process.env.NEXT_PUBLIC_AIRQO_API_BASE_URL ||
    'https://staging-platform.airqo.net'
  )
}

const AIRQO_API_BASE_URL = getApiBaseUrl()
const API_VERSION = process.env.AIRQO_API_VERSION || 'v2'

/**
 * Decode a JWT payload without verification (the platform already verifies tokens).
 */
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    // Strip "JWT " or "Bearer " prefix if present
    const rawToken = token.replace(/^(JWT|Bearer)\s+/i, '')
    const parts = rawToken.split('.')
    if (parts.length !== 3) return null

    const payload = parts[1]
    const decoded = Buffer.from(payload, 'base64url').toString('utf8')
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

function getUserIdFromPayload(payload: Record<string, any>): string | null {
  return payload._id || payload.id || payload.user_id || payload.userId || payload.sub || null
}

/**
 * GET /api/auth/user
 * Returns the full user profile including groups from the AirQo Platform API.
 */
export async function GET(request: NextRequest) {
  try {
    // Get the Authorization header
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header is required' },
        { status: 401 }
      )
    }

    // Decode JWT to extract user_id
    const payload = decodeJwtPayload(authHeader)
    const userId = payload ? getUserIdFromPayload(payload) : null
    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'Invalid token: could not extract user ID' },
        { status: 401 }
      )
    }

    // Fetch user profile from AirQo Platform API
    const userApiUrl = `${AIRQO_API_BASE_URL}/api/${API_VERSION}/users/${userId}`

    const platformResponse = await fetch(userApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: authHeader,
      },
    })

    if (!platformResponse.ok) {
      const errorText = await platformResponse.text()
      console.error('Platform API error:', errorText.substring(0, 200))
      return NextResponse.json(
        { success: false, message: 'Failed to fetch user profile from platform' },
        { status: platformResponse.status }
      )
    }

    const data = await platformResponse.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('User profile fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'User profile service temporarily unavailable' },
      { status: 503 }
    )
  }
}
