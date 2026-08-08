'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { PermissionGuard } from '@/shared/components';
import {
  Button,
  Card,
  Input,
  LoadingState,
  PageHeading,
  toast,
} from '@/shared/components/ui';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { AqRefreshCw05 } from '@airqo/icons-react';
import { useSWRConfig } from 'swr';
import {
  AQI_RANGES_CACHE_KEY,
  useAqiConfig,
} from '@/shared/providers/aqi-config-provider';
import { aqiConfigService } from '@/shared/services/aqiConfigService';
import { AQI_RANGE_KEYS, type AqiRangeUpdate } from '@/shared/types/aqi';
import {
  getUserFriendlyErrorMessage,
  isForbiddenError,
} from '@/shared/utils/errorMessages';

const EMPTY_SECRET = '';

const AqiRangesPage: React.FC = () => {
  const { config, isLoading, error, refresh } = useAqiConfig();
  const { mutate } = useSWRConfig();
  const [adminSecret, setAdminSecret] = useState(EMPTY_SECRET);
  const [updatedBy, setUpdatedBy] = useState('');
  const [draft, setDraft] = useState<AqiRangeUpdate[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (!config) return;
    setDraft(
      [...config.ranges]
        .sort((a, b) => a.display_order - b.display_order)
        .map(range => ({
          key: range.key,
          label: range.label,
          max_value: range.max_value,
          color: range.color,
          ...(range.color_name ? { color_name: range.color_name } : {}),
        }))
    );
  }, [config]);

  const validationError = useMemo(() => {
    if (draft.length !== AQI_RANGE_KEYS.length) {
      return 'All six AQI categories are required.';
    }

    if (draft.some((range, index) => range.key !== AQI_RANGE_KEYS[index])) {
      return 'AQI categories must remain in the API-defined order.';
    }

    for (let index = 0; index < draft.length; index += 1) {
      const range = draft[index];
      if (!range.label.trim() || !/^#[0-9a-f]{6}$/i.test(range.color)) {
        return 'Each category needs a label and a valid six-digit hex color.';
      }

      if (range.max_value !== null && !Number.isFinite(range.max_value)) {
        return 'Maximum values must be valid numbers or blank for Hazardous.';
      }

      if (index < draft.length - 1 && range.max_value === null) {
        return 'Only Hazardous may have an unbounded maximum.';
      }

      const next = draft[index + 1];
      if (
        next &&
        range.max_value !== null &&
        next.max_value !== null &&
        range.max_value >= next.max_value
      ) {
        return 'Maximum values must strictly increase down the list.';
      }
    }

    return null;
  }, [draft]);

  const updateDraft = <K extends keyof AqiRangeUpdate>(
    index: number,
    field: K,
    value: AqiRangeUpdate[K]
  ) => {
    setDraft(current =>
      current.map((range, rangeIndex) =>
        rangeIndex === index ? { ...range, [field]: value } : range
      )
    );
  };

  const revalidateAfterMutation = async (successMessage: string) => {
    try {
      await mutate(AQI_RANGES_CACHE_KEY);
      toast.success(successMessage);
    } catch {
      toast.success(
        `${successMessage} The latest values could not be reloaded; use Refresh to verify them.`
      );
    }
  };

  const handleSave = async () => {
    if (!adminSecret.trim()) {
      toast.error('Enter the admin setup secret to save AQI ranges.');
      return;
    }
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsSaving(true);
    try {
      await aqiConfigService.updateAqiRanges({
        admin_secret: adminSecret.trim(),
        ranges: draft,
        ...(updatedBy.trim() ? { updated_by: updatedBy.trim() } : {}),
      });
      setAdminSecret(EMPTY_SECRET);
      await revalidateAfterMutation('AQI ranges updated successfully.');
    } catch (saveError) {
      toast.error(getUserFriendlyErrorMessage(saveError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!adminSecret.trim()) {
      toast.error('Enter the admin setup secret to reset AQI ranges.');
      return;
    }

    setIsResetting(true);
    try {
      await aqiConfigService.resetAqiRanges(adminSecret.trim());
      setAdminSecret(EMPTY_SECRET);
      await revalidateAfterMutation('AQI ranges reset to the server defaults.');
    } catch (resetError) {
      toast.error(getUserFriendlyErrorMessage(resetError));
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <PermissionGuard
      requiredPermissions={['SUPER_ADMIN']}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need SUPER_ADMIN permission to manage AQI ranges."
    >
      {isForbiddenError(error) ? (
        <AccessDenied
          title="Access Denied"
          message="You do not have the required permissions to manage AQI ranges."
        />
      ) : (
        <div className="space-y-6">
          <PageHeading
            title="AQI Ranges"
            subtitle="Manage the live AQI category boundaries, labels, and colors used across Nexus."
            action={
              <Button
                type="button"
                variant="outlined"
                Icon={AqRefreshCw05}
                iconPosition="start"
                loading={isLoading}
                onClick={() => void refresh()}
              >
                Refresh
              </Button>
            }
          />

          {isLoading && !config ? (
            <LoadingState className="min-h-[420px]" text="Loading AQI ranges..." />
          ) : error && !config ? (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-foreground">
                Failed to load AQI ranges
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {getUserFriendlyErrorMessage(error)}
              </p>
            </Card>
          ) : (
            <div className="space-y-6">
              {Boolean(error) && (
                <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  AQI configuration refresh failed. The form is showing the last
                  successful configuration; retry before saving if the server has
                  changed since it was loaded.
                </Card>
              )}
              <Card className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold text-foreground">
                      Active configuration
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {config?.standard || 'AQI standard provided by the API'}
                    </p>
                  </div>
                  <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    Source: {config?.source || 'unknown'}
                  </span>
                </div>
              </Card>

              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] text-left text-sm">
                    <thead className="border-b border-border bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                      <tr>
                        <th className="px-5 py-3">Category</th>
                        <th className="px-5 py-3">Minimum</th>
                        <th className="px-5 py-3">Maximum</th>
                        <th className="px-5 py-3">Label</th>
                        <th className="px-5 py-3">Color</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {draft.map((range, index) => {
                        const sourceRange = config?.ranges.find(
                          item => item.key === range.key
                        );
                        return (
                          <tr key={range.key}>
                            <td className="px-5 py-4 font-medium text-foreground">
                              {range.key}
                            </td>
                            <td className="px-5 py-4 text-muted-foreground">
                              {sourceRange?.min_value ?? '—'}
                            </td>
                            <td className="px-5 py-4">
                              <Input
                                aria-label={`${range.key} maximum`}
                                type="number"
                                step="any"
                                min="0"
                                value={range.max_value ?? ''}
                                placeholder="Unbounded"
                                disabled={index === draft.length - 1}
                                onChange={event =>
                                  updateDraft(
                                    index,
                                    'max_value',
                                    event.target.value === ''
                                      ? null
                                      : Number(event.target.value)
                                  )
                                }
                              />
                            </td>
                            <td className="px-5 py-4">
                              <Input
                                aria-label={`${range.key} label`}
                                value={range.label}
                                onChange={event =>
                                  updateDraft(index, 'label', event.target.value)
                                }
                              />
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <input
                                  aria-label={`${range.key} color picker`}
                                  type="color"
                                  value={range.color}
                                  onChange={event =>
                                    updateDraft(index, 'color', event.target.value)
                                  }
                                  className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent p-1"
                                />
                                <Input
                                  aria-label={`${range.key} color`}
                                  value={range.color}
                                  onChange={event =>
                                    updateDraft(index, 'color', event.target.value)
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex flex-wrap items-end justify-between gap-4 border-t border-border p-5">
                  <div className="flex flex-wrap gap-3">
                    <Input
                      label="Admin setup secret"
                      type="password"
                      value={adminSecret}
                      onChange={event => setAdminSecret(event.target.value)}
                      autoComplete="off"
                    />
                    <Input
                      label="Updated by (optional)"
                      value={updatedBy}
                      onChange={event => setUpdatedBy(event.target.value)}
                      placeholder="Team or change reference"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      variant="outlined"
                      className="border-red-300 text-red-700 hover:bg-red-50"
                      loading={isResetting}
                      disabled={isSaving}
                      onClick={handleReset}
                    >
                      Reset to defaults
                    </Button>
                    <Button
                      type="button"
                      loading={isSaving}
                      disabled={isResetting || !!validationError}
                      onClick={handleSave}
                    >
                      Save ranges
                    </Button>
                  </div>
                </div>
                {validationError && (
                  <p className="border-t border-border px-5 py-3 text-sm text-red-600">
                    {validationError}
                  </p>
                )}
              </Card>
            </div>
          )}
        </div>
      )}
    </PermissionGuard>
  );
};

export default AqiRangesPage;
