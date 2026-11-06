"use client"

import { AqServer03 } from "@airqo/icons-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ExternalAppLink } from "@/components/onboarding/external-app-link"
import { APP_LINKS } from "@/lib/app-links"

const COPY = {
  my: {
    title: "You don't have any devices yet",
    description:
      "Devices are added in Vertex, AirQo's device management app. Add yours there and Beacon will track its health here.",
    href: APP_LINKS.vertexMyDevices,
    steps: [
      "Open My Devices in Vertex",
      "Claim an AirQo device or import your own",
      "Come back here to track its health",
    ],
  },
  org: {
    title: "This organisation doesn't have any devices yet",
    description:
      "Devices are added in Vertex, AirQo's device management app. Add them there and Beacon will track their health here.",
    href: APP_LINKS.vertexOrgDevices,
    steps: [
      "Open Devices in Vertex",
      "Claim or import your organisation's devices",
      "Come back here to track their health",
    ],
  },
} as const

interface NoDevicesPromptProps {
  scope: keyof typeof COPY
  onRefresh: () => void
  isRefreshing?: boolean
}

/** Replaces an empty device list: Beacon only monitors devices, so this points to where they're added. */
export function NoDevicesPrompt({ scope, onRefresh, isRefreshing = false }: Readonly<NoDevicesPromptProps>) {
  const { title, description, href, steps } = COPY[scope]

  return (
    <Card className="flex flex-col items-center gap-4 px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
        <AqServer03 className="h-7 w-7" aria-hidden="true" />
      </span>
      <div className="max-w-xl space-y-2">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <ExternalAppLink href={href} size="lg">
          Add a device in Vertex
        </ExternalAppLink>
        <Button variant="outline" size="lg" onClick={onRefresh} disabled={isRefreshing}>
          {isRefreshing ? "Refreshing..." : "I've added one, refresh"}
        </Button>
      </div>
      <ol className="mt-6 grid w-full max-w-3xl gap-4 border-t border-border pt-6 text-left sm:grid-cols-3">
        {steps.map((step, index) => (
          <li key={step} className="flex gap-3">
            <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">
              {index + 1}
            </span>
            <span className="text-sm text-foreground">{step}</span>
          </li>
        ))}
      </ol>
    </Card>
  )
}
