"use client"

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

interface DeviceModel3DWrapperProps {
  onModelLoaded?: () => void
  onModelFailed?: () => void
}

// Dynamically import the 3D component with SSR disabled
const DeviceModel3DInner = dynamic(
  () => import('./device-model-3d-inner'),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-300 via-blue-400 to-blue-500">
        <Loader2 className="h-16 w-16 text-white animate-spin mb-4" />
        <div className="text-white text-xl font-semibold">Loading 3D Experience...</div>
        <div className="text-blue-100 text-sm mt-2">Preparing interactive device model</div>
      </div>
    ),
  }
)

/**
 * Wrapper component that safely loads the 3D model component
 */
export default function DeviceModel3DWrapper({ onModelLoaded, onModelFailed }: Readonly<DeviceModel3DWrapperProps>) {
  return <DeviceModel3DInner onModelLoaded={onModelLoaded} onModelFailed={onModelFailed} />
}
