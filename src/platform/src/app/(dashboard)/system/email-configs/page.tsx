'use client';

import React, { useCallback, useMemo, useState } from 'react';
import useSWR from 'swr';
import { Tooltip } from 'flowbite-react';
import {
  AqCopy06,
  AqEdit05,
  AqMail04,
  AqPlus,
  AqRefreshCw05,
  AqTrash01,
} from '@airqo/icons-react';
import { PermissionGuard } from '@/shared/components';
import {
  Button,
  Card,
  EmptyState,
  Input,
  LoadingState,
  PageHeading,
  Select,
  TextInput,
  toast,
} from '@/shared/components/ui';
import Dialog from '@/shared/components/ui/dialog';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { useUser } from '@/shared/hooks';
import { applicationEmailConfigService } from '@/shared/services';
import type { ApplicationEmailConfiguration } from '@/shared/types/api';
import { formatDate } from '@/shared/utils';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { sanitizeErrorForLogging } from '@/shared/utils/sanitizeErrorForLogging';

type EmailConfigMode = 'replace' | 'add' | 'remove';

type EmailConfigFormState = {
  adminCCEmails: string;
  applicationEmails: string;
  mode: EmailConfigMode;
};

type EmailConfigRow = ApplicationEmailConfiguration & {
  id: string;
  [key: string]: unknown;
};

const EMAIL_SPLIT_REGEX = /[,\n;]+/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const DEFAULT_FORM_STATE: EmailConfigFormState = {
  adminCCEmails: '',
  applicationEmails: '',
  mode: 'replace',
};

const parseEmailList = (value: string): string[] => {
  const seen = new Set<string>();

  return value
    .split(EMAIL_SPLIT_REGEX)
    .map(entry => entry.trim().toLowerCase())
    .filter(Boolean)
    .filter(entry => {
      if (seen.has(entry)) {
        return false;
      }

      seen.add(entry);
      return true;
    });
};

const findInvalidEmails = (emails: string[]): string[] => {
  return emails.filter(email => !EMAIL_REGEX.test(email));
};

const formatEmailInput = (emails: string[]): string => {
  return emails.join(', ');
};

const formatEmailTextarea = (emails: string[]): string => {
  return emails.join('\n');
};

