'use client'

import { useState, useEffect } from 'react'
import { getDetectedPlatform, getIsElectron, type DetectedPlatform } from '@/core/utils/platform'

export type { DetectedPlatform }

export interface PlatformInfo {
  platform: DetectedPlatform
  isElectron: boolean
}

export function useDetectedPlatform(): PlatformInfo {
  const [info, setInfo] = useState<PlatformInfo>({ platform: 'other', isElectron: false })

  useEffect(() => {
    setInfo({ platform: getDetectedPlatform(), isElectron: getIsElectron() })
  }, [])

  return info
}
