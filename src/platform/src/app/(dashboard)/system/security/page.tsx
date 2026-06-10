'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useSWR from 'swr';
import { PermissionGuard } from '@/shared/components';
import {
  Button,
  Card,
  Checkbox,
  Dialog,
  LoadingState,
  PageHeading,
  TextInput,
  toast,
  Input,
} from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { AqEdit05, AqTrash01, AqRefreshCw05, AqPlus } from '@airqo/icons-react';
import { adminService } from '@/shared/services/adminService';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { sanitizeErrorForLogging } from '@/shared/utils/sanitizeErrorForLogging';
import { formatDate } from '@/shared/utils';
import { isValidAsn, isValidCidrNotation } from '@/shared/lib/validators';
import { refreshWithToast } from '@/shared/utils/refreshWithToast';
import type {
  BlockedAsn,
  CreateBlockedAsnRequest,
  FlaggedToken,
} from '@/shared/types/api';

type SecurityTab = 'blocked-asns' | 'flagged-tokens';

type BlockedAsnRow = BlockedAsn & {
  id: string;
  [key: string]: unknown;
};
type FlaggedTokenRow = FlaggedToken & {
  id: string;
  [key: string]: unknown;
};

const fetchAllBlockedAsns = async () => {
  const limit = 100;
  let skip = 0;
  let results: BlockedAsn[] = [];

  while (true) {
    const response = await adminService.getBlockedASNs({ skip, limit });
    const batch = response.blocked_asns || [];
    results = results.concat(batch);
    if (batch.length < limit) {
      break;
    }
    skip += limit;
  }

  return results;
};

const fetchAllFlaggedTokens = async () => {
  const limit = 100;
  let skip = 0;
  let results: FlaggedToken[] = [];

  while (true) {
    const response = await adminService.getFlaggedTokens({ skip, limit });
    const batch = response.flagged_tokens || [];
    results = results.concat(batch);
    if (batch.length < limit) {
      break;
    }
    skip += limit;
  }

  return results;
};

