
import { config } from '@/lib/config'

export async function GET() {
    try {
      // Connect to your FastAPI backend
      const response = await fetch(`${config.apiUrl}/valid-device-locations`, {
        cache: 'no-store'
      })
  
      if (!response.ok) {
        console.error(`API Error: ${response.status} ${response.statusText}`)
        return Response.json({ error: 'Error fetching device data' }, { status: response.status })
      }
  
      const data = await response.json()
      console.log(`API returned ${data.length} devices`)
      return Response.json(data)
    } catch (error) {
      console.error('Error fetching device locations:', error)
      return Response.json({ error: 'Failed to fetch device data' }, { status: 500 })
    }
  }