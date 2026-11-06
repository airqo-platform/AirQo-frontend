"use client"

import Link from "next/link"
import { useSession } from "next-auth/react"
import {
  AqArrowRight,
  AqBuilding07,
  AqCheckCircle,
  AqLock01,
  AqPlayCircle,
  AqServer03,
} from "@airqo/icons-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { DeviceSummaryCards } from "@/components/devices/device-summary-cards"
import { getHomeFeatures, type HomeFeature } from "@/components/home/home-features"
import { ExternalAppLink } from "@/components/onboarding/external-app-link"
import { useTour } from "@/components/tour/tour-provider"
import { useDeviceOverview } from "@/hooks/use-device-overview"
import { useNavigationAccess } from "@/hooks/use-navigation-access"
import { useRecentlyVisited } from "@/hooks/use-recently-visited"
import { APP_LINKS } from "@/lib/app-links"
import { useGroup } from "@/lib/group-context"
import { getDevicesHome, isRouteAccessible } from "@/lib/navigation"

const MAX_RECENT_PAGES = 3

function SectionTitle({ id, children }: Readonly<{ id: string; children: React.ReactNode }>) {
  return (
    <h2 id={id} className="text-lg font-semibold text-foreground">
      {children}
    </h2>
  )
}

function FeatureCard({
  feature,
  title,
  lockedLabel,
}: Readonly<{ feature: HomeFeature; title: string; lockedLabel: string }>) {
  const Icon = feature.icon

  if (!feature.available) {
    return (
      <div className="flex items-start gap-4 rounded-lg border border-dashed border-border p-5">
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">{title}</span>
          <span className="mt-1 block text-sm text-muted-foreground">{feature.description}</span>
          <span className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <AqLock01 className="h-3.5 w-3.5" aria-hidden="true" />
            {lockedLabel}
          </span>
        </span>
      </div>
    )
  }

  return (
    <Card className="transition-shadow hover:shadow-md">
      <Link
        href={feature.href}
        className="group flex h-full items-start gap-4 rounded-lg p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-foreground">{title}</span>
          <span className="mt-1 block text-sm text-muted-foreground">{feature.description}</span>
        </span>
        <AqArrowRight
          className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </Card>
  )
}

/** First visit, or no devices yet: what to do next, then what Beacon can do once it's done. */
function SetupLayout({
  firstName,
  organisationNames,
  deviceListName,
  deviceLink,
  features,
  lockedLabel,
  onStartTour,
}: Readonly<{
  firstName: string
  organisationNames: string[]
  deviceListName: string
  deviceLink: string
  features: HomeFeature[]
  lockedLabel: string
  onStartTour: () => void
}>) {
  const hasOrganisation = organisationNames.length > 0

  return (
    <div className="space-y-8" data-tour="home-content">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Welcome, {firstName}</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Set up Beacon</h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Beacon tracks how your devices are doing and what needs fixing. It fills up once you have a device or
          an organisation.
        </p>
      </header>

      <section aria-labelledby="home-setup-title" className="space-y-3" data-tour="home-setup">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <SectionTitle id="home-setup-title">Get set up</SectionTitle>
          <span className="text-xs text-muted-foreground">{hasOrganisation ? "1 of 2 done" : "0 of 2 done"}</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="flex flex-col gap-3 p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <AqServer03 className="h-5 w-5" aria-hidden="true" />
            </span>
            <h3 className="text-base font-semibold text-foreground">Add your first device</h3>
            <p className="flex-1 text-sm text-muted-foreground">
              Claim an AirQo device or import your own in Vertex. It then appears under {deviceListName} here.
            </p>
            <ExternalAppLink href={deviceLink} className="self-start">
              Add a device in Vertex
            </ExternalAppLink>
          </Card>

          <Card className="flex flex-col gap-3 p-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              {hasOrganisation ? (
                <AqCheckCircle className="h-5 w-5" aria-hidden="true" />
              ) : (
                <AqBuilding07 className="h-5 w-5" aria-hidden="true" />
              )}
            </span>
            <h3 className="text-base font-semibold text-foreground">Join your organisation</h3>
            {hasOrganisation ? (
              <p className="flex-1 text-sm text-muted-foreground">
                You&apos;re in{" "}
                {organisationNames.length === 1
                  ? organisationNames[0].toUpperCase()
                  : `${organisationNames.length} organisations`}
                . Move between them with Switch organisation at the top of the page.
              </p>
            ) : (
              <>
                <p className="flex-1 text-sm text-muted-foreground">
                  Ask to join in Nexus, or request a new organisation. Once you&apos;re approved, switch to it here
                  to see its devices, sites and reports.
                </p>
                <ExternalAppLink href={APP_LINKS.nexus} variant="outline" className="self-start">
                  Find it in Nexus
                </ExternalAppLink>
              </>
            )}
          </Card>
        </div>
      </section>

      <section aria-labelledby="home-features-title" className="space-y-3">
        <SectionTitle id="home-features-title">What you can do in Beacon</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} title={feature.title} lockedLabel={lockedLabel} />
          ))}
        </div>
      </section>

      <Button variant="link" className="h-auto gap-2 p-0" onClick={onStartTour}>
        <AqPlayCircle className="h-4 w-4" aria-hidden="true" />
        Take the tour
      </Button>
    </div>
  )
}

/** Someone with devices: how they're doing, where they left off and where to go next. */
function ReturningLayout({
  firstName,
  overview,
  devicesHref,
  recentPages,
  features,
  lockedLabel,
  onStartTour,
  vertexHref,
}: Readonly<{
  firstName: string
  overview: ReturnType<typeof useDeviceOverview>
  devicesHref: string
  recentPages: Array<{ label: string; href: string }>
  features: HomeFeature[]
  lockedLabel: string
  onStartTour: () => void
  vertexHref: string
}>) {
  return (
    <div className="space-y-8" data-tour="home-content">
      <header className="space-y-2">
        <p className="text-sm text-muted-foreground">Welcome back, {firstName}</p>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">What would you like to look at?</h1>
      </header>

      <section aria-labelledby="home-overview-title" className="space-y-3" data-tour="home-overview">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <SectionTitle id="home-overview-title">Your devices right now</SectionTitle>
          <Link href={devicesHref} className="text-sm font-medium text-primary hover:underline">
            View all devices
          </Link>
        </div>
        {overview.data ? (
          <DeviceSummaryCards counts={overview.data} />
        ) : (
          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm text-foreground">We couldn&apos;t load your device counts.</p>
            <Button variant="outline" size="sm" onClick={() => overview.refetch()} disabled={overview.isFetching}>
              {overview.isFetching ? "Trying again..." : "Try again"}
            </Button>
          </Card>
        )}
      </section>

      {recentPages.length > 0 && (
        <section aria-labelledby="home-recent-title" className="space-y-3">
          <SectionTitle id="home-recent-title">Continue where you left off</SectionTitle>
          <Card
            className={`grid divide-y divide-border overflow-hidden sm:divide-x sm:divide-y-0 ${
              recentPages.length === 3 ? "sm:grid-cols-3" : recentPages.length === 2 ? "sm:grid-cols-2" : ""
            }`}
          >
            {recentPages.map((page, index) => (
              <Link
                key={page.href}
                href={page.href}
                className={`group flex items-center justify-between gap-3 p-4 text-sm font-medium text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring ${
                  index === 0 ? "bg-primary/[0.04] hover:bg-primary/[0.08]" : "hover:bg-muted"
                }`}
              >
                {page.label}
                <AqArrowRight
                  className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </Card>
        </section>
      )}

      <section aria-labelledby="home-jump-title" className="space-y-3">
        <SectionTitle id="home-jump-title">Jump right in</SectionTitle>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} title={feature.action} lockedLabel={lockedLabel} />
          ))}
        </div>
      </section>

      <nav aria-label="More options" className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium">
        <Button variant="link" className="h-auto gap-2 p-0" onClick={onStartTour}>
          <AqPlayCircle className="h-4 w-4" aria-hidden="true" />
          Take the tour
        </Button>
        <a href={vertexHref} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          Add devices in Vertex
        </a>
        <a
          href={APP_LINKS.nexusRequestOrganisation}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline"
        >
          Request a new organisation
        </a>
      </nav>
    </div>
  )
}

function HomeSkeleton() {
  return (
    <div className="space-y-8" role="status" aria-label="Loading your home page">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-80 max-w-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-28 rounded-lg" />
        ))}
      </div>
    </div>
  )
}

export function HomePage() {
  const { data: session } = useSession()
  const { availableGroups, loading: groupLoading } = useGroup()
  const access = useNavigationAccess()
  const overview = useDeviceOverview()
  const { visitedPages } = useRecentlyVisited()
  const { startTour } = useTour()

  // Account names are stored as entered, so "paul" still greets as "Paul"
  const firstName = (session?.user?.firstName || "there").replace(/(^|\s)\S/g, (start) => start.toUpperCase())

  if (groupLoading || (!overview.data && !overview.isError)) return <HomeSkeleton />

  const organisationNames = availableGroups
    .map((group) => group.grp_title)
    .filter((title) => title?.toLowerCase() !== "airqo")
  const features = getHomeFeatures(access)
  const lockedLabel = organisationNames.length > 0 ? "Switch organisation to use this" : "Needs an organisation"
  const deviceLink = access.isPersonalContext ? APP_LINKS.vertexMyDevices : APP_LINKS.vertexOrgDevices

  // A failed count says nothing about whether they have devices, so it never reads as "no devices"
  if (overview.data?.total === 0) {
    return (
      <SetupLayout
        firstName={firstName}
        organisationNames={organisationNames}
        deviceListName={access.showMyDevices ? "My Devices" : "Devices"}
        deviceLink={deviceLink}
        features={features}
        lockedLabel={lockedLabel}
        onStartTour={startTour}
      />
    )
  }

  return (
    <ReturningLayout
      firstName={firstName}
      overview={overview}
      devicesHref={getDevicesHome(access)}
      recentPages={visitedPages
        .filter((page) => isRouteAccessible(page.href, access))
        .slice(0, MAX_RECENT_PAGES)}
      features={features}
      lockedLabel={lockedLabel}
      onStartTour={startTour}
      vertexHref={deviceLink}
    />
  )
}
