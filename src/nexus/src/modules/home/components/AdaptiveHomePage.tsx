'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { usePostHog } from 'posthog-js/react';
import {
  AqArrowRight,
  AqMagicWand01,
  AqPlayCircle,
  AqPresentationChart02,
  AqUpload01,
} from '@airqo/icons-react';
import { Card } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import VideoModal from '@/modules/user-checklist/components/VideoModal';
import { useAiAssistantContext } from '@/modules/ai/context/ai-assistant-provider';
import { useHomeExperience } from '../hooks/useHomeExperience';
import { OUTCOME_ACTIONS, READINGS_HREF } from '../constants';
import { formatHomeTimestamp, parseDemoMode } from '../utils';
import { RotatingHint } from './RotatingHint';
import { PlaceUpdateCard } from './PlaceUpdateCard';
import { DataAccessDialog } from './DataAccessDialog';
import type { HomeExperienceItem } from '../types';

const ContinueIcon = ({ item }: { item: HomeExperienceItem }) => {
  const Icon =
    item.iconName === 'visualize' ? AqUpload01 : AqPresentationChart02;
  return <Icon className="h-5 w-5" />;
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

  const showUpdatesSkeleton =
    !experience.isLoading && experience.updatesLoading;
  const showUpdatesCards =
    !experience.isLoading &&
    !experience.updatesLoading &&
    Boolean(experience.activeComparison) &&
    experience.locationUpdates.length > 0;
  // The empty state already offers a "Compare places" call to action pointing at
  // the same tab, so "View all" is only rendered once there is something to see.
  const showUpdatesEmpty = !showUpdatesSkeleton && !showUpdatesCards;

  return (
    <div className="space-y-7">
      {/* The greeting line carries the primary colour; the rest of the header
          stays as plain type so the page keeps its quiet, scannable top. */}
      <header className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="mb-0 text-sm font-medium text-primary">
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
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="inline-block h-5 w-1 shrink-0 rounded-full bg-primary"
              />
              <h2 id="continue-heading" className="text-xl font-medium">
                Continue your work
              </h2>
            </div>
            <p className="mb-0 mt-1 text-sm text-muted-foreground">
              Pick up a saved analysis without rebuilding your setup.
            </p>
          </div>
          <div className="grid overflow-hidden rounded-xl border border-border bg-card md:grid-cols-3">
            {experience.continueItems.map((item, index) => (
              <button
                key={`${item.type}-${item.title}`}
                type="button"
                data-testid={`home-continue-${item.type}`}
                onClick={() =>
                  navigate(item.href, 'home_continue_selected', item.type)
                }
                className={`group flex h-full w-full items-start gap-3 border-b border-border p-4 text-left transition-colors last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset motion-reduce:transition-none md:border-b-0 md:border-r md:last:border-r-0 ${
                  // The most recent item is the one to resume, so it carries the
                  // primary tint that gives the section its focal point.
                  index === 0
                    ? 'bg-primary/[0.04] hover:bg-primary/[0.08]'
                    : 'hover:bg-muted/60'
                }`}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md transition-colors motion-reduce:transition-none ${
                    index === 0
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <ContinueIcon item={item} />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-medium text-foreground">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {item.description}
                  </span>
                  {formatHomeTimestamp(item.timestamp) && (
                    <span className="mt-2 block text-xs text-muted-foreground">
                      {formatHomeTimestamp(item.timestamp)}
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
            className="group flex min-h-28 w-full items-center gap-4 rounded-xl border border-primary/15 bg-card p-4 text-left shadow-sm ring-1 ring-transparent transition-colors hover:border-primary/30 hover:bg-primary/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:transition-none sm:p-5"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <AqMagicWand01 className="h-5 w-5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2 font-semibold text-foreground">
                Ask AirQo
                <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-primary">
                  BETA
                </span>
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                Get a guided starting point for your next question.
              </span>
            </span>
            <AqArrowRight className="h-5 w-5 text-muted-foreground transition-transform motion-reduce:transition-none group-hover:translate-x-0.5 group-hover:text-primary" />
          </button>
        )}
        <RotatingHint
          onSelect={href => navigate(href, 'home_action_selected', 'hint')}
        />
      </section>

      <section aria-labelledby="start-heading" className="space-y-4">
        <div className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="inline-block h-5 w-1 shrink-0 rounded-full bg-primary"
          />
          <h2 id="start-heading" className="text-xl font-medium">
            Jump right in
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3">
          {OUTCOME_ACTIONS.map(action => {
            const Icon = action.icon;
            return (
              <Card
                key={action.id}
                className="h-full ring-1 ring-transparent transition-all hover:shadow-md hover:ring-primary/25 motion-reduce:transition-none"
              >
                <button
                  type="button"
                  data-testid={`home-outcome-${action.id}`}
                  onClick={() =>
                    navigate(action.href, 'home_action_selected', action.id)
                  }
                  className="group flex h-full w-full items-start gap-4 p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary transition-colors group-hover:bg-primary/15 motion-reduce:transition-none">
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

      {!experience.isLoading && (
        <section aria-labelledby="updates-heading" className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                aria-hidden="true"
                className="inline-block h-5 w-1 shrink-0 rounded-full bg-primary"
              />
              <h2 id="updates-heading" className="text-xl font-medium">
                Updates from your places
              </h2>
            </div>
            {!showUpdatesEmpty && (
              <Button
                variant="text"
                size="sm"
                path={READINGS_HREF}
                onClick={() =>
                  posthog?.capture('home_action_selected', {
                    action_type: 'view-all-comparisons',
                    experience_mode: experience.mode,
                  })
                }
                showTextOnMobile
              >
                View all
              </Button>
            )}
          </div>

          {showUpdatesSkeleton ? (
            <div
              role="status"
              aria-label="Loading place updates"
              className="space-y-3"
            >
              <div className="grid gap-3 md:grid-cols-3">
                {[0, 1, 2].map(item => (
                  <div
                    key={item}
                    className="h-24 animate-pulse rounded-md bg-muted motion-reduce:animate-none"
                  />
                ))}
              </div>
            </div>
          ) : showUpdatesCards ? (
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
          ) : (
            <EmptyState
              compact
              title="No saved locations yet"
              description="Save the locations you care about and their latest readings will show up here."
              action={{
                label: 'Compare places',
                onClick: () =>
                  navigate(
                    READINGS_HREF,
                    'home_action_selected',
                    'empty-state-comparisons'
                  ),
              }}
            />
          )}
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

      <DataAccessDialog
        isOpen={isDataAccessOpen}
        onClose={() => setIsDataAccessOpen(false)}
      />
    </div>
  );
}
