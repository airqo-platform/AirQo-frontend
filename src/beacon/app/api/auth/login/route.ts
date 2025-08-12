/**
 * API Route: /api/auth/login
 * Proxies authentication requests to AirQo API to avoid CORS issues
 */
import { NextRequest, NextResponse } from 'next/server'

const AIRQO_API_BASE_URL = process.env.AIRQO_API_BASE_URL || process.env.NEXT_PUBLIC_AIRQO_API_BASE_URL || 'https://platform.airqo.net'
const API_VERSION = process.env.AIRQO_API_VERSION || 'v2'
const LOGIN_ENDPOINT = process.env.LOGIN_ENDPOINT || 'users/loginUser'
const AIRQO_API_URL = `${AIRQO_API_BASE_URL}/api/${API_VERSION}/${LOGIN_ENDPOINT}`

/**
 * POST /api/auth/login
 * Handles user authentication requests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    if (!body.userName || !body.password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Email and password are required'
        },
        { status: 400 }
      )
    }

    // Forward request to AirQo API
    const airqoResponse = await fetch(AIRQO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    // Parse response
    const responseText = await airqoResponse.text()
    let data
    
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      // Handle non-JSON responses
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid response from authentication server'
        },
        { status: 502 }
      )
    }

    // Return response with appropriate status
    return NextResponse.json(data, {
      status: airqoResponse.status
    })
    
  } catch (error: any) {
    // Handle network or other errors
    console.error('Authentication error:', error)
    
    return NextResponse.json(
      {
        success: false,
        message: 'Authentication service temporarily unavailable'
      },
      { status: 503 }
    )
  }
}

/**
 * GET /api/auth/login
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'Authentication API',
    endpoint: '/api/auth/login',
    environment: process.env.NODE_ENV || 'development',
    apiUrl: AIRQO_API_URL
  })
}