'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { usePostHog } from 'posthog-js/react';
import {
  AqArrowRight,
  AqDownload01,
  AqGlobe05,
  AqLightbulb02,
  AqMagicWand01,
  AqPlayCircle,
  AqPresentationChart02,
  AqTrophy01,
  AqUpload01,
} from '@airqo/icons-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import ReusableDialog from '@/shared/components/ui/dialog';
import VideoModal from '@/modules/user-checklist/components/VideoModal';
import { useAiAssistantContext } from '@/modules/ai/context/ai-assistant-provider';
import { useEnvironmentAwareUrl } from '@/shared/hooks';
import {
  getAirQualityColor,
  getAirQualityIcon,
  mapAqiCategoryToLevel,
} from '@/shared/utils/airQuality';
import { useHomeExperience } from './hooks/useHomeExperience';
import type {
  HomeDemoMode,
  HomeExperienceItem,
  HomeLocationUpdate,
} from './types';

const HOME_DEMO_ENABLED = process.env.NEXT_PUBLIC_HOME_DEMO_ENABLED === 'true';

const OUTCOME_ACTIONS = [
  {
    id: 'compare-places',
    title: 'Compare places',
    description: 'Review current readings from several locations side-by-side.',
    href: '/user/air-quality/analytics?view=comparison&homeStart=compare-places',
    icon: AqPresentationChart02,
  },
  {
    id: 'analyze-trends',
    title: 'Analyze trends',
    description:
      'Build and save charts for the pollutants and periods you need.',
    href: '/user/air-quality/analytics?view=trends&homeStart=analyze-trends',
    icon: AqPresentationChart02,
  },
  {
    id: 'explore-location',
    title: 'Explore a location',
    description: 'See current conditions, forecasts, and health guidance.',
    href: '/user/map?homeStart=explore-location',
    icon: AqGlobe05,
  },
  {
    id: 'visualize-data',
    title: 'Visualize my data',
    description: 'Upload a file and turn it into export-ready charts or maps.',
    href: '/user/data-visualizer?homeStart=visualize-data',
    icon: AqUpload01,
  },
  {
    id: 'export-data',
    title: 'Export data',
    description: 'Configure and preview AirQo data for your own analysis.',
    href: '/user/data-export?homeStart=export-data',
    icon: AqDownload01,
  },
  {
    id: 'view-rankings',
    title: 'Compare cities and countries',
    description:
      'Explore live and historical air-quality rankings across Africa.',
    href: '/user/air-quality/rankings?homeStart=view-rankings',
    icon: AqTrophy01,
  },
] as const;

const READINGS_HREF = '/user/air-quality/analytics?view=comparison';

const HOME_HINTS = [
  {
    text: 'Compare a few places in one table.',
    href: READINGS_HREF,
  },
  {
    text: 'Build a chart for the places you care about.',
    href: '/user/air-quality/analytics?view=trends',
  },
  {
    text: 'See which cities are cleanest across Africa.',
    href: '/user/air-quality/rankings',
  },
  {
    text: 'Export data for your own analysis.',
    href: '/user/data-export',
  },
  {
    text: 'Turn a spreadsheet into a chart or map.',
    href: '/user/data-visualizer',
  },
] as const;