interface StringListEditorProps {
  label: string;
  description: string;
  values: string[];
  errors: string[];
  onChange: (index: number, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  placeholder: string;
}

const StringListEditor: React.FC<StringListEditorProps> = ({
  label,
  description,
  values,
  errors,
  onChange,
  onAdd,
  onRemove,
  placeholder,
}) => {
  return (
    <div className="space-y-2 rounded-xl border border-border bg-muted/20 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <div className="space-y-2">
        {values.map((value, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-1">
              <Input
                value={value}
                onChange={e => onChange(index, e.target.value)}
                placeholder={placeholder}
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
                className="px-3"
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
};

interface BlockedAsnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  entry: BlockedAsn | null;
  onSuccess: () => void;
}

const BlockedAsnDialog: React.FC<BlockedAsnDialogProps> = ({
  isOpen,
  onClose,
  entry,
  onSuccess,
}) => {
  const [provider, setProvider] = useState('');
  const [asn, setAsn] = useState('');
  const [cidrRanges, setCidrRanges] = useState<string[]>(['']);
  const [cidrErrors, setCidrErrors] = useState<string[]>(['']);
  const [reason, setReason] = useState('');
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setProvider(entry?.provider || '');
    setAsn(entry?.asn || '');
    const cidrs = entry?.cidr_ranges || [];
    setCidrRanges(cidrs.length > 0 ? cidrs : ['']);
    setCidrErrors(cidrs.length > 0 ? cidrs.map(() => '') : ['']);
    setReason(entry?.reason || '');
    setActive(entry?.active ?? true);
  }, [entry, isOpen]);

  const handleAddCidr = () => {
    setCidrRanges(previous => [...previous, '']);
    setCidrErrors(previous => [...previous, '']);
  };

  const handleRemoveCidr = (index: number) => {
    if (cidrRanges.length <= 1) {
      return;
    }

    setCidrRanges(previous => previous.filter((_, i) => i !== index));
    setCidrErrors(previous => previous.filter((_, i) => i !== index));
  };

  const handleCidrChange = (index: number, value: string) => {
    setCidrRanges(previous => {
      const next = [...previous];
      next[index] = value;
      return next;
    });

    setCidrErrors(previous => {
      const next = [...previous];
      next[index] = '';
      return next;
    });
  };

  const handleSubmit = async () => {
    const normalizedProvider = provider.trim();
    const normalizedAsn = asn.trim().toUpperCase();
    const normalizedCidrs = cidrRanges
      .map(value => value.trim())
      .filter(Boolean);
    const normalizedReason = reason.trim();

    if (!normalizedProvider) {
      toast.error('Provider is required');
      return;
    }

    if (!normalizedAsn && normalizedCidrs.length === 0) {
      toast.error('Provide either an ASN or at least one CIDR range');
      return;
    }

    if (normalizedAsn && !isValidAsn(normalizedAsn)) {
      toast.error('Enter a valid ASN in the format AS12345');
      return;
    }

    const nextCidrErrors = cidrRanges.map(value => {
      const trimmed = value.trim();
      if (!trimmed) {
        return '';
      }
      return isValidCidrNotation(trimmed)
        ? ''
        : 'Enter a valid IPv4 CIDR range, for example 192.0.2.0/24';
    });
    setCidrErrors(nextCidrErrors);

    if (nextCidrErrors.some(Boolean)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateBlockedAsnRequest = {
        provider: normalizedProvider,
        asn: normalizedAsn || undefined,
        cidr_ranges: normalizedCidrs.length > 0 ? normalizedCidrs : undefined,
        reason: normalizedReason || undefined,
        active,
      };

      await adminService.createBlockedASN(payload);
      toast.success(
        entry
          ? 'Blocked range updated successfully'
          : 'Blocked range created successfully'
      );
      onSuccess();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      console.error('Blocked ASN save error:', sanitizeErrorForLogging(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={entry ? 'Edit blocked ASN/CIDR' : 'Add blocked ASN/CIDR'}
      subtitle="Provider is the unique key used to merge updates."
      size="xl"
      maxHeight="max-h-[85vh]"
      contentClassName="pr-2"
      primaryAction={{
        label: entry ? 'Save changes' : 'Create block',
        onClick: handleSubmit,
        disabled: isSubmitting || !provider.trim(),
        loading: isSubmitting,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: handleClose,
        variant: 'outlined',
        disabled: isSubmitting,
      }}
    >
      <div className="space-y-4">
        <Input
          label="Provider"
          value={provider}
          onChange={e => setProvider(e.target.value)}
          placeholder="Amazon Web Services"
          description="Human-readable provider name, e.g. Cloudflare or DigitalOcean."
          required
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label="ASN"
            value={asn}
            onChange={e => setAsn(e.target.value)}
            placeholder="AS16509"
            description="Optional if CIDR ranges are provided."
          />

          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={active}
                onCheckedChange={setActive}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive entries remain in the list but are not enforced.
                </p>
              </div>
            </div>
          </div>
        </div>

        <StringListEditor
          label="CIDR ranges"
          description="Provide one IPv4 CIDR per row. Leave blank if ASN is enough."
          values={cidrRanges}
          errors={cidrErrors}
          onChange={handleCidrChange}
          onAdd={handleAddCidr}
          onRemove={handleRemoveCidr}
          placeholder="192.0.2.0/24"
        />

        <TextInput
          label="Reason"
          value={reason}
          onChange={e => setReason(e.target.value)}
          placeholder="AWS data-center range"
          rows={4}
        />
      </div>
    </Dialog>
  );
};

interface ResolveFlaggedTokenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  item: FlaggedToken | null;
  onSuccess: () => void;
}

const ResolveFlaggedTokenDialog: React.FC<ResolveFlaggedTokenDialogProps> = ({
  isOpen,
  onClose,
  item,
  onSuccess,
}) => {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setNote(item?.resolution_note || '');
    }
  }, [isOpen, item]);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleResolve = async () => {
    if (!item) {
      toast.error('Flagged token data is unavailable');
      return;
    }

    setIsSubmitting(true);
    try {
      await adminService.resolveFlaggedToken(item._id, {
        note: note.trim() || undefined,
      });
      toast.success('Flagged token resolved successfully');
      onSuccess();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      console.error(
        'Resolve flagged token error:',
        sanitizeErrorForLogging(error)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Resolve flagged token"
      subtitle={
        item ? `${item.token_suffix} · ${item.honeypot_path}` : undefined
      }
      size="lg"
      maxHeight="max-h-[75vh]"
      contentClassName="pr-2"
      primaryAction={{
        label: 'Mark as resolved',
        onClick: handleResolve,
        disabled: isSubmitting || !item,
        loading: isSubmitting,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: handleClose,
        variant: 'outlined',
        disabled: isSubmitting,
      }}
    >
      <div className="space-y-4">
        <Card className="p-4">
          <div className="grid gap-3 md:grid-cols-2 text-sm">
            <div>
              <p className="text-muted-foreground">IP</p>
              <p className="font-mono">{item?.ip || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Service</p>
              <p>{item?.service || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Action taken</p>
              <p>{item?.action_taken || '—'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Flagged at</p>
              <p>{item?.flagged_at ? formatDate(item.flagged_at) : '—'}</p>
            </div>
          </div>
        </Card>

        <TextInput
          label="Resolution note"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Investigated automated scanner. Token owner notified and key rotated."
          rows={5}
        />
      </div>
    </Dialog>
  );
};

const SecurityPageContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SecurityTab>('blocked-asns');
  const [blockedFilter, setBlockedFilter] = useState<
    'all' | 'active' | 'inactive'
  >('all');
  const [flaggedFilter, setFlaggedFilter] = useState<
    'all' | 'open' | 'resolved'
  >('open');
  const [blockedDialogEntry, setBlockedDialogEntry] =
    useState<BlockedAsn | null>(null);
  const [blockedDialogOpen, setBlockedDialogOpen] = useState(false);
  const [resolveDialogEntry, setResolveDialogEntry] =
    useState<FlaggedToken | null>(null);
  const [resolveDialogOpen, setResolveDialogOpen] = useState(false);
  const [deleteDialogEntry, setDeleteDialogEntry] = useState<BlockedAsn | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const {
    data: blockedAsns,
    error: blockedError,
    isLoading: blockedLoading,
    mutate: mutateBlocked,
  } = useSWR('system/security/blocked-asns', fetchAllBlockedAsns, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const {
    data: flaggedTokens,
    error: flaggedError,
    isLoading: flaggedLoading,
    mutate: mutateFlagged,
  } = useSWR('system/security/flagged-tokens', fetchAllFlaggedTokens, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const blockedSummary = useMemo(() => {
    const items = blockedAsns || [];
    return {
      total: items.length,
      active: items.filter(item => item.active).length,
      inactive: items.filter(item => !item.active).length,
    };
  }, [blockedAsns]);

  const flaggedSummary = useMemo(() => {
    const items = flaggedTokens || [];
    return {
      total: items.length,
      open: items.filter(item => !item.resolved).length,
      resolved: items.filter(item => item.resolved).length,
    };
  }, [flaggedTokens]);

  const filteredBlockedRows = useMemo<BlockedAsnRow[]>(() => {
    const items = blockedAsns || [];
    const filtered = items.filter(item => {
      if (blockedFilter === 'active') return item.active;
      if (blockedFilter === 'inactive') return !item.active;
      return true;
    });

    return filtered.map(item => ({ ...item, id: item._id }));
  }, [blockedAsns, blockedFilter]);

  const filteredFlaggedRows = useMemo<FlaggedTokenRow[]>(() => {
    const items = flaggedTokens || [];
    const filtered = items.filter(item => {
      if (flaggedFilter === 'open') return !item.resolved;
      if (flaggedFilter === 'resolved') return item.resolved;
      return true;
    });

    return filtered.map(item => ({ ...item, id: item._id }));
  }, [flaggedTokens, flaggedFilter]);

  const handleEditBlockedAsn = useCallback((entry: BlockedAsn) => {
    setBlockedDialogEntry(entry);
    setBlockedDialogOpen(true);
  }, []);

  const handleDeleteBlockedAsn = useCallback((entry: BlockedAsn) => {
    setDeleteDialogEntry(entry);
    setDeleteDialogOpen(true);
  }, []);

  const handleResolveToken = useCallback((entry: FlaggedToken) => {
    setResolveDialogEntry(entry);
    setResolveDialogOpen(true);
  }, []);

  const handleCreateBlockedAsn = useCallback(() => {
    setBlockedDialogEntry(null);
    setBlockedDialogOpen(true);
  }, []);

  const handleBlockedDialogSuccess = useCallback(async () => {
    setBlockedDialogOpen(false);
    setBlockedDialogEntry(null);
    await mutateBlocked();
  }, [mutateBlocked]);

  const handleResolveDialogSuccess = useCallback(async () => {
    setResolveDialogOpen(false);
    setResolveDialogEntry(null);
    await mutateFlagged();
  }, [mutateFlagged]);

  const handleRefreshBlocked = useCallback(async () => {
    try {
      await refreshWithToast(
        () => mutateBlocked(),
        'Blocked ASN rules refreshed successfully'
      );
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    }
  }, [mutateBlocked]);

  const handleRefreshFlagged = useCallback(async () => {
    try {
      await refreshWithToast(
        () => mutateFlagged(),
        'Flagged tokens refreshed successfully'
      );
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    }
  }, [mutateFlagged]);

  const handleDeleteBlockedAsnConfirm = async () => {
    if (!deleteDialogEntry) {
      return;
    }

    try {
      await adminService.deleteBlockedASN(deleteDialogEntry._id);
      toast.success('Blocked ASN deleted successfully');
      setDeleteDialogOpen(false);
      setDeleteDialogEntry(null);
      await mutateBlocked();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      console.error(
        'Delete blocked ASN error:',
        sanitizeErrorForLogging(error)
      );
    }
  };

  const blockedColumns = useMemo(
    () => [
      {
        key: 'provider',
        label: 'Provider',
        minWidth: '220px',
        render: (_value: unknown, item: BlockedAsnRow) => (
          <div>
            <p className="font-medium text-foreground">{item.provider}</p>
            <p className="text-xs text-muted-foreground">
              {item.asn || 'ASN not provided'}
            </p>
          </div>
        ),
      },
      {
        key: 'cidr_ranges',
        label: 'CIDR ranges',
        minWidth: '260px',
        render: (_value: unknown, item: BlockedAsnRow) => {
          const cidrRanges = item.cidr_ranges ?? [];
          const visible = cidrRanges.slice(0, 2);
          const more = Math.max(0, cidrRanges.length - visible.length);
          return (
            <div className="flex flex-wrap gap-2">
              {visible.map(range => (
                <span
                  key={range}
                  className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-mono"
                >
                  {range}
                </span>
              ))}
              {more > 0 && (
                <span className="text-xs text-muted-foreground">
                  +{more} more
                </span>
              )}
            </div>
          );
        },
      },
      {
        key: 'reason',
        label: 'Reason',
        minWidth: '240px',
        render: (value: unknown) => (
          <span
            className="block max-w-[320px] truncate text-sm text-muted-foreground"
            title={String(value || '')}
          >
            {String(value || '—')}
          </span>
        ),
      },
      {
        key: 'active',
        label: 'Status',
        minWidth: '110px',
        render: (value: unknown, item: BlockedAsnRow) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              item.active
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-800 dark:bg-slate-950/40 dark:text-slate-300'
            }`}
          >
            {item.active ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      {
        key: 'blockedAt',
        label: 'Blocked',
        minWidth: '170px',
        render: (value: unknown) => (
          <span className="text-sm text-muted-foreground">
            {value ? formatDate(String(value)) : '—'}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        minWidth: '120px',
        render: (_value: unknown, item: BlockedAsnRow) => (
          <div className="flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleEditBlockedAsn(item)}
              className="p-1 h-8 w-8"
              aria-label={`Edit blocked range ${item.provider}`}
            >
              <AqEdit05 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDeleteBlockedAsn(item)}
              className="p-1 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
              aria-label={`Delete blocked range ${item.provider}`}
            >
              <AqTrash01 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    [handleDeleteBlockedAsn, handleEditBlockedAsn]
  );

  const flaggedColumns = useMemo(
    () => [
      {
        key: 'token_suffix',
        label: 'Token',
        minWidth: '120px',
        render: (value: unknown) => (
          <code className="rounded bg-muted px-2 py-1 text-xs font-mono">
            ****{String(value || '')}
          </code>
        ),
      },
      {
        key: 'ip',
        label: 'IP',
        minWidth: '140px',
        render: (value: unknown) => (
          <span className="font-mono text-sm">{String(value || '—')}</span>
        ),
      },
      {
        key: 'user_agent',
        label: 'User agent',
        minWidth: '220px',
        maxWidth: '320px',
        render: (value: unknown) => (
          <span
            className="block max-w-[320px] truncate text-sm text-muted-foreground"
            title={String(value || '')}
          >
            {String(value || '—')}
          </span>
        ),
      },
      {
        key: 'honeypot_path',
        label: 'Path',
        minWidth: '220px',
        render: (value: unknown) => (
          <code className="rounded bg-muted px-2 py-1 text-xs">
            {String(value || '—')}
          </code>
        ),
      },
      {
        key: 'service',
        label: 'Service',
        minWidth: '140px',
        render: (value: unknown) => (
          <span className="text-sm text-foreground">
            {String(value || '—')}
          </span>
        ),
      },
      {
        key: 'action_taken',
        label: 'Action',
        minWidth: '120px',
        render: (value: unknown) => (
          <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
            {String(value || '—')}
          </span>
        ),
      },
      {
        key: 'flagged_at',
        label: 'Flagged',
        minWidth: '170px',
        render: (value: unknown) => (
          <span className="text-sm text-muted-foreground">
            {value ? formatDate(String(value)) : '—'}
          </span>
        ),
      },
      {
        key: 'resolved',
        label: 'Status',
        minWidth: '110px',
        render: (_value: unknown, item: FlaggedTokenRow) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              item.resolved
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'
            }`}
          >
            {item.resolved ? 'Resolved' : 'Open'}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        minWidth: '120px',
        render: (_value: unknown, item: FlaggedTokenRow) => (
          <div className="flex gap-1">
            {!item.resolved ? (
              <Button
                size="sm"
                variant="outlined"
                onClick={() => handleResolveToken(item)}
              >
                Resolve
              </Button>
            ) : (
              <span className="text-xs text-muted-foreground">Reviewed</span>
            )}
          </div>
        ),
      },
    ],
    [handleResolveToken]
  );

  const summaryCards = [
    {
      title: 'Blocked entries',
      value: blockedSummary.total,
      description: `${blockedSummary.active} active · ${blockedSummary.inactive} inactive`,
    },
    {
      title: 'Flagged tokens',
      value: flaggedSummary.total,
      description: `${flaggedSummary.open} open · ${flaggedSummary.resolved} resolved`,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeading
        title="System Security"
        subtitle="Manage blocked ASN/CIDR rules and review flagged tokens that hit honeypot routes."
        action={
          activeTab === 'blocked-asns' ? (
            <Button Icon={AqPlus} size="sm" onClick={handleCreateBlockedAsn}>
              Add Blocked ASN
            </Button>
          ) : undefined
        }
      />

      {blockedLoading || flaggedLoading ? (
        <LoadingState
          className="min-h-[400px]"
          text="Loading security data..."
        />
      ) : (
      <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(card => (
          <Card key={card.title} className="p-4">
            <p className="text-sm text-muted-foreground">{card.title}</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {card.value}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {card.description}
            </p>
          </Card>
        ))}
      </div>

      <Card className="p-2">
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant={activeTab === 'blocked-asns' ? 'filled' : 'outlined'}
            onClick={() => setActiveTab('blocked-asns')}
          >
            ASN / CIDR Blocks
          </Button>
          <Button
            size="sm"
            variant={activeTab === 'flagged-tokens' ? 'filled' : 'outlined'}
            onClick={() => setActiveTab('flagged-tokens')}
          >
            Flagged Tokens
          </Button>
        </div>
      </Card>

      {activeTab === 'blocked-asns' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={blockedFilter === 'all' ? 'filled' : 'outlined'}
              onClick={() => setBlockedFilter('all')}
            >
              All ({blockedSummary.total})
            </Button>
            <Button
              size="sm"
              variant={blockedFilter === 'active' ? 'filled' : 'outlined'}
              onClick={() => setBlockedFilter('active')}
            >
              Active ({blockedSummary.active})
            </Button>
            <Button
              size="sm"
              variant={blockedFilter === 'inactive' ? 'filled' : 'outlined'}
              onClick={() => setBlockedFilter('inactive')}
            >
              Inactive ({blockedSummary.inactive})
            </Button>
            <Button
              size="sm"
              variant="outlined"
              Icon={AqRefreshCw05}
              onClick={handleRefreshBlocked}
              className="ml-auto"
            >
              Refresh
            </Button>
          </div>

          <ServerSideTable
            title="Blocked ASN/CIDR rules"
            data={filteredBlockedRows}
            columns={blockedColumns}
            loading={blockedLoading}
            error={
              blockedError ? getUserFriendlyErrorMessage(blockedError) : null
            }
            onRefresh={handleRefreshBlocked}
            showClientPagination={true}
            pageSize={10}
          />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant={flaggedFilter === 'open' ? 'filled' : 'outlined'}
              onClick={() => setFlaggedFilter('open')}
            >
              Open ({flaggedSummary.open})
            </Button>
            <Button
              size="sm"
              variant={flaggedFilter === 'resolved' ? 'filled' : 'outlined'}
              onClick={() => setFlaggedFilter('resolved')}
            >
              Resolved ({flaggedSummary.resolved})
            </Button>
            <Button
              size="sm"
              variant={flaggedFilter === 'all' ? 'filled' : 'outlined'}
              onClick={() => setFlaggedFilter('all')}
            >
              All ({flaggedSummary.total})
            </Button>
            <Button
              size="sm"
              variant="outlined"
              Icon={AqRefreshCw05}
              onClick={handleRefreshFlagged}
              className="ml-auto"
            >
              Refresh
            </Button>
          </div>

          <ServerSideTable
            title="Flagged token alerts"
            data={filteredFlaggedRows}
            columns={flaggedColumns}
            loading={flaggedLoading}
            error={
              flaggedError ? getUserFriendlyErrorMessage(flaggedError) : null
            }
            onRefresh={handleRefreshFlagged}
            showClientPagination={true}
            pageSize={10}
          />
        </div>
      )}
      </>
      )}

      <BlockedAsnDialog
        isOpen={blockedDialogOpen}
        onClose={() => setBlockedDialogOpen(false)}
        entry={blockedDialogEntry}
        onSuccess={handleBlockedDialogSuccess}
      />

      <ResolveFlaggedTokenDialog
        isOpen={resolveDialogOpen}
        onClose={() => setResolveDialogOpen(false)}
        item={resolveDialogEntry}
        onSuccess={handleResolveDialogSuccess}
      />

      <Dialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete blocked ASN"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            Are you sure you want to delete the block for{' '}
            <span className="font-semibold">{deleteDialogEntry?.provider}</span>
            ? This will immediately remove the rule after the backend cache
            expires.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="outlined"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              onClick={handleDeleteBlockedAsnConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
};

const SystemSecurityPage: React.FC = () => {
  return (
    <PermissionGuard
      requireAirQoSuperAdmin={true}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need the AIRQO_SUPER_ADMIN role with an @airqo.net email to manage security controls."
    >
      <SecurityPageContent />
    </PermissionGuard>
  );
};

export default SystemSecurityPage;
