'use client';

import React, { useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import { PermissionGuard } from '@/shared/components';
import {
  Button,
  Card,
  PageHeading,
  LoadingState,
  EmptyState,
  SearchField,
  Dialog,
} from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/toast';
import {
  getUserFriendlyErrorMessage,
  isForbiddenError,
} from '@/shared/utils/errorMessages';
import { AccessDenied } from '@/shared/components/AccessDenied';
import {
  useSelfies,
  useHideSelfie,
  useUnhideSelfie,
  useDeleteSelfie,
} from '@/modules/selfies';
import type { Selfie } from '@/shared/types/api';

const EVENT_ID = 'clean-air-forum-2026';

const AQI_STYLES: Record<string, { bg: string; text: string }> = {
  Good: {
    bg: 'bg-emerald-100 dark:bg-emerald-950/40',
    text: 'text-emerald-800 dark:text-emerald-300',
  },
  Moderate: {
    bg: 'bg-amber-100 dark:bg-amber-950/40',
    text: 'text-amber-800 dark:text-amber-300',
  },
  'Unhealthy for Sensitive Groups': {
    bg: 'bg-orange-100 dark:bg-orange-950/40',
    text: 'text-orange-800 dark:text-orange-300',
  },
  Unhealthy: {
    bg: 'bg-red-100 dark:bg-red-950/40',
    text: 'text-red-800 dark:text-red-300',
  },
  'Very Unhealthy': {
    bg: 'bg-purple-100 dark:bg-purple-950/40',
    text: 'text-purple-800 dark:text-purple-300',
  },
  Hazardous: {
    bg: 'bg-rose-100 dark:bg-rose-950/40',
    text: 'text-rose-800 dark:text-rose-300',
  },
};

const AQI_SHORT_LABELS: Record<string, string> = {
  Good: 'Good',
  Moderate: 'Moderate',
  'Unhealthy for Sensitive Groups': 'USG',
  Unhealthy: 'Unhealthy',
  'Very Unhealthy': 'V. Unhealthy',
  Hazardous: 'Hazardous',
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const getAqiStyle = (category: string) =>
  AQI_STYLES[category] || {
    bg: 'bg-slate-100 dark:bg-slate-950/40',
    text: 'text-slate-800 dark:text-slate-300',
  };

const SelfiesListContent: React.FC = () => {
  const [aqiFilter, setAqiFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSelfie, setSelectedSelfie] = useState<Selfie | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Selfie | null>(null);

  const { data, error, isLoading, mutate } = useSelfies(EVENT_ID);
  const { trigger: triggerHide, isMutating: isHiding } = useHideSelfie();
  const { trigger: triggerUnhide, isMutating: isUnhiding } = useUnhideSelfie();
  const { trigger: triggerDelete, isMutating: isDeleting } = useDeleteSelfie();

  const selfies = useMemo(() => data?.selfies || [], [data?.selfies]);

  const availableAqiCategories = useMemo(() => {
    const cats = new Set<string>();
    for (const s of selfies) {
      if (s.aqiCategory) cats.add(s.aqiCategory);
    }
    return Array.from(cats).sort();
  }, [selfies]);

  const filteredSelfies = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return selfies.filter(selfie => {
      const matchesAqi =
        aqiFilter === 'all' || selfie.aqiCategory === aqiFilter;
      const matchesSearch =
        !q ||
        selfie.displayName.toLowerCase().includes(q) ||
        selfie.locationName.toLowerCase().includes(q);
      return matchesAqi && matchesSearch;
    });
  }, [selfies, aqiFilter, searchQuery]);

  const visibleCount = useMemo(
    () => selfies.filter(s => !s.hidden).length,
    [selfies]
  );

  const handleToggleHide = useCallback(
    async (selfie: Selfie) => {
      try {
        if (selfie.hidden) {
          await triggerUnhide({ id: selfie._id, eventId: EVENT_ID });
          toast.success('Selfie restored to wall');
        } else {
          await triggerHide({ id: selfie._id, eventId: EVENT_ID });
          toast.success('Selfie hidden from wall');
        }
      } catch (err) {
        toast.error(getUserFriendlyErrorMessage(err));
      }
    },
    [triggerHide, triggerUnhide]
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await triggerDelete({ id: deleteTarget._id, eventId: EVENT_ID });
      toast.success('Selfie permanently deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getUserFriendlyErrorMessage(err));
    }
  }, [deleteTarget, triggerDelete]);

  if (isLoading) {
    return (
      <LoadingState className="min-h-[400px]" text="Loading selfies..." />
    );
  }

  if (isForbiddenError(error)) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You do not have the required permissions to view selfies."
      />
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          {getUserFriendlyErrorMessage(error)}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Selfies"
        subtitle={`${selfies.length} submissions \u00b7 ${visibleCount} visible`}
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-md border border-border p-1">
          <button
            type="button"
            onClick={() => setAqiFilter('all')}
            className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
              aqiFilter === 'all'
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            All AQI
          </button>
          {availableAqiCategories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setAqiFilter(cat)}
              className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                aqiFilter === cat
                  ? 'bg-primary text-white'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {AQI_SHORT_LABELS[cat] || cat}
            </button>
          ))}
        </div>

        <div className="w-64">
          <SearchField
            placeholder="Search by name or location..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onClear={() => setSearchQuery('')}
          />
        </div>

        <Button
          variant="outlined"
          onClick={() => void mutate()}
          paddingStyles="h-10 px-4"
        >
          Refresh
        </Button>
      </div>

      {filteredSelfies.length === 0 ? (
        <EmptyState
          title="No selfies found"
          description="No selfies match the current filters."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredSelfies.map(selfie => {
            const isProcessing = isHiding || isUnhiding || isDeleting;

            return (
              <Card
                key={selfie._id}
                className={`group overflow-hidden p-0 transition-shadow hover:shadow-lg ${
                  selfie.hidden ? 'opacity-60' : ''
                }`}
              >
                <div
                  className="relative aspect-square cursor-pointer overflow-hidden bg-muted"
                  onClick={() => setSelectedSelfie(selfie)}
                >
                  <Image
                    src={selfie.imageUrl}
                    alt={`Selfie by ${selfie.displayName}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {selfie.hidden && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <span className="rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-black">
                        Hidden
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{selfie.avatarIcon}</span>
                    <span className="text-sm font-medium text-foreground truncate">
                      {selfie.displayName}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground truncate">
                    {selfie.locationName}
                  </p>

                  <p className="text-[10px] text-muted-foreground">
                    {formatDateTime(selfie.createdAt)}
                  </p>

                  <div className="flex items-center gap-2 pt-1 border-t border-border">
                    <Button
                      variant={selfie.hidden ? 'filled' : 'ghost'}
                      size="sm"
                      paddingStyles="h-7 px-2 text-xs"
                      onClick={() => void handleToggleHide(selfie)}
                      disabled={isProcessing}
                    >
                      {selfie.hidden ? 'Restore' : 'Hide'}
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      paddingStyles="h-7 px-2 text-xs"
                      onClick={() => setDeleteTarget(selfie)}
                      disabled={isProcessing}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog
        isOpen={!!selectedSelfie}
        onClose={() => setSelectedSelfie(null)}
        size="lg"
        showFooter={false}
      >
        {selectedSelfie && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-lg">
              <Image
                src={selectedSelfie.imageUrl}
                alt={`Selfie by ${selectedSelfie.displayName}`}
                width={800}
                height={600}
                className="w-full object-contain max-h-[60vh]"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{selectedSelfie.avatarIcon}</span>
                <span className="text-sm font-medium text-foreground">
                  {selectedSelfie.displayName}
                </span>
                {selectedSelfie.hidden && (
                  <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-800 dark:bg-slate-950/40 dark:text-slate-300">
                    Hidden
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span>PM2.5: {selectedSelfie.pm25Value.toFixed(1)}</span>
                <span
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                    getAqiStyle(selectedSelfie.aqiCategory).bg
                  } ${getAqiStyle(selectedSelfie.aqiCategory).text}`}
                >
                  {selectedSelfie.aqiCategory}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedSelfie.locationName}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDateTime(selectedSelfie.createdAt)}
              </p>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <Button
                variant={selectedSelfie.hidden ? 'filled' : 'outlined'}
                onClick={() => {
                  void handleToggleHide(selectedSelfie);
                  setSelectedSelfie(null);
                }}
              >
                {selectedSelfie.hidden ? 'Restore to Wall' : 'Hide from Wall'}
              </Button>
              <Button
                variant="danger"
                onClick={() => {
                  setDeleteTarget(selectedSelfie);
                  setSelectedSelfie(null);
                }}
              >
                Delete Permanently
              </Button>
            </div>
          </div>
        )}
      </Dialog>

      <Dialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Selfie"
        subtitle="This action cannot be undone."
        primaryAction={{
          label: 'Delete',
          onClick: () => void handleDeleteConfirm(),
          variant: 'danger',
          loading: isDeleting,
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setDeleteTarget(null),
          variant: 'outlined',
        }}
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to permanently delete this selfie? This will
          remove the photo and its record forever.
        </p>
        {deleteTarget && (
          <div className="mt-4 flex items-center gap-3 rounded-md border border-border p-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded">
              <Image
                src={deleteTarget.imageUrl}
                alt=""
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                {deleteTarget.displayName}
              </p>
              <p className="text-xs text-muted-foreground">
                {deleteTarget.locationName}
              </p>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};

const SelfiesListPage: React.FC = () => {
  return (
    <PermissionGuard
      requiredPermissions={['SYSTEM_ADMIN', 'SUPER_ADMIN']}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need system administration permissions to manage selfies."
    >
      <SelfiesListContent />
    </PermissionGuard>
  );
};

export default SelfiesListPage;