const shortenId = (value: string): string => {
  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 6)}…${value.slice(-4)}`;
};

const renderEmailChips = (emails: string[], emptyLabel: string) => {
  if (!emails.length) {
    return <span className="text-sm text-muted-foreground">{emptyLabel}</span>;
  }

  const visibleEmails = emails.slice(0, 3);
  const remainingCount = emails.length - visibleEmails.length;

  return (
    <div className="flex flex-wrap gap-1.5">
      {visibleEmails.map(email => (
        <span
          key={email}
          className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground"
          title={email}
        >
          {email}
        </span>
      ))}
      {remainingCount > 0 && (
        <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
          +{remainingCount} more
        </span>
      )}
    </div>
  );
};

const EmailConfigContent: React.FC = () => {
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogState, setDialogState] = useState<{
    mode: 'create' | 'edit';
    config: ApplicationEmailConfiguration | null;
  } | null>(null);
  const [deleteConfig, setDeleteConfig] =
    useState<ApplicationEmailConfiguration | null>(null);
  const [formState, setFormState] =
    useState<EmailConfigFormState>(DEFAULT_FORM_STATE);

  const {
    data: response,
    error,
    isLoading,
    mutate,
  } = useSWR(
    '/users/application-email-configs',
    () => applicationEmailConfigService.getApplicationEmailConfigurations(),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const configs = useMemo(
    () => response?.applicationEmailConfigurations || [],
    [response]
  );

  const adminCCRecipientCount = useMemo(() => {
    return configs.reduce(
      (count, config) => count + parseEmailList(config.adminCCEmails).length,
      0
    );
  }, [configs]);

  const applicationEmailCount = useMemo(() => {
    return configs.reduce(
      (count, config) => count + (config.applicationEmails?.length || 0),
      0
    );
  }, [configs]);

  const configsWithApplications = useMemo(() => {
    return configs.filter(config => (config.applicationEmails || []).length > 0)
      .length;
  }, [configs]);

  const tableData = useMemo<EmailConfigRow[]>(
    () =>
      configs.map(config => ({
        ...config,
        id: config._id,
      })),
    [configs]
  );

  const openCreateDialog = useCallback(() => {
    setFormState(DEFAULT_FORM_STATE);
    setDialogState({
      mode: 'create',
      config: null,
    });
  }, []);

  const openEditDialog = useCallback(
    (config: ApplicationEmailConfiguration) => {
      setFormState({
        adminCCEmails: config.adminCCEmails || '',
        applicationEmails: formatEmailTextarea(config.applicationEmails || []),
        mode: 'replace',
      });
      setDialogState({
        mode: 'edit',
        config,
      });
    },
    []
  );

  const closeDialog = useCallback(() => {
    setDialogState(null);
    setFormState(DEFAULT_FORM_STATE);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setDeleteConfig(null);
  }, []);

  const handleRefresh = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const handleCopyConfigId = useCallback(async (configId: string) => {
    try {
      await navigator.clipboard.writeText(configId);
      toast.success('Configuration ID copied to clipboard');
    } catch {
      toast.error('Failed to copy configuration ID');
    }
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!dialogState) {
        return;
      }

      const rawAdminCCEmails = formState.adminCCEmails.trim();
      const parsedAdminCCEmails = rawAdminCCEmails
        ? parseEmailList(rawAdminCCEmails)
        : [];
      const invalidAdminEmails = findInvalidEmails(parsedAdminCCEmails);

      if (dialogState.mode === 'create' && !parsedAdminCCEmails.length) {
        toast.error('Add at least one valid admin CC email');
        return;
      }

      if (rawAdminCCEmails && invalidAdminEmails.length > 0) {
        toast.error(
          `Invalid admin CC email${invalidAdminEmails.length > 1 ? 's' : ''}: ${invalidAdminEmails.join(', ')}`
        );
        return;
      }

      const rawApplicationEmails = formState.applicationEmails.trim();
      const parsedApplicationEmails = rawApplicationEmails
        ? parseEmailList(rawApplicationEmails)
        : [];
      const invalidApplicationEmails = findInvalidEmails(
        parsedApplicationEmails
      );

      if (rawApplicationEmails && invalidApplicationEmails.length > 0) {
        toast.error(
          `Invalid application email${invalidApplicationEmails.length > 1 ? 's' : ''}: ${invalidApplicationEmails.join(', ')}`
        );
        return;
      }

      if (
        dialogState.mode === 'edit' &&
        (formState.mode === 'add' || formState.mode === 'remove') &&
        !parsedApplicationEmails.length
      ) {
        toast.error('Add at least one application email to update');
        return;
      }

      const payload: {
        adminCCEmails?: string;
        applicationEmails?: string[];
        addApplicationEmails?: string[];
        removeApplicationEmails?: string[];
      } = {};

      if (parsedAdminCCEmails.length > 0) {
        payload.adminCCEmails = formatEmailInput(parsedAdminCCEmails);
      }

      if (dialogState.mode === 'create') {
        if (parsedApplicationEmails.length > 0) {
          payload.applicationEmails = parsedApplicationEmails;
        }

        setIsSubmitting(true);
        try {
          const result =
            await applicationEmailConfigService.createApplicationEmailConfiguration(
              {
                adminCCEmails:
                  payload.adminCCEmails ||
                  formatEmailInput(parsedAdminCCEmails),
                applicationEmails: payload.applicationEmails,
              }
            );
          toast.success(
            result.message || 'Email configuration created successfully'
          );
          closeDialog();
          await mutate();
        } catch (submitError) {
          toast.error(getUserFriendlyErrorMessage(submitError));
          console.error(
            'Create email configuration error:',
            sanitizeErrorForLogging(submitError)
          );
        } finally {
          setIsSubmitting(false);
        }
        return;
      }

      if (!dialogState.config) {
        return;
      }

      if (formState.mode === 'replace') {
        payload.applicationEmails = parsedApplicationEmails;
      } else if (formState.mode === 'add') {
        payload.addApplicationEmails = parsedApplicationEmails;
      } else if (formState.mode === 'remove') {
        payload.removeApplicationEmails = parsedApplicationEmails;
      }

      setIsSubmitting(true);
      try {
        const result =
          await applicationEmailConfigService.updateApplicationEmailConfiguration(
            dialogState.config._id,
            payload
          );
        toast.success(
          result.message || 'Email configuration updated successfully'
        );
        closeDialog();
        await mutate();
      } catch (submitError) {
        toast.error(getUserFriendlyErrorMessage(submitError));
        console.error(
          'Update email configuration error:',
          sanitizeErrorForLogging(submitError)
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [closeDialog, dialogState, formState, mutate]
  );

  const handleDeleteConfig = useCallback(async () => {
    if (!deleteConfig) {
      return;
    }

    setIsDeleting(true);
    try {
      const result =
        await applicationEmailConfigService.deleteApplicationEmailConfiguration(
          deleteConfig._id
        );
      toast.success(result.message || 'Email configuration deleted');
      closeDeleteDialog();
      await mutate();
    } catch (deleteError) {
      toast.error(getUserFriendlyErrorMessage(deleteError));
      console.error(
        'Delete email configuration error:',
        sanitizeErrorForLogging(deleteError)
      );
    } finally {
      setIsDeleting(false);
    }
  }, [closeDeleteDialog, deleteConfig, mutate]);

  const summaryCards = useMemo(
    () => [
      {
        title: 'Configurations',
        value: configs.length,
        description: 'Saved application email config records',
      },
      {
        title: 'Admin CC recipients',
        value: adminCCRecipientCount,
        description: 'Admins copied on automated alerts',
      },
      {
        title: 'Application emails',
        value: applicationEmailCount,
        description: 'App-account emails currently tracked',
      },
      {
        title: 'Non-empty configs',
        value: configsWithApplications,
        description: 'Configs with at least one application email',
      },
    ],
    [
      adminCCRecipientCount,
      applicationEmailCount,
      configs.length,
      configsWithApplications,
    ]
  );

  const columns = useMemo(
    () => [
      {
        key: '_id',
        label: 'Configuration',
        minWidth: '220px',
        render: (_value: unknown, item: EmailConfigRow) => (
          <div className="flex items-start gap-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                Email config
              </p>
              <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                {shortenId(item._id)}
              </p>
            </div>
            <Tooltip content="Copy configuration ID">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleCopyConfigId(item._id)}
                className="h-8 w-8 p-1"
                aria-label="Copy configuration ID"
              >
                <AqCopy06 className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        ),
      },
      {
        key: 'adminCCEmails',
        label: 'Admin CC emails',
        minWidth: '260px',
        render: (_value: unknown, item: EmailConfigRow) =>
          renderEmailChips(
            parseEmailList(item.adminCCEmails || ''),
            'No admin CC emails'
          ),
      },
      {
        key: 'applicationEmails',
        label: 'Application emails',
        minWidth: '280px',
        render: (_value: unknown, item: EmailConfigRow) =>
          renderEmailChips(
            item.applicationEmails || [],
            'No application emails'
          ),
      },
      {
        key: 'updatedAt',
        label: 'Updated',
        minWidth: '160px',
        cellClassName: 'whitespace-nowrap',
        render: (_value: unknown, item: EmailConfigRow) => {
          const updatedValue = item.updatedAt || item.createdAt || '';

          if (!updatedValue) {
            return <span className="text-sm text-muted-foreground">-</span>;
          }

          return (
            <span className="text-sm text-muted-foreground">
              {formatDate(updatedValue, {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </span>
          );
        },
      },
      {
        key: 'actions',
        label: 'Actions',
        minWidth: '108px',
        cellClassName: 'whitespace-nowrap',
        render: (_value: unknown, item: EmailConfigRow) => (
          <div className="flex gap-1">
            <Tooltip content="Edit configuration">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => openEditDialog(item)}
                className="h-8 w-8 p-1"
                aria-label={`Edit configuration ${shortenId(item._id)}`}
              >
                <AqEdit05 className="h-4 w-4" />
              </Button>
            </Tooltip>
            <Tooltip content="Delete configuration">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setDeleteConfig(item)}
                className="h-8 w-8 p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                aria-label={`Delete configuration ${shortenId(item._id)}`}
              >
                <AqTrash01 className="h-4 w-4" />
              </Button>
            </Tooltip>
          </div>
        ),
      },
    ],
    [handleCopyConfigId, openEditDialog]
  );

  const pageAction = (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        type="button"
        variant="outlined"
        Icon={AqRefreshCw05}
        iconPosition="start"
        onClick={handleRefresh}
      >
        Refresh
      </Button>
      <Button
        type="button"
        Icon={AqPlus}
        iconPosition="start"
        onClick={openCreateDialog}
      >
        Create configuration
      </Button>
    </div>
  );

  return (
    <PermissionGuard
      requiredPermissions={['SUPER_ADMIN']}
      requiredRoles={['AIRQO_SUPER_ADMIN']}
      customCheck={() => !!user?.email?.toLowerCase().endsWith('@airqo.net')}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need the SUPER_ADMIN permission and an @airqo.net super-admin account to manage email configs."
    >
      <div className="space-y-6">
        <PageHeading
          title="Email Configuration"
          subtitle="Maintain the application-account emails that trigger admin CCs on automated notifications."
          action={pageAction}
        />

        {isLoading ? (
          <LoadingState
            className="min-h-[420px]"
            text="Loading email configurations..."
          />
        ) : error ? (
          <Card className="p-6">
            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Failed to load email configurations
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {getUserFriendlyErrorMessage(error)}
                </p>
              </div>
              <div className="flex justify-start">
                <Button
                  type="button"
                  variant="outlined"
                  onClick={handleRefresh}
                  Icon={AqRefreshCw05}
                  iconPosition="start"
                >
                  Try again
                </Button>
              </div>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
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

            {configs.length === 0 ? (
              <EmptyState
                title="No email configurations yet"
                description="Create the first configuration to define the admin CC recipients and application emails for automated notifications."
                icon={<AqMail04 className="h-12 w-12" />}
                action={{
                  label: 'Create configuration',
                  onClick: openCreateDialog,
                  variant: 'filled',
                }}
              />
            ) : (
              <ServerSideTable
                title="Email configurations"
                data={tableData}
                columns={columns}
                loading={false}
                showClientPagination={true}
                compactRows={false}
              />
            )}
          </div>
        )}

        <Dialog
          isOpen={!!dialogState}
          onClose={closeDialog}
          title={
            dialogState?.mode === 'create'
              ? 'Create Email Configuration'
              : 'Edit Email Configuration'
          }
          size="lg"
        >
          <form className="space-y-4" onSubmit={handleSubmit}>
            <Input
              label="Admin CC emails"
              value={formState.adminCCEmails}
              onChange={event =>
                setFormState(prev => ({
                  ...prev,
                  adminCCEmails: String(event.target.value || ''),
                }))
              }
              placeholder="admin1@airqo.net, admin2@airqo.net"
              description="Comma-separated admin emails to copy on automated alerts."
              required={dialogState?.mode === 'create'}
            />

            {dialogState?.mode === 'edit' && (
              <Select
                label="Application email update mode"
                value={formState.mode}
                onChange={event =>
                  setFormState(prev => ({
                    ...prev,
                    mode: String(
                      event.target.value || 'replace'
                    ) as EmailConfigMode,
                  }))
                }
                description="Choose whether to replace the list or add/remove specific emails."
              >
                <option value="replace">Replace full list</option>
                <option value="add">Add application emails</option>
                <option value="remove">Remove application emails</option>
              </Select>
            )}

            <div>
              <TextInput
                label={
                  dialogState?.mode === 'edit'
                    ? formState.mode === 'add'
                      ? 'Application emails to add'
                      : formState.mode === 'remove'
                        ? 'Application emails to remove'
                        : 'Application emails'
                    : 'Application emails'
                }
                value={formState.applicationEmails}
                onChange={event =>
                  setFormState(prev => ({
                    ...prev,
                    applicationEmails: String(event.target.value || ''),
                  }))
                }
                placeholder={'app-client@airqo.net\nmonitoring-bot@airqo.net'}
                rows={6}
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {dialogState?.mode === 'edit'
                  ? formState.mode === 'add'
                    ? 'Add one email per line. These emails will be appended to the existing list.'
                    : formState.mode === 'remove'
                      ? 'Add one email per line. These emails will be removed from the existing list.'
                      : 'Add one email per line. Leaving this blank will clear the current application email list.'
                  : 'Optional. Add one email per line.'}
              </p>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outlined"
                onClick={closeDialog}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {dialogState?.mode === 'create'
                  ? 'Create configuration'
                  : 'Save changes'}
              </Button>
            </div>
          </form>
        </Dialog>

        <Dialog
          isOpen={!!deleteConfig}
          onClose={closeDeleteDialog}
          title="Delete Email Configuration"
          size="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              This will permanently remove the configuration for{' '}
              <span className="font-mono text-foreground">
                {deleteConfig ? shortenId(deleteConfig._id) : ''}
              </span>
              . Any automated alerts using this config will stop copying the
              configured admin CC recipients.
            </p>

            {deleteConfig && (
              <div className="grid gap-3 rounded-lg border border-border bg-muted/40 p-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Admin CC emails
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {parseEmailList(deleteConfig.adminCCEmails || '').length}
                  </p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Application emails
                  </p>
                  <p className="mt-1 text-sm text-foreground">
                    {(deleteConfig.applicationEmails || []).length}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outlined"
                onClick={closeDeleteDialog}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteConfig}
                loading={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete configuration
              </Button>
            </div>
          </div>
        </Dialog>
      </div>
    </PermissionGuard>
  );
};

export default EmailConfigContent;
