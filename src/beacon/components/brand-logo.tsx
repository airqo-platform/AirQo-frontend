import { beaconConfig } from "@/beacon.config"
import { cn } from "@/lib/utils"

interface BrandLogoProps {
  /** Height in pixels; the width follows the image. */
  size?: number
  className?: string
}

/** The organisation's logo from beacon.config.ts (`org.logo`, a path under public/). */
export function BrandLogo({ size = 32, className }: Readonly<BrandLogoProps>) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- any image type, no loader needed
    <img
      src={beaconConfig.org.logo}
      alt={`${beaconConfig.org.name} logo`}
      height={size}
      style={{ height: size, width: "auto" }}
      className={cn("shrink-0", className)}
    />
  )
}

export default BrandLogo
