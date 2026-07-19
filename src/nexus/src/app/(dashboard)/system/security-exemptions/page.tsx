'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { PermissionGuard } from '@/shared/components';
import {
  Button,
  Card,
  Checkbox,
  Dialog,
  Input,
  LoadingState,
  PageHeading,
  toast,
} from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { AqRefreshCw05 } from '@airqo/icons-react';
import {
  useBypassedTokens,
  useUpdateTokenBypass,
} from '@/shared/hooks/useAdmin';
import {
  getUserFriendlyErrorMessage,
  isForbiddenError,
} from '@/shared/utils/errorMessages';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { sanitizeErrorForLogging } from '@/shared/utils/sanitizeErrorForLogging';
import { formatDate } from '@/shared/utils';
import { refreshWithToast } from '@/shared/utils/refreshWithToast';
import type {
  BypassedToken,
  BypassEntry,
} from '@/shared/types/api';

type BypassType = BypassEntry['type'];

const BYPASS_LABELS: Record<BypassType, string> = {
  bypass_anomaly_detection: 'Anomaly Detection',
  bypass_compromise_detection: 'Compromise Detection',
  bypass_ip_blacklist: 'IP Blacklist',
};

const BYPASS_COLORS: Record<BypassType, string> = {
  bypass_anomaly_detection:
    'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  bypass_compromise_detection:
    'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  bypass_ip_blacklist:
    'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-300',
};

interface BypassRow extends BypassedToken {
  id: string;
  [key: string]: unknown;
}

interface BypassGrantDialogProps {
  isOpen: boolean;
  onClose: () => void;
  token: BypassedToken | null;
  onSuccess: () => void;
}