const RotatingHint = ({ onSelect }: { onSelect: (href: string) => void }) => {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!media || media.matches) return;

    let fadeTimer = 0;
    const interval = window.setInterval(() => {
      setVisible(false);
      fadeTimer = window.setTimeout(() => {
        setIndex(current => (current + 1) % HOME_HINTS.length);
        setVisible(true);
      }, 220);
    }, 5600);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(fadeTimer);
    };
  }, []);

  const hint = HOME_HINTS[index];

  return (
    <div className="relative flex h-full min-h-28 flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        <AqLightbulb02 className="h-4 w-4" />
        Try this in Nexus
      </div>
      <p
        data-testid="home-hint"
        className={`relative mb-0 text-base font-medium text-foreground transition-opacity duration-300 motion-reduce:transition-none ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={() => onSelect(hint.href)}
          className="group inline-flex items-center gap-2 rounded-sm text-left underline-offset-4 hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {hint.text}
          <AqArrowRight className="h-4 w-4 shrink-0 transition-transform motion-reduce:transition-none group-hover:translate-x-0.5" />
        </button>
      </p>
    </div>
  );
};

const parseDemoMode = (value: string | null): HomeDemoMode | undefined => {
  if (!HOME_DEMO_ENABLED) return undefined;
  return value === 'new' ||
    value === 'returning' ||
    value === 'loading' ||
    value === 'error'
    ? value
    : undefined;
};

const formatRelativeTime = (value?: string): string | null => {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return null;
  const elapsedMinutes = Math.max(
    1,
    Math.round((Date.now() - timestamp) / 60_000)
  );
  if (elapsedMinutes < 60) return `${elapsedMinutes}m ago`;
  const hours = Math.round(elapsedMinutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
};

const ContinueIcon = ({ item }: { item: HomeExperienceItem }) => {
  const Icon =
    item.iconName === 'visualize' ? AqUpload01 : AqPresentationChart02;
  return <Icon className="h-5 w-5" />;
};

const PlaceUpdateCard = ({
  location,
  onOpen,
}: {
  location: HomeLocationUpdate;
  onOpen: () => void;
}) => {
  const level = mapAqiCategoryToLevel(location.aqiCategory ?? undefined);
  const hasReading = location.aqiIndex !== null && level !== 'no-value';
  const StatusIcon = hasReading ? getAirQualityIcon(level) : AqGlobe05;
  const statusColor = hasReading ? getAirQualityColor(level) : undefined;

  return (
    <Card
      className="flex h-full flex-col overflow-hidden border-t-[3px]"
      style={statusColor ? { borderTopColor: statusColor } : undefined}
      data-testid="home-place-update"
    >
      <div className="flex flex-1 items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="mb-0 truncate font-medium text-foreground">
            {location.name}
          </p>
          <p className="mb-0 mt-1 text-xs text-muted-foreground">
            {formatRelativeTime(location.measuredAt) || 'Saved place'}
          </p>
        </div>
        <span
          className="shrink-0 text-muted-foreground"
          style={statusColor ? { color: statusColor } : undefined}
        >
          <StatusIcon className="h-7 w-7" />
        </span>
      </div>
      <div className="flex items-end justify-between gap-2 px-4 pb-3">
        <div>
          <span className="text-2xl font-semibold tabular-nums text-foreground">
            {location.aqiIndex ?? '—'}
          </span>
          <span className="ml-1 text-xs text-muted-foreground">AQI</span>
        </div>
        <span
          className="max-w-[55%] truncate text-right text-sm font-medium text-muted-foreground"
          style={statusColor ? { color: statusColor } : undefined}
        >
          {location.aqiCategory || 'No reading yet'}
        </span>
      </div>
      <div className="border-t border-border bg-muted/20 px-2 py-1">
        <Button
          variant="text"
          size="sm"
          path={location.href || READINGS_HREF}
          onClick={onOpen}
          showTextOnMobile
        >
          See readings
        </Button>
      </div>
    </Card>
  );
};

export default function AdaptiveHomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const posthog = usePostHog();
  const { isEnabled: isAiEnabled, open: openAi } = useAiAssistantContext();
  const { data: session } = useSession();
  const demoMode = parseDemoMode(searchParams.get('homeDemo'));
  const experience = useHomeExperience(demoMode);
  const [isDataAccessOpen, setIsDataAccessOpen] = useState(false);
  const [isTourOpen, setIsTourOpen] = useState(false);
  const trackedModeRef = useRef<string | null>(null);

  const fairUsagePolicyUrl = useEnvironmentAwareUrl(
    'https://platform.airqo.net/docs/data-access/fair-usage-policy/'
  );
  const researchersGuideUrl = useEnvironmentAwareUrl(
    'https://platform.airqo.net/docs/data-access/researchers-guide/'
  );
  const firstName =
    (session?.user as { firstName?: string } | undefined)?.firstName || 'there';

  useEffect(() => {
    if (experience.isLoading) return;
    const signature = `${experience.mode}:${demoMode ?? 'real'}`;
    if (trackedModeRef.current === signature) return;
    trackedModeRef.current = signature;
    posthog?.capture('home_v2_viewed', {
      experience_mode: experience.mode,
      demo_mode: demoMode ?? 'none',
      saved_location_count: experience.counts.savedLocations,
      chart_count: experience.counts.charts,
      comparison_count: experience.counts.comparisons,
      has_draft: experience.counts.drafts > 0,
    });
  }, [demoMode, experience, posthog]);

  const navigate = (
    href: string,
    eventName: 'home_action_selected' | 'home_continue_selected',
    actionType: string
  ) => {
    posthog?.capture(eventName, {
      action_type: actionType,
      experience_mode: experience.mode,
      saved_location_count: experience.counts.savedLocations,
      chart_count: experience.counts.charts,
      comparison_count: experience.counts.comparisons,
    });
    router.push(href);
  };

  return (
    <div className="space-y-7">
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="mb-0 text-sm text-muted-foreground">
            {experience.mode === 'returning' ? 'Welcome back' : 'Welcome'},{' '}
            {firstName}
          </p>
          <h1 className="text-3xl font-bold text-foreground">
            What would you like to look at?
          </h1>
          <p className="mb-0 max-w-3xl text-sm text-muted-foreground sm:text-base">
            Pick up something recent, or jump straight into a part of Nexus.
          </p>
        </div>
      </header>

      {experience.isLoading ? (
        <section
          aria-label="Loading personalized home content"
          className="grid gap-3 md:grid-cols-3"
        >
          {[0, 1, 2].map(item => (
            <div
              key={item}
              className="h-20 animate-pulse rounded-md bg-muted motion-reduce:animate-none"
            />
          ))}
        </section>
      ) : experience.continueItems.length > 0 ? (
        <section aria-labelledby="continue-heading" className="space-y-4">
          <div>
            <h2 id="continue-heading" className="text-xl font-medium">
              Continue your work
            </h2>
            <p className="mb-0 mt-1 text-sm text-muted-foreground">
              Pick up a saved analysis without rebuilding your setup.
            </p>
          </div>
          <div className="grid overflow-hidden rounded-xl border border-border bg-card md:grid-cols-3">
            {experience.continueItems.map(item => (
              <button
                key={`${item.type}-${item.title}`}
                type="button"
                data-testid={`home-continue-${item.type}`}
                onClick={() =>
                  navigate(item.href, 'home_continue_selected', item.type)
                }
                className="group flex h-full w-full items-start gap-3 border-b border-border p-4 text-left transition-colors last:border-b-0 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset motion-reduce:transition-none md:border-b-0 md:border-r md:last:border-r-0"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                  <ContinueIcon item={item} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {item.description}
                  </span>
                  {formatRelativeTime(item.timestamp) && (
                    <span className="mt-2 block text-xs text-muted-foreground">
                      {formatRelativeTime(item.timestamp)}
                    </span>
                  )}
                </span>
                <AqArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </section>
      ) : null}

      <section
        aria-label="Explore with Ask AirQo and ideas"
        className={`grid gap-3 ${isAiEnabled ? 'md:grid-cols-2' : ''}`}
      >
        {isAiEnabled && (
          <button
            type="button"
            aria-label="Open Ask AirQo"
            onClick={openAi}
            className="group flex min-h-28 w-full items-center gap-4 rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none sm:p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-muted text-foreground">
              <AqMagicWand01 className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                Ask AirQo
                <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  BETA
                </span>
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                Get a guided starting point for your next question.
              </span>
            </span>
            <AqArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none group-hover:translate-x-0.5" />
          </button>
        )}
        <RotatingHint
          onSelect={href => navigate(href, 'home_action_selected', 'hint')}
        />
      </section>

      <section aria-labelledby="start-heading" className="space-y-4">
        <h2 id="start-heading" className="text-xl font-medium">
          Jump right in
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3">
          {OUTCOME_ACTIONS.map(action => {
            const Icon = action.icon;
            return (
              <Card
                key={action.id}
                className="h-full transition-shadow hover:shadow-md motion-reduce:transition-none"
              >
                <button
                  type="button"
                  data-testid={`home-outcome-${action.id}`}
                  onClick={() =>
                    navigate(action.href, 'home_action_selected', action.id)
                  }
                  className="group flex h-full w-full items-start gap-4 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-foreground">
                      {action.title}
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-muted-foreground">
                      {action.description}
                    </span>
                  </span>
                  <AqArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none group-hover:translate-x-0.5 group-hover:text-primary" />
                </button>
              </Card>
            );
          })}
        </div>
      </section>

      {!experience.isLoading && experience.updatesLoading ? (
        <section aria-label="Loading place updates" className="space-y-3">
          <div className="h-6 w-56 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="grid gap-3 md:grid-cols-3">
            {[0, 1, 2].map(item => (
              <div
                key={item}
                className="h-24 animate-pulse rounded-md bg-muted motion-reduce:animate-none"
              />
            ))}
          </div>
        </section>
      ) : null}

      {!experience.isLoading && experience.locationUpdates.length > 0 && (
        <section aria-labelledby="updates-heading" className="space-y-4">
          <h2 id="updates-heading" className="text-xl font-medium">
            Updates from your places
          </h2>
          <div className="grid gap-3 md:grid-cols-3">
            {experience.locationUpdates.map((location, index) => (
              <PlaceUpdateCard
                key={`${location.name}-${index}`}
                location={location}
                onOpen={() =>
                  posthog?.capture('home_action_selected', {
                    action_type: 'place-update',
                    experience_mode: experience.mode,
                  })
                }
              />
            ))}
          </div>
        </section>
      )}

      <nav
        aria-label="More ways to get started"
        className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
      >
        <Button
          variant="text"
          size="sm"
          Icon={AqPlayCircle}
          onClick={() => setIsTourOpen(true)}
          showTextOnMobile
        >
          Watch overview
        </Button>
        <Button
          variant="text"
          size="sm"
          onClick={() => setIsDataAccessOpen(true)}
          showTextOnMobile
        >
          Data access
        </Button>
        <Button
          variant="text"
          size="sm"
          path="/request-organization"
          showTextOnMobile
        >
          Request an organization
        </Button>
      </nav>

      <VideoModal isOpen={isTourOpen} onClose={() => setIsTourOpen(false)} />

      <ReusableDialog
        isOpen={isDataAccessOpen}
        onClose={() => setIsDataAccessOpen(false)}
        title="Data Access & Usage"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Access guidance on how to use and share AirQo data responsibly.
          </p>
          <ul className="list-disc space-y-2 pl-6">
            <li>
              <a
                href={fairUsagePolicyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Fair Usage Policy
              </a>
            </li>
            <li>
              <a
                href={researchersGuideUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline"
              >
                Researchers Guide
              </a>
            </li>
          </ul>
        </div>
      </ReusableDialog>
    </div>
  );
}
