'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  Input,
  WarningBanner,
} from '@/shared/components/ui';
import { toast } from '@/shared/components/ui';
import { clientService } from '@/shared/services/clientService';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { sanitizeErrorForLogging } from '@/shared/utils/sanitizeErrorForLogging';
import { formatDate } from '@/shared/utils';
import { isValidOriginUrl } from '@/shared/lib/validators';
import type {
  ClientAccessToken,
  UpdateTokenSecurityRequest,
} from '@/shared/types/api';

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

const HOURS = Array.from({ length: 24 }, (_, hour) => ({
  value: hour,
  label: `${hour.toString().padStart(2, '0')}:00 UTC`,
}));

interface TokenSecurityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  token: ClientAccessToken | null;
  clientName: string;
  onSuccess?: () => void;
}

const normalizeValues = (values: string[]) =>
  Array.from(new Set(values.map(value => value.trim()).filter(Boolean)));

const TokenSecurityDialog: React.FC<TokenSecurityDialogProps> = ({
  isOpen,
  onClose,
  token,
  clientName,
  onSuccess,
}) => {
  const [allowedGrids, setAllowedGrids] = useState<string[]>(['']);
  const [allowedCohorts, setAllowedCohorts] = useState<string[]>(['']);
  const [allowedOrigins, setAllowedOrigins] = useState<string[]>(['']);
  const [allowedGridErrors, setAllowedGridErrors] = useState<string[]>(['']);
  const [allowedCohortErrors, setAllowedCohortErrors] = useState<string[]>([
    '',
  ]);
  const [allowedOriginErrors, setAllowedOriginErrors] = useState<string[]>([
    '',
  ]);
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [allowedDays, setAllowedDays] = useState<number[]>([]);
  const [startHour, setStartHour] = useState(0);
  const [endHour, setEndHour] = useState(23);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReinstating, setIsReinstating] = useState(false);

  useEffect(() => {
    if (!isOpen || !token) {
      return;
    }

    const grids = token.allowed_grids || [];
    const cohorts = token.allowed_cohorts || [];
    const origins = token.allowed_origins || [];
    const schedule = token.access_schedule;

    setAllowedGrids(grids.length > 0 ? grids : ['']);
    setAllowedGridErrors(grids.length > 0 ? grids.map(() => '') : ['']);
    setAllowedCohorts(cohorts.length > 0 ? cohorts : ['']);
    setAllowedCohortErrors(cohorts.length > 0 ? cohorts.map(() => '') : ['']);
    setAllowedOrigins(origins.length > 0 ? origins : ['']);
    setAllowedOriginErrors(origins.length > 0 ? origins.map(() => '') : ['']);
    setScheduleEnabled(Boolean(schedule?.enabled));
    setAllowedDays(schedule?.allowed_days || []);
    setStartHour(schedule?.allowed_hours_utc?.start ?? 0);
    setEndHour(schedule?.allowed_hours_utc?.end ?? 23);
  }, [isOpen, token]);

  const tokenLabel = token?.name || 'Token security';
  const isAutoSuspended = Boolean(token?.request_pattern?.auto_suspended);

  const handleListChange = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    errorsSetter: React.Dispatch<React.SetStateAction<string[]>>,
    index: number,
    value: string
  ) => {
    setter(previous => {
      const next = [...previous];
      next[index] = value;
      return next;
    });

    errorsSetter(previous => {
      const next = [...previous];
      next[index] = '';
      return next;
    });
  };

  const handleAddRow = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    errorsSetter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter(previous => [...previous, '']);
    errorsSetter(previous => [...previous, '']);
  };

  const handleRemoveRow = (
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    errorsSetter: React.Dispatch<React.SetStateAction<string[]>>,
    values: string[],
    index: number
  ) => {
    if (values.length <= 1) {
      return;
    }

    setter(previous => previous.filter((_, i) => i !== index));
    errorsSetter(previous => previous.filter((_, i) => i !== index));
  };

  const validateOrigins = (values: string[]) => {
    const nextErrors = values.map(value =>
      value.trim() && !isValidOriginUrl(value)
        ? 'Enter a valid origin URL with http or https'
        : ''
    );
    setAllowedOriginErrors(nextErrors);
    return !nextErrors.some(Boolean);
  };

  const handleReinstate = async () => {
    if (!token) {
      return;
    }

    setIsReinstating(true);
    try {
      await clientService.reinstateToken(token.token);
      toast.success('Token reinstated successfully');
      onSuccess?.();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      console.error('Reinstate token error:', sanitizeErrorForLogging(error));
    } finally {
      setIsReinstating(false);
    }
  };

  const handleSave = async () => {
    if (!token) {
      toast.error('Token data is unavailable');
      return;
    }

    const normalizedGrids = normalizeValues(allowedGrids);
    const normalizedCohorts = normalizeValues(allowedCohorts);
    const normalizedOrigins = normalizeValues(allowedOrigins);

    const gridErrors = allowedGrids.map(value => (value.trim() ? '' : ''));
    const cohortErrors = allowedCohorts.map(value => (value.trim() ? '' : ''));
    setAllowedGridErrors(gridErrors);
    setAllowedCohortErrors(cohortErrors);

    if (!validateOrigins(allowedOrigins)) {
      return;
    }

    if (scheduleEnabled && startHour === endHour) {
      toast.error('Select a valid UTC hour range');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: UpdateTokenSecurityRequest = {
        allowed_grids: normalizedGrids,
        allowed_cohorts: normalizedCohorts,
        allowed_origins: normalizedOrigins,
        access_schedule: {
          enabled: scheduleEnabled,
          allowed_days: scheduleEnabled ? allowedDays : [],
          allowed_hours_utc: {
            start: scheduleEnabled ? startHour : 0,
            end: scheduleEnabled ? endHour : 23,
          },
        },
      };

      await clientService.updateTokenSecurity(token.token, payload);
      toast.success('Token security updated successfully');
      onSuccess?.();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      console.error(
        'Token security update error:',
        sanitizeErrorForLogging(error)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleDay = (day: number) => {
    setAllowedDays(previous =>
      previous.includes(day)
        ? previous.filter(value => value !== day)
        : [...previous, day].sort((a, b) => a - b)
    );
  };

  const handleClose = () => {
    if (!isSubmitting && !isReinstating) {
      onClose();
    }
  };

  const renderListEditor = (
    label: string,
    description: string,
    values: string[],
    errors: string[],
    onChange: (index: number, value: string) => void,
    onAdd: () => void,
    onRemove: (index: number) => void
  ) => (
    <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-2">
        {values.map((value, index) => (
          <div
            key={index}
            className="flex flex-col gap-2 sm:flex-row sm:items-start"
          >
            <div className="flex-1">
              <Input
                value={value}
                onChange={e => onChange(index, e.target.value)}
                placeholder="Enter value"
                className="w-full"
              />
              {errors[index] && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors[index]}
                </p>
              )}
            </div>
            {values.length > 1 && (
              <Button
                variant="outlined"
                size="sm"
                onClick={() => onRemove(index)}
                className="px-3 sm:self-start"
              >
                Remove
              </Button>
            )}
          </div>
        ))}

        <Button variant="ghost" size="sm" onClick={onAdd} className="w-full">
          + Add Row
        </Button>
      </div>
    </div>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Token security"
      subtitle={`${clientName}${tokenLabel ? ` · ${tokenLabel}` : ''}`}
      size="2xl"
      maxHeight="max-h-[85vh]"
      contentClassName="pr-1 sm:pr-2"
      primaryAction={{
        label: 'Save changes',
        onClick: handleSave,
        loading: isSubmitting,
        disabled: isSubmitting || isReinstating || !token,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: handleClose,
        variant: 'outlined',
        disabled: isSubmitting || isReinstating,
      }}
    >
      <div className="space-y-6">
        {isAutoSuspended && token?.request_pattern && (
          <WarningBanner
            title="Token automatically suspended"
            message={
              <div className="space-y-1">
                <p>
                  This token has been suspended because suspicious activity was
                  detected.
                </p>
                {token.request_pattern.suspension_reason && (
                  <p>
                    <span className="font-medium">Reason:</span>{' '}
                    {token.request_pattern.suspension_reason}
                  </p>
                )}
                {token.request_pattern.suspended_at && (
                  <p>
                    <span className="font-medium">Suspended at:</span>{' '}
                    {formatDate(token.request_pattern.suspended_at, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                )}
              </div>
            }
            actions={
              <Button
                size="sm"
                variant="filled"
                onClick={handleReinstate}
                loading={isReinstating}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Reinstate token
              </Button>
            }
          />
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {renderListEditor(
            'Restrict to Grids',
            'Leave blank to keep the token unrestricted.',
            allowedGrids,
            allowedGridErrors,
            (index, value) =>
              handleListChange(
                setAllowedGrids,
                setAllowedGridErrors,
                index,
                value
              ),
            () => handleAddRow(setAllowedGrids, setAllowedGridErrors),
            index =>
              handleRemoveRow(
                setAllowedGrids,
                setAllowedGridErrors,
                allowedGrids,
                index
              )
          )}

          {renderListEditor(
            'Restrict to Cohorts',
            'Provide cohort IDs that this token is allowed to access.',
            allowedCohorts,
            allowedCohortErrors,
            (index, value) =>
              handleListChange(
                setAllowedCohorts,
                setAllowedCohortErrors,
                index,
                value
              ),
            () => handleAddRow(setAllowedCohorts, setAllowedCohortErrors),
            index =>
              handleRemoveRow(
                setAllowedCohorts,
                setAllowedCohortErrors,
                allowedCohorts,
                index
              )
          )}
        </div>

        {renderListEditor(
          'Allowed origins',
          'Use full origins with protocol for browser-based integrations.',
          allowedOrigins,
          allowedOriginErrors,
          (index, value) =>
            handleListChange(
              setAllowedOrigins,
              setAllowedOriginErrors,
              index,
              value
            ),
          () => handleAddRow(setAllowedOrigins, setAllowedOriginErrors),
          index =>
            handleRemoveRow(
              setAllowedOrigins,
              setAllowedOriginErrors,
              allowedOrigins,
              index
            )
        )}

        <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={scheduleEnabled}
              onCheckedChange={setScheduleEnabled}
              className="mt-0.5"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Access schedule
              </p>
              <p className="text-xs text-muted-foreground">
                When enabled, requests outside the configured UTC window are
                rejected.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">
                Allowed days
              </p>
              <div className="flex flex-wrap gap-3">
                {DAYS.map(day => (
                  <label
                    key={day.value}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-sm"
                  >
                    <Checkbox
                      checked={allowedDays.includes(day.value)}
                      onCheckedChange={() => toggleDay(day.value)}
                    />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Leave all days unchecked to allow requests on every day.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-foreground">
                  Start hour UTC
                </span>
                <select
                  value={startHour}
                  onChange={e => setStartHour(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  {HOURS.map(hour => (
                    <option key={hour.value} value={hour.value}>
                      {hour.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-foreground">
                  End hour UTC
                </span>
                <select
                  value={endHour}
                  onChange={e => setEndHour(Number(e.target.value))}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                >
                  {HOURS.map(hour => (
                    <option key={hour.value} value={hour.value}>
                      {hour.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
          <p>
            Empty lists mean the token is unrestricted for that dimension. The
            access schedule is only enforced when it is enabled.
          </p>
        </div>
      </div>
    </Dialog>
  );
};

export default TokenSecurityDialog;