const BypassGrantDialog: React.FC<BypassGrantDialogProps> = ({
  isOpen,
  onClose,
  token,
  onSuccess,
}) => {
  const { trigger: updateBypass, isMutating } = useUpdateTokenBypass();

  const [anomalyEnabled, setAnomalyEnabled] = useState(false);
  const [anomalyPermanent, setAnomalyPermanent] = useState(true);
  const [anomalyExpiry, setAnomalyExpiry] = useState('');

  const [compromiseEnabled, setCompromiseEnabled] = useState(false);
  const [compromisePermanent, setCompromisePermanent] = useState(true);
  const [compromiseExpiry, setCompromiseExpiry] = useState('');

  const [ipBlacklistEnabled, setIpBlacklistEnabled] = useState(false);
  const [ipBlacklistPermanent, setIpBlacklistPermanent] = useState(true);
  const [ipBlacklistExpiry, setIpBlacklistExpiry] = useState('');

  const [reinstate, setReinstate] = useState(false);

  useEffect(() => {
    if (!isOpen || !token) return;

    const findBypass = (type: BypassType) =>
      token.bypasses.find(b => b.type === type);

    const anomaly = findBypass('bypass_anomaly_detection');
    setAnomalyEnabled(!!anomaly);
    setAnomalyPermanent(!anomaly?.expires_at);
    setAnomalyExpiry(anomaly?.expires_at?.slice(0, 10) || '');

    const compromise = findBypass('bypass_compromise_detection');
    setCompromiseEnabled(!!compromise);
    setCompromisePermanent(!compromise?.expires_at);
    setCompromiseExpiry(compromise?.expires_at?.slice(0, 10) || '');

    const ipBlacklist = findBypass('bypass_ip_blacklist');
    setIpBlacklistEnabled(!!ipBlacklist);
    setIpBlacklistPermanent(!ipBlacklist?.expires_at);
    setIpBlacklistExpiry(ipBlacklist?.expires_at?.slice(0, 10) || '');

    setReinstate(false);
  }, [isOpen, token]);

  const handleSubmit = async () => {
    if (!token) return;

    if (anomalyEnabled && !anomalyPermanent && !anomalyExpiry) {
      toast.error('Set an expiry date for anomaly detection bypass or enable Permanent');
      return;
    }
    if (compromiseEnabled && !compromisePermanent && !compromiseExpiry) {
      toast.error('Set an expiry date for compromise detection bypass or enable Permanent');
      return;
    }
    if (ipBlacklistEnabled && !ipBlacklistPermanent && !ipBlacklistExpiry) {
      toast.error('Set an expiry date for IP blacklist bypass or enable Permanent');
      return;
    }

    try {
      await updateBypass({
        token: token.client_id,
        bypass_anomaly_detection: anomalyEnabled,
        bypass_compromise_detection: compromiseEnabled,
        bypass_ip_blacklist: ipBlacklistEnabled,
        ...(anomalyEnabled
          ? {
              bypass_anomaly_detection_expires_at: anomalyPermanent
                ? null
                : new Date(anomalyExpiry).toISOString(),
            }
          : {}),
        ...(compromiseEnabled
          ? {
              bypass_compromise_detection_expires_at: compromisePermanent
                ? null
                : new Date(compromiseExpiry).toISOString(),
            }
          : {}),
        ...(ipBlacklistEnabled
          ? {
              bypass_ip_blacklist_expires_at: ipBlacklistPermanent
                ? null
                : new Date(ipBlacklistExpiry).toISOString(),
            }
          : {}),
        reinstate,
      });

      toast.success(
        reinstate
          ? 'Token reinstated and bypasses updated successfully'
          : 'Bypasses updated successfully'
      );
      onSuccess();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      console.error(
        'Update token bypass error:',
        sanitizeErrorForLogging(error)
      );
    }
  };

  const handleClose = () => {
    if (!isMutating) {
      onClose();
    }
  };

  const renderBypassToggle = (
    label: string,
    description: string,
    enabled: boolean,
    setEnabled: (v: boolean) => void,
    permanent: boolean,
    setPermanent: (v: boolean) => void,
    expiry: string,
    setExpiry: (v: string) => void
  ) => (
    <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <Checkbox
          checked={enabled}
          onCheckedChange={setEnabled}
          className="mt-0.5"
          aria-label={label}
        />
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>

      {enabled && (
        <div className="ml-7 space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={permanent}
              onCheckedChange={setPermanent}
              className="mt-0.5"
              aria-label="Permanent"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">Permanent</p>
              <p className="text-xs text-muted-foreground">
                No expiry date — appears in weekly admin digest until revoked.
              </p>
            </div>
          </div>

          {!permanent && (
            <Input
              label="Expiry date"
              type="date"
              value={expiry}
              onChange={e => setExpiry(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
            />
          )}
        </div>
      )}
    </div>
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={token ? `Manage bypasses — ${token.token_name}` : 'Grant bypass'}
      subtitle={token ? `Token ****${token.token_suffix}` : undefined}
      size="xl"
      maxHeight="max-h-[85vh]"
      contentClassName="pr-2"
      primaryAction={{
        label: 'Save changes',
        onClick: handleSubmit,
        disabled: isMutating || !token,
        loading: isMutating,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: handleClose,
        variant: 'outlined',
        disabled: isMutating,
      }}
    >
      <div className="space-y-4">
        {token && (
          <Card className="p-4">
            <div className="grid gap-3 md:grid-cols-2 text-sm">
              <div>
                <p className="text-muted-foreground">Owner</p>
                <p className="font-medium">{token.owner_name}</p>
                <p className="text-xs text-muted-foreground">
                  {token.owner_email}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Client ID</p>
                <p className="font-mono text-xs">{token.client_id}</p>
              </div>
            </div>
          </Card>
        )}

        <h4 className="text-sm font-semibold text-foreground">
          Anomaly Detection
        </h4>
        {renderBypassToggle(
          'Bypass Anomaly Detection',
          'Exempts from UA change and rate-spike detection.',
          anomalyEnabled,
          setAnomalyEnabled,
          anomalyPermanent,
          setAnomalyPermanent,
          anomalyExpiry,
          setAnomalyExpiry
        )}

        <h4 className="text-sm font-semibold text-foreground">
          Compromise Detection
        </h4>
        {renderBypassToggle(
          'Bypass Compromise Detection',
          'Exempts from high unique-IP count detection.',
          compromiseEnabled,
          setCompromiseEnabled,
          compromisePermanent,
          setCompromisePermanent,
          compromiseExpiry,
          setCompromiseExpiry
        )}

        <h4 className="text-sm font-semibold text-foreground">
          IP Blacklist
        </h4>
        {renderBypassToggle(
          'Bypass IP Blacklist',
          'Exempts from per-request IP blacklist blocking.',
          ipBlacklistEnabled,
          setIpBlacklistEnabled,
          ipBlacklistPermanent,
          setIpBlacklistPermanent,
          ipBlacklistExpiry,
          setIpBlacklistExpiry
        )}

        <div className="rounded-xl border border-border bg-muted/20 p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={reinstate}
              onCheckedChange={setReinstate}
              className="mt-0.5"
              aria-label="Reinstate token"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Reinstate token
              </p>
              <p className="text-xs text-muted-foreground">
                If this token is currently auto-suspended, reinstate it in the
                same call (recommended to avoid re-suspension race condition).
              </p>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
};

const SecurityExemptionsContent: React.FC = () => {
  const {
    data: bypassedTokensResponse,
    error,
    isLoading,
    mutate,
  } = useBypassedTokens();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<BypassedToken | null>(
    null
  );

  const bypassedTokens = useMemo(
    () => bypassedTokensResponse?.bypassed_tokens || [],
    [bypassedTokensResponse]
  );

  const handleEdit = useCallback((token: BypassedToken) => {
    setSelectedToken(token);
    setDialogOpen(true);
  }, []);

  const handleDialogSuccess = useCallback(async () => {
    setDialogOpen(false);
    setSelectedToken(null);
    await mutate();
  }, [mutate]);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshWithToast(
        () => mutate(),
        'Security exemptions refreshed successfully'
      );
    } catch (err) {
      toast.error(getUserFriendlyErrorMessage(err));
    }
  }, [mutate]);

  const rows = useMemo<BypassRow[]>(() => {
    return bypassedTokens.map(token => ({
      ...token,
      id: token.client_id,
    }));
  }, [bypassedTokens]);

  const columns = useMemo(
    () => [
      {
        key: 'token_name',
        label: 'Token Name',
        minWidth: '180px',
        render: (value: unknown, item: BypassRow) => (
          <div>
            <p className="font-medium text-foreground">
              {String(value || '—')}
            </p>
            <code className="text-xs text-muted-foreground font-mono">
              ****{item.token_suffix}
            </code>
          </div>
        ),
      },
      {
        key: 'owner_name',
        label: 'Owner',
        minWidth: '180px',
        render: (value: unknown, item: BypassRow) => (
          <div>
            <p className="text-sm text-foreground">{String(value || '—')}</p>
            <p className="text-xs text-muted-foreground">
              {item.owner_email}
            </p>
          </div>
        ),
      },
      {
        key: 'bypasses',
        label: 'Bypass Types',
        minWidth: '280px',
        render: (value: unknown) => {
          const bypasses = value as BypassEntry[];
          if (!bypasses || bypasses.length === 0) {
            return (
              <span className="text-xs text-muted-foreground">None</span>
            );
          }
          return (
            <div className="flex flex-wrap gap-1.5">
              {bypasses.map(bypass => (
                <span
                  key={bypass.type}
                  className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${BYPASS_COLORS[bypass.type]}`}
                >
                  {BYPASS_LABELS[bypass.type]}
                </span>
              ))}
            </div>
          );
        },
      },
      {
        key: 'expires',
        label: 'Expiry',
        minWidth: '150px',
        render: (_value: unknown, item: BypassRow) => {
          const bypasses = item.bypasses || [];
          if (bypasses.length === 0) {
            return <span className="text-sm text-muted-foreground">—</span>;
          }
          const hasPermanent = bypasses.some(b => !b.expires_at);
          const latestExpiry = bypasses
            .filter(b => b.expires_at)
            .sort(
              (a, b) =>
                new Date(b.expires_at!).getTime() -
                new Date(a.expires_at!).getTime()
            )[0]?.expires_at;

          return (
            <div className="text-sm">
              {hasPermanent && (
                <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                  Permanent
                </span>
              )}
              {!hasPermanent && latestExpiry && (
                <span className="text-muted-foreground">
                  {formatDate(latestExpiry)}
                </span>
              )}
              {hasPermanent && latestExpiry && (
                <span className="text-xs text-muted-foreground block">
                  Latest: {formatDate(latestExpiry)}
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: 'actions',
        label: 'Actions',
        minWidth: '100px',
        cellClassName: 'whitespace-nowrap',
        render: (_value: unknown, item: BypassRow) => (
          <Button
            size="sm"
            variant="outlined"
            onClick={() => handleEdit(item)}
          >
            Manage
          </Button>
        ),
      },
    ],
    [handleEdit]
  );

  if (isForbiddenError(error)) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You do not have the required permissions to manage security exemptions."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Security Exemptions"
        subtitle="Manage per-token bypasses for automated security detectors. Exemptions are admin-only and cannot be self-granted."
      />

      {isLoading ? (
        <LoadingState
          className="min-h-[400px]"
          text="Loading security exemptions..."
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">
                Bypassed tokens
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {bypassedTokens.length}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tokens with at least one active bypass
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">
                Anomaly exemptions
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {
                  bypassedTokens.filter(t =>
                    t.bypasses.some(
                      b => b.type === 'bypass_anomaly_detection'
                    )
                  ).length
                }
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tokens exempt from anomaly detection
              </p>
            </Card>
            <Card className="p-4">
              <p className="text-sm text-muted-foreground">
                Compromise exemptions
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {
                  bypassedTokens.filter(t =>
                    t.bypasses.some(
                      b => b.type === 'bypass_compromise_detection'
                    )
                  ).length
                }
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Tokens exempt from compromise detection
              </p>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button
              size="sm"
              variant="outlined"
              Icon={AqRefreshCw05}
              onClick={handleRefresh}
              loading={isLoading}
            >
              Refresh
            </Button>
          </div>

          <ServerSideTable
            title="Tokens with active security bypasses"
            data={rows}
            columns={columns}
            loading={isLoading}
            error={
              error ? getUserFriendlyErrorMessage(error) : null
            }
            onRefresh={handleRefresh}
            showClientPagination={true}
            pageSize={10}
          />
        </>
      )}

      <BypassGrantDialog
        isOpen={dialogOpen}
        onClose={() => setDialogOpen(false)}
        token={selectedToken}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
};

const SecurityExemptionsPage: React.FC = () => {
  return (
    <PermissionGuard
      requiredPermissions={['SYSTEM_ADMIN']}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need system administrator permissions to manage security exemptions."
    >
      <SecurityExemptionsContent />
    </PermissionGuard>
  );
};

export default SecurityExemptionsPage;
