import { NextRequest, NextResponse } from 'next/server'
import { config } from '@/lib/config'

export const dynamic = 'force-dynamic'

// Same platform as the sign-in (lib/auth.ts): a token only works on the platform that issued it.
const AIRQO_API_BASE_URL = config.airqoPlatformUrl
const API_VERSION = config.apiVersion

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header is required' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('user_id')
    const groupIds = searchParams.get('group_ids')
    const cohortIds = searchParams.get('cohort_ids')

    if (!userId) {
      return NextResponse.json(
        { success: false, message: 'user_id is required' },
        { status: 400 }
      )
    }

    // Build the query parameters
    const params = new URLSearchParams({ user_id: userId })
    if (groupIds) params.append('group_ids', groupIds)
    if (cohortIds) params.append('cohort_ids', cohortIds)

    // Build URL to platform api
    const url = `${AIRQO_API_BASE_URL}/api/${API_VERSION}/devices/my-devices?${params.toString()}`

    // Format auth header: Ensure it has JWT prefix if it's a raw JWT token
    let formattedAuthHeader = authHeader
    if (!formattedAuthHeader.startsWith('JWT ') && !formattedAuthHeader.startsWith('Bearer ')) {
      formattedAuthHeader = `JWT ${formattedAuthHeader}`
    }

    const platformResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: formattedAuthHeader,
      },
    })

    if (!platformResponse.ok) {
      const errorText = await platformResponse.text()
      console.error('Platform API error for my-devices:', errorText.substring(0, 200))
      return NextResponse.json(
        { success: false, message: 'Failed to fetch personal devices from platform' },
        { status: platformResponse.status }
      )
    }

    const data = await platformResponse.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error('My devices fetch error:', error)
    return NextResponse.json(
      { success: false, message: 'My devices service temporarily unavailable' },
      { status: 503 }
    )
  }
}
