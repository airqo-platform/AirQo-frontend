import type { ReactNode } from "react"
import { AqLinkExternal01 } from "@airqo/icons-react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { trackEvent } from "@/lib/analytics"

interface ExternalAppLinkProps {
  href: string
  /** For analytics: the app it opens ("vertex", "nexus") and the prompt it's in. */
  destination: string
  source: string
  children: ReactNode
  variant?: ButtonProps["variant"]
  size?: ButtonProps["size"]
  className?: string
}

/** A button-styled link to another AirQo app. Opens in a new tab, so Beacon stays where it was. */
export function ExternalAppLink({
  href,
  destination,
  source,
  children,
  variant,
  size,
  className,
}: Readonly<ExternalAppLinkProps>) {
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => trackEvent("app_link_opened", { destination, source })}
      >
        {children}
        <AqLinkExternal01 className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">(opens in a new tab)</span>
      </a>
    </Button>
  )
}
