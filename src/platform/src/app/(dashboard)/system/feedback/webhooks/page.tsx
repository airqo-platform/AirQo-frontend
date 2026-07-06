'use client';

import React, { useState, useCallback } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { PermissionGuard } from '@/shared/components';
import {
  Button,
  Card,
  LoadingState,
  PageHeading,
} from '@/shared/components/ui';
import { Input } from '@/shared/components/ui/input';
import Checkbox from '@/shared/components/ui/checkbox';
import { feedbackService } from '@/modules/feedback';
import { toast } from '@/shared/components/ui/toast';
import {
  getUserFriendlyErrorMessage,
  isForbiddenError,
} from '@/shared/utils/errorMessages';
import { AccessDenied } from '@/shared/components/AccessDenied';
import type { FeedbackWebhook } from '@/shared/types/api';
import {
  WEBHOOK_NAME_MAX,
  WEBHOOK_URL_MAX,
  WEBHOOK_SECRET_MAX,
} from '@/shared/lib/validation-limits';

const WEBHOOK_EVENT_OPTIONS = [
  { value: 'feedback.submitted', label: 'Feedback Submitted' },
  { value: 'feedback.status_changed', label: 'Status Changed' },
  { value: 'feedback.reply_added', label: 'Reply Added' },
  { value: 'feedback.assigned', label: 'Assigned' },
  { value: 'feedback.bulk_status_changed', label: 'Bulk Status Changed' },
  { value: 'feedback.watcher_added', label: 'Watcher Added' },
];

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const WebhookForm: React.FC<{
  initialData?: FeedbackWebhook;
  onSubmit: (data: {
    name: string;
    url: string;
    events: string[];
    secret?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}> = ({ initialData, onSubmit, onCancel, isSubmitting }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [url, setUrl] = useState(initialData?.url || '');
  const [secret, setSecret] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(
    new Set(initialData?.events || [])
  );

  const handleToggleEvent = useCallback((event: string, checked: boolean) => {
    setSelectedEvents(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(event);
      } else {
        next.delete(event);
      }
      return next;
    });
  }, []);

  const handleSubmit = async () => {
    if (!name.trim() || !url.trim() || selectedEvents.size === 0) return;
    if (!initialData && !secret.trim()) return;

    await onSubmit({
      name: name.trim(),
      url: url.trim(),
      events: Array.from(selectedEvents),
      ...(initialData ? {} : { secret: secret.trim() }),
    });
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <Input
          id="webhook-name"
          label="Name"
          placeholder="My Webhook"
          value={name}
          onChange={e =>
            setName((e as React.ChangeEvent<HTMLInputElement>).target.value)
          }
          maxLength={WEBHOOK_NAME_MAX}
        />
        <Input
          id="webhook-url"
          label="URL"
          placeholder="https://example.com/webhook"
          value={url}
          onChange={e =>
            setUrl((e as React.ChangeEvent<HTMLInputElement>).target.value)
          }
          maxLength={WEBHOOK_URL_MAX}
        />
        {!initialData && (
          <Input
            id="webhook-secret"
            label="Secret"
            type="password"
            autoComplete="new-password"
            placeholder="Min 16 characters"
            value={secret}
            onChange={e =>
              setSecret((e as React.ChangeEvent<HTMLInputElement>).target.value)
            }
            maxLength={WEBHOOK_SECRET_MAX}
          />
        )}

        <div>
          <p className="mb-2 text-sm text-foreground">Events</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {WEBHOOK_EVENT_OPTIONS.map(option => (
              <label
                key={option.value}
                className="flex items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={selectedEvents.has(option.value)}
                  onCheckedChange={checked =>
                    handleToggleEvent(option.value, checked as boolean)
                  }
                />
                {option.label}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            loading={isSubmitting}
            disabled={
              !name.trim() ||
              !url.trim() ||
              selectedEvents.size === 0 ||
              (!initialData && !secret.trim())
            }
            onClick={() => void handleSubmit()}
          >
            {initialData ? 'Update webhook' : 'Register webhook'}
          </Button>
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </div>
    </Card>
  );
};

const WebhooksContent: React.FC = () => {
  const { mutate: globalMutate } = useSWRConfig();
  const [showForm, setShowForm] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<
    FeedbackWebhook | undefined
  >();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data,
    error,
    isLoading,
    mutate: refreshWebhooks,
  } = useSWR('feedback/webhooks', () => feedbackService.getWebhooks(), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const webhooks = data?.webhooks || [];

  const refreshAll = useCallback(async () => {
    try {
      await Promise.allSettled([
        refreshWebhooks(),
        globalMutate('feedback/submissions'),
      ]);
    } catch {
      // swallow
    }
  }, [refreshWebhooks, globalMutate]);

  const handleCreate = useCallback(
    async (formData: {
      name: string;
      url: string;
      events: string[];
      secret?: string;
    }) => {
      setIsSubmitting(true);
      try {
        await feedbackService.registerWebhook({
          name: formData.name,
          url: formData.url,
          events: formData.events,
          secret: formData.secret!,
        });
        toast.success('Webhook registered successfully');
        setShowForm(false);
        await refreshAll();
      } catch (createError) {
        toast.error(getUserFriendlyErrorMessage(createError));
      } finally {
        setIsSubmitting(false);
      }
    },
    [refreshAll]
  );

  const handleUpdate = useCallback(
    async (formData: { name: string; url: string; events: string[] }) => {
      if (!editingWebhook) return;

      setIsSubmitting(true);
      try {
        await feedbackService.updateWebhook(editingWebhook._id, {
          name: formData.name,
          url: formData.url,
          events: formData.events,
        });
        toast.success('Webhook updated successfully');
        setEditingWebhook(undefined);
        setShowForm(false);
        await refreshAll();
      } catch (updateError) {
        toast.error(getUserFriendlyErrorMessage(updateError));
      } finally {
        setIsSubmitting(false);
      }
    },
    [editingWebhook, refreshAll]
  );

  const handleDelete = useCallback(
    async (webhookId: string) => {
      try {
        await feedbackService.deleteWebhook(webhookId);
        toast.success('Webhook deleted');
        await refreshAll();
      } catch (deleteError) {
        toast.error(getUserFriendlyErrorMessage(deleteError));
      }
    },
    [refreshAll]
  );

  const handleToggleActive = useCallback(
    async (webhook: FeedbackWebhook) => {
      try {
        await feedbackService.updateWebhook(webhook._id, {
          active: !webhook.active,
        });
        toast.success(
          `Webhook ${webhook.active ? 'deactivated' : 'activated'}`
        );
        await refreshAll();
      } catch (toggleError) {
        toast.error(getUserFriendlyErrorMessage(toggleError));
      }
    },
    [refreshAll]
  );

  if (isLoading) {
    return (
      <LoadingState className="min-h-[400px]" text="Loading webhooks..." />
    );
  }

  if (isForbiddenError(error)) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You do not have the required permissions to manage webhooks."
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
        title="Feedback Webhooks"
        subtitle="Register external endpoints to receive notifications for feedback events."
        action={
          !showForm && !editingWebhook ? (
            <Button
              onClick={() => {
                setEditingWebhook(undefined);
                setShowForm(true);
              }}
            >
              Register webhook
            </Button>
          ) : undefined
        }
      />

      {(showForm || editingWebhook) && (
        <WebhookForm
          key={editingWebhook?._id ?? 'new'}
          initialData={editingWebhook}
          onSubmit={editingWebhook ? handleUpdate : handleCreate}
          onCancel={() => {
            setShowForm(false);
            setEditingWebhook(undefined);
          }}
          isSubmitting={isSubmitting}
        />
      )}

      {webhooks.length === 0 && !showForm ? (
        <Card className="p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">
              No webhooks registered
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Register a webhook to start receiving feedback event
              notifications.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {webhooks.map(webhook => (
            <Card key={webhook._id} className="p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-foreground">
                      {webhook.name}
                    </p>
                    <span
                      className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        webhook.active
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-800 dark:bg-slate-950/40 dark:text-slate-300'
                      }`}
                    >
                      {webhook.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {webhook.url}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {webhook.events.map(event => (
                      <span
                        key={event}
                        className="inline-flex rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-foreground"
                      >
                        {event}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Created {formatDateTime(webhook.createdAt)}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="ghost"
                    paddingStyles="h-7 px-2"
                    onClick={() => void handleToggleActive(webhook)}
                  >
                    {webhook.active ? 'Deactivate' : 'Activate'}
                  </Button>
                  <Button
                    variant="ghost"
                    paddingStyles="h-7 px-2"
                    onClick={() => {
                      setEditingWebhook(webhook);
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    paddingStyles="h-7 px-2"
                    onClick={() => void handleDelete(webhook._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const WebhooksPage: React.FC = () => {
  return (
    <PermissionGuard
      requiredPermissions={['SYSTEM_ADMIN', 'SUPER_ADMIN']}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need system administration permissions to manage feedback webhooks."
    >
      <WebhooksContent />
    </PermissionGuard>
  );
};

export default WebhooksPage;
