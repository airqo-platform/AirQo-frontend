import type { FC } from "react"

interface AirQualityIconProps {
  size?: number
  className?: string
}

export const GoodAirIcon: FC<AirQualityIconProps> = ({ size = 40, className = "" }) => (
  <div
    className={`relative rounded-full flex items-center justify-center ${className}`}
    style={{ width: size, height: size, backgroundColor: "#A8E05F" }}
  >
    <span className="text-white font-bold text-xs">Good</span>
  </div>
)

export const ModerateIcon: FC<AirQualityIconProps> = ({ size = 40, className = "" }) => (
  <div
    className={`relative rounded-full flex items-center justify-center ${className}`}
    style={{ width: size, height: size, backgroundColor: "#FDD64B" }}
  >
    <span className="text-white font-bold text-xs">Mod</span>
  </div>
)

export const UnhealthySGIcon: FC<AirQualityIconProps> = ({ size = 40, className = "" }) => (
  <div
    className={`relative rounded-full flex items-center justify-center ${className}`}
    style={{ width: size, height: size, backgroundColor: "#FF9B57" }}
  >
    <span className="text-white font-bold text-xs">USG</span>
  </div>
)

export const UnhealthyIcon: FC<AirQualityIconProps> = ({ size = 40, className = "" }) => (
  <div
    className={`relative rounded-full flex items-center justify-center ${className}`}
    style={{ width: size, height: size, backgroundColor: "#FE6A69" }}
  >
    <span className="text-white font-bold text-xs">Unhealthy</span>
  </div>
)

export const VeryUnhealthyIcon: FC<AirQualityIconProps> = ({ size = 40, className = "" }) => (
  <div
    className={`relative rounded-full flex items-center justify-center ${className}`}
    style={{ width: size, height: size, backgroundColor: "#A97ABC" }}
  >
    <span className="text-white font-bold text-xs">Very</span>
  </div>
)

export const HazardousIcon: FC<AirQualityIconProps> = ({ size = 40, className = "" }) => (
  <div
    className={`relative rounded-full flex items-center justify-center ${className}`}
    style={{ width: size, height: size, backgroundColor: "#A87383" }}
  >
    <span className="text-white font-bold text-xs">Hazard</span>
  </div>
)

export const InvalidIcon: FC<AirQualityIconProps> = ({ size = 40, className = "" }) => (
  <div
    className={`relative rounded-full flex items-center justify-center ${className}`}
    style={{ width: size, height: size, backgroundColor: "#CCCCCC" }}
  >
    <span className="text-white font-bold text-xs">N/A</span>
  </div>
)
