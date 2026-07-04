'use client';

import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import { FaRegStar, FaStar } from 'react-icons/fa';
import { FiExternalLink } from 'react-icons/fi';
import { PermissionGuard } from '@/shared/components';
import {
  Button,
  Card,
  LoadingState,
  PageHeading,
  Select,
} from '@/shared/components/ui';
import { Input } from '@/shared/components/ui/input';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import { AqArrowLeft } from '@airqo/icons-react';
import { feedbackService } from '@/modules/feedback';
import DOMPurify from 'dompurify';
import { toast } from '@/shared/components/ui/toast';
import {
  getUserFriendlyErrorMessage,
  isForbiddenError,
} from '@/shared/utils/errorMessages';
import { AccessDenied } from '@/shared/components/AccessDenied';
import type {
  FeedbackSubmission,
  FeedbackReply,
  FeedbackWatcher,
} from '@/shared/types/api';

const STATUS_OPTIONS = ['pending', 'reviewed', 'resolved', 'archived'] as const;

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  reviewed: 'Reviewed',
  resolved: 'Resolved',
  archived: 'Archived',
};

const STATUS_STYLES: Record<string, string> = {
  pending:
    'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  reviewed:
    'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
  resolved:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  archived:
    'bg-slate-100 text-slate-800 dark:bg-slate-950/40 dark:text-slate-300',
};

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  pending: ['reviewed', 'archived'],
  reviewed: ['resolved', 'archived'],
  resolved: ['archived'],
  archived: [],
};

const isHtmlEmpty = (html: string): boolean =>
  !html || html.replace(/<[^>]*>/g, '').trim().length === 0;

const CATEGORY_LABELS: Record<string, string> = {
  general: 'General',
  bug: 'Bug',
  feature_request: 'Feature request',
  performance: 'Performance',
  ux_design: 'UX / Design',
  other: 'Other',
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const formatKeyLabel = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, character => character.toUpperCase());

const DetailPanel: React.FC<{
  label: string;
  children: React.ReactNode;
  valueClassName?: string;
}> = ({ label, children, valueClassName = '' }) => (
  <div className="rounded-md border bg-muted/20 p-4">
    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <div className={`mt-2 text-sm text-foreground ${valueClassName}`}>
      {children}
    </div>
  </div>
);

const SectionHeader: React.FC<{
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ title, description, action }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
    {action ? <div className="flex-shrink-0">{action}</div> : null}
  </div>
);

const FeedbackDetailsContent: React.FC<{ feedbackId: string }> = ({
  feedbackId,
}) => {
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();
  const [isUpdating, setIsUpdating] = useState(false);
  const [pendingStatus, setPendingStatus] = useState<string | null>(null);

  const [replyMessage, setReplyMessage] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);

  const [adminNotes, setAdminNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const [assigneeId, setAssigneeId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const [watcherEmail, setWatcherEmail] = useState('');
  const [watcherName, setWatcherName] = useState('');
  const [isAddingWatcher, setIsAddingWatcher] = useState(false);

  const {
    data,
    error,
    isLoading,
    mutate: refreshFeedback,
  } = useSWR(
    feedbackId ? `feedback/submissions/${feedbackId}` : null,
    () => feedbackService.getFeedbackSubmission(feedbackId),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      errorRetryCount: 0,
      dedupingInterval: 5000,
    }
  );

  const { data: staffData, isLoading: staffLoading } = useSWR(
    'feedback/staff',
    () => feedbackService.getFeedbackStaff(),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      shouldRetryOnError: false,
      errorRetryCount: 0,
      dedupingInterval: 60000,
    }
  );

  const staffMembers = useMemo(() => staffData?.staff || [], [staffData?.staff]);

  const staffById = useMemo(() => {
    const map = new Map<string, { firstName: string; lastName: string; email: string }>();
    for (const m of staffMembers) {
      map.set(m._id, m);
    }
    return map;
  }, [staffMembers]);

  const feedback = data?.feedback as FeedbackSubmission | undefined;
  const prevFeedbackIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (feedback && feedbackId !== prevFeedbackIdRef.current) {
      prevFeedbackIdRef.current = feedbackId;
      setAdminNotes(feedback.adminNotes || '');
      setAssigneeId(
        typeof feedback.assignedTo === 'string'
          ? feedback.assignedTo
          : feedback.assignedTo?._id || ''
      );
    }
  }, [feedback, feedbackId]);

  const metadataEntries = useMemo(() => {
    if (!feedback?.metadata) {
      return [];
    }

    return Object.entries(feedback.metadata)
      .filter(([, value]) => {
        if (value === null || value === undefined) {
          return false;
        }

        const normalizedValue = String(value).trim();
        return normalizedValue.length > 0;
      })
      .map(([key, value]) => ({
        key,
        label: formatKeyLabel(key),
        value: String(value),
      }))
      .sort((leftEntry, rightEntry) =>
        leftEntry.label.localeCompare(rightEntry.label)
      );
  }, [feedback?.metadata]);

  const overviewItems = useMemo(
    () => [
      {
        label: 'App',
        value: feedback?.app || '--',
      },
      {
        label: 'Platform',
        value: feedback?.platform || '--',
      },
      {
        label: 'Tenant',
        value: feedback?.tenant || '--',
      },
      {
        label: 'Submission ID',
        value: feedback?._id || '--',
      },
    ],
    [feedback?._id, feedback?.app, feedback?.platform, feedback?.tenant]
  );

  const allowedStatusOptions = useMemo(() => {
    if (!feedback) {
      return [];
    }

    const allowedTransitions = new Set<string>(
      ALLOWED_TRANSITIONS[feedback.status] || []
    );

    return STATUS_OPTIONS.filter(
      status => allowedTransitions.has(status) && status !== feedback.status
    );
  }, [feedback]);

  const rating = Math.max(0, Math.min(5, Number(feedback?.rating || 0)));
  const headingSubtitle = `Submitted by ${feedback?.email || '--'} on ${formatDateTime(
    feedback?.createdAt || new Date().toISOString()
  )}`;

  const refreshAll = useCallback(async () => {
    try {
      await Promise.allSettled([
        refreshFeedback(),
        globalMutate('feedback/submissions'),
      ]);
    } catch {
      // swallow
    }
  }, [refreshFeedback, globalMutate]);

  const handleBack = () => {
    router.push('/system/feedback');
  };

  const handleUpdateStatus = async (status: string) => {
    if (!feedbackId || !feedback) {
      return;
    }

    setIsUpdating(true);
    setPendingStatus(status);
    try {
      await feedbackService.updateFeedbackStatus(feedbackId, status);
      toast.success('Feedback status updated successfully');
      await refreshAll();
    } catch (updateError) {
      toast.error(getUserFriendlyErrorMessage(updateError));
    } finally {
      setIsUpdating(false);
      setPendingStatus(null);
    }
  };

  const handleSendReply = async () => {
    if (!feedbackId || isHtmlEmpty(replyMessage)) return;

    setIsSendingReply(true);
    try {
      await feedbackService.replyToFeedback(feedbackId, {
        message: replyMessage,
      });
      toast.success('Reply sent successfully');
      setReplyMessage('');
      await refreshAll();
    } catch (replyError) {
      toast.error(getUserFriendlyErrorMessage(replyError));
    } finally {
      setIsSendingReply(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!feedbackId) return;

    setIsSavingNotes(true);
    try {
      await feedbackService.updateAdminNotes(feedbackId, {
        adminNotes: adminNotes,
      });
      toast.success('Admin notes saved');
      setIsEditingNotes(false);
      await refreshAll();
    } catch (notesError) {
      toast.error(getUserFriendlyErrorMessage(notesError));
    } finally {
      setIsSavingNotes(false);
    }
  };

  const handleAssign = async () => {
    if (!feedbackId) return;

    setIsAssigning(true);
    try {
      await feedbackService.assignFeedback(feedbackId, {
        userId: assigneeId || null,
      });
      toast.success(assigneeId ? 'Feedback assigned' : 'Assignment removed');
      await refreshAll();
    } catch (assignError) {
      toast.error(getUserFriendlyErrorMessage(assignError));
    } finally {
      setIsAssigning(false);
    }
  };

  const handleAddWatcher = async () => {
    if (!feedbackId || !watcherEmail.trim()) return;

    setIsAddingWatcher(true);
    try {
      await feedbackService.addWatcher(feedbackId, {
        email: watcherEmail.trim(),
        name: watcherName.trim() || undefined,
      });
      toast.success('Watcher added');
      setWatcherEmail('');
      setWatcherName('');
      await refreshAll();
    } catch (watcherError) {
      toast.error(getUserFriendlyErrorMessage(watcherError));
    } finally {
      setIsAddingWatcher(false);
    }
  };

  const handleRemoveWatcher = async (email: string) => {
    if (!feedbackId) return;

    try {
      await feedbackService.removeWatcher(feedbackId, email);
      toast.success('Watcher removed');
      await refreshAll();
    } catch (watcherError) {
      toast.error(getUserFriendlyErrorMessage(watcherError));
    }
  };

  if (isLoading) {
    return (
      <LoadingState
        className="min-h-[400px]"
        text="Loading feedback details..."
      />
    );
  }

  if (error || !feedback) {
    if (isForbiddenError(error)) {
      return (
        <AccessDenied
          title="Access Denied"
          message="You do not have the required permissions to view this feedback submission."
        />
      );
    }
    return (
      <Card className="p-6">
        <p className="text-sm text-muted-foreground">
          {error
            ? getUserFriendlyErrorMessage(error)
            : 'Feedback submission not found.'}
        </p>
      </Card>
    );
  }

  const replies = feedback.replies || [];
  const watchers = feedback.watchers || [];

  return (
    <div className="space-y-6">
      <div className="flex justify-start">
        <Button
          variant="ghost"
          Icon={AqArrowLeft}
          iconPosition="start"
          onClick={handleBack}
        >
          Back to feedback
        </Button>
      </div>

      <PageHeading
        title={feedback.subject}
        subtitle={headingSubtitle}
        action={
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
              STATUS_STYLES[feedback.status] || 'bg-muted text-foreground'
            }`}
          >
            {STATUS_LABELS[feedback.status] || feedback.status}
          </span>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
            {CATEGORY_LABELS[feedback.category] || feedback.category}
          </span>
          <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
            {feedback.platform}
          </span>
          {feedback.app ? (
            <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
              {feedback.app}
            </span>
          ) : null}
          {feedback.actionable && (
            <span className="inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
              Actionable
            </span>
          )}
          <span className="inline-flex items-center gap-2 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
            <span className="flex items-center gap-1 text-amber-500">
              {Array.from({ length: 5 }, (_, index) =>
                index < rating ? (
                  <FaStar key={index} className="h-3.5 w-3.5" />
                ) : (
                  <FaRegStar
                    key={index}
                    className="h-3.5 w-3.5 text-muted-foreground"
                  />
                )
              )}
            </span>
            <span>{rating}/5</span>
          </span>
        </div>
      </PageHeading>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-6">
          <div className="space-y-6">
            <SectionHeader
              title="Overview"
              description="Core submission details and triage context."
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DetailPanel
                label="Reporter"
                valueClassName="break-all font-medium"
              >
                {feedback.email}
              </DetailPanel>
              <DetailPanel label="Submitted" valueClassName="font-medium">
                {formatDateTime(feedback.createdAt)}
              </DetailPanel>
              <DetailPanel label="Updated" valueClassName="font-medium">
                {formatDateTime(feedback.updatedAt)}
              </DetailPanel>
              <DetailPanel label="Rating">
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }, (_, index) =>
                      index < rating ? (
                        <FaStar key={index} className="h-4 w-4" />
                      ) : (
                        <FaRegStar
                          key={index}
                          className="h-4 w-4 text-muted-foreground"
                        />
                      )
                    )}
                  </span>
                  <span className="font-medium text-foreground">
                    {rating}/5
                  </span>
                </div>
              </DetailPanel>
              {overviewItems.map(item => (
                <DetailPanel
                  key={item.label}
                  label={item.label}
                  valueClassName="break-all font-medium"
                >
                  {item.value}
                </DetailPanel>
              ))}
              {feedback.reminderCount != null && feedback.reminderCount > 0 && (
                <DetailPanel label="Reminders sent" valueClassName="font-medium">
                  {feedback.reminderCount}×
                  {feedback.reminderSentAt && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      (last: {formatDateTime(feedback.reminderSentAt)})
                    </span>
                  )}
                </DetailPanel>
              )}
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-6">
            <SectionHeader
              title="Workflow"
              description="Move this feedback through the normal review process."
            />

            <DetailPanel label="Current status">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${
                  STATUS_STYLES[feedback.status] || 'bg-muted text-foreground'
                }`}
              >
                {STATUS_LABELS[feedback.status] || feedback.status}
              </span>
            </DetailPanel>

            <div className="grid gap-2">
              {allowedStatusOptions.map(status => (
                <Button
                  key={status}
                  variant="outlined"
                  loading={isUpdating && pendingStatus === status}
                  disabled={isUpdating}
                  onClick={() => void handleUpdateStatus(status)}
                  fullWidth
                >
                  Move to {STATUS_LABELS[status]}
                </Button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2 p-6">
          <div className="space-y-4">
            <SectionHeader
              title="Customer message"
              description="Review the full submission exactly as it was captured."
            />

            <div className="rounded-md border bg-muted/20 p-4">
              <p className="whitespace-pre-wrap text-sm leading-7 text-foreground">
                {feedback.message ||
                  'No message was included with this submission.'}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <SectionHeader
              title="Metadata"
              description="Environment details included with the submission."
            />

            {metadataEntries.length > 0 ? (
              <div className="grid gap-3">
                {metadataEntries.map(entry => (
                  <DetailPanel
                    key={entry.key}
                    label={entry.label}
                    valueClassName="break-words font-medium"
                  >
                    {entry.value}
                  </DetailPanel>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-dashed bg-muted/10 px-4 py-6 text-sm text-muted-foreground">
                No metadata was included with this submission.
              </div>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <SectionHeader
            title="Screenshot"
            description="Visual context captured alongside the submission."
            action={
              feedback.screenshot_url ? (
                <a
                  href={feedback.screenshot_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                >
                  Open full image
                  <FiExternalLink className="h-4 w-4" />
                </a>
              ) : null
            }
          />

          {feedback.screenshot_url ? (
            <div className="rounded-md border bg-muted/20 p-3">
              <div className="relative aspect-[16/9] overflow-hidden rounded-md bg-muted">
                <Image
                  src={feedback.screenshot_url}
                  alt={`Screenshot attached to feedback ${feedback.subject}`}
                  fill
                  sizes="(min-width: 1280px) 75vw, 100vw"
                  className="object-contain"
                />
              </div>
            </div>
          ) : (
            <div className="flex min-h-[240px] items-center justify-center rounded-md border border-dashed bg-muted/10 px-6 py-10 text-center">
              <div className="max-w-sm space-y-2">
                <p className="text-sm font-medium text-foreground">
                  No screenshot attached
                </p>
                <p className="text-sm text-muted-foreground">
                  This submission did not include an image, so review will rely
                  on the message and metadata.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="space-y-4">
            <SectionHeader
              title="Reply to submitter"
              description="Send a reply email directly to the person who submitted this feedback."
            />

            <RichTextEditor
              value={replyMessage}
              onChange={setReplyMessage}
              placeholder="Type your reply..."
              label="Reply message"
            />

            <Button
              loading={isSendingReply}
              disabled={isHtmlEmpty(replyMessage)}
              onClick={() => void handleSendReply()}
            >
              Send reply
            </Button>

            {replies.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Previous replies ({replies.length})
                </p>
                <div className="max-h-[400px] space-y-3 overflow-y-auto pr-1">
                  {replies.map((reply: FeedbackReply, index: number) => (
                    <div
                      key={`${reply.sentAt}-${index}`}
                      className="rounded-md border bg-muted/20 p-3"
                    >
                      <div
                        className="prose prose-sm max-w-none text-sm text-foreground"
                        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(reply.message) }}
                      />
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{reply.adminEmail}</span>
                        <span>·</span>
                        <span>{formatDateTime(reply.sentAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <SectionHeader
              title="Admin notes"
              description="Internal notes for the team. These are never shown to the submitter."
              action={
                !isEditingNotes ? (
                  <Button
                    variant="ghost"
                    paddingStyles="h-8 px-3"
                    onClick={() => {
                      setIsEditingNotes(true);
                    }}
                  >
                    Edit notes
                  </Button>
                ) : undefined
              }
            />

            {isEditingNotes ? (
              <>
                <RichTextEditor
                  value={adminNotes}
                  onChange={setAdminNotes}
                  placeholder="Add internal notes about this feedback..."
                  label="Notes"
                />

                <div className="flex gap-3">
                  <Button
                    loading={isSavingNotes}
                    disabled={isHtmlEmpty(adminNotes)}
                    onClick={() => void handleSaveNotes()}
                  >
                    Save notes
                  </Button>
                  <Button
                    variant="ghost"
                    disabled={isSavingNotes}
                    onClick={() => {
                      setAdminNotes(feedback?.adminNotes || '');
                      setIsEditingNotes(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </>
            ) : feedback?.adminNotes ? (
              <div className="rounded-md border bg-muted/20 p-4">
                <div
                  className="prose prose-sm max-w-none text-sm text-foreground"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(feedback.adminNotes) }}
                />
              </div>
            ) : (
              <div className="rounded-md border border-dashed bg-muted/10 px-4 py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  No notes yet. Click &quot;Edit notes&quot; to add internal
                  context for the team.
                </p>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Card className="p-6">
          <div className="space-y-4">
            <SectionHeader
              title="Assignment"
              description="Assign this feedback to a team member. They will receive an email notification."
            />

            <div className="flex items-end gap-3">
              <Select
                label="Assignee"
                value={assigneeId}
                onChange={e =>
                  setAssigneeId(
                    (e as React.ChangeEvent<HTMLSelectElement>).target
                      .value as string
                  )
                }
                placeholder={
                  staffLoading
                    ? 'Loading staff...'
                    : 'Select a team member'
                }
                disabled={staffLoading || isAssigning}
                containerClassName="!mb-0 flex-1"
              >
                <option value="">Unassigned</option>
                {staffMembers.map(
                  (member: {
                    _id: string;
                    firstName: string;
                    lastName: string;
                    email: string;
                  }) => (
                    <option key={member._id} value={member._id}>
                      {member.firstName} {member.lastName} ({member.email})
                    </option>
                  )
                )}
              </Select>
              <Button
                loading={isAssigning}
                onClick={() => void handleAssign()}
              >
                {assigneeId ? 'Assign' : 'Unassign'}
              </Button>
            </div>

            {feedback.assignedTo && (
              <div className="rounded-md border bg-muted/20 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Currently assigned to
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {(() => {
                    const assigned = feedback.assignedTo;
                    if (typeof assigned === 'string') {
                      const resolved = staffById.get(assigned);
                      return resolved
                        ? `${resolved.firstName} ${resolved.lastName} (${resolved.email})`
                        : assigned;
                    }
                    return `${assigned.firstName} ${assigned.lastName} (${assigned.email})`;
                  })()}
                </p>
                {feedback.assignedAt && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Assigned on {formatDateTime(feedback.assignedAt)}
                    {feedback.assignedBy && (
                      <> by {(() => {
                        const by = feedback.assignedBy;
                        if (typeof by === 'string') {
                          const resolved = staffById.get(by);
                          return resolved ? resolved.email : by;
                        }
                        return by.email;
                      })()}</>
                    )}
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <div className="space-y-4">
            <SectionHeader
              title="Watchers"
              description="Stakeholders who receive email notifications on status changes and replies."
            />

            <div className="space-y-3">
              <Input
                id="watcher-email"
                label="Watcher email"
                placeholder="email@example.com"
                value={watcherEmail}
                onChange={e =>
                  setWatcherEmail(
                    (e as React.ChangeEvent<HTMLInputElement>).target.value
                  )
                }
              />
              <Input
                id="watcher-name"
                label="Watcher name (optional)"
                placeholder="Product Manager"
                value={watcherName}
                onChange={e =>
                  setWatcherName(
                    (e as React.ChangeEvent<HTMLInputElement>).target.value
                  )
                }
              />
              <Button
                loading={isAddingWatcher}
                disabled={!watcherEmail.trim()}
                onClick={() => void handleAddWatcher()}
              >
                Add watcher
              </Button>
            </div>

            {watchers.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Current watchers ({watchers.length})
                </p>
                {watchers.map((watcher: FeedbackWatcher) => (
                  <div
                    key={watcher.email}
                    className="flex items-center justify-between rounded-md border bg-muted/20 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {watcher.name || watcher.email}
                      </p>
                      {watcher.name && (
                        <p className="text-xs text-muted-foreground">
                          {watcher.email}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      paddingStyles="h-7 px-2"
                      onClick={() => void handleRemoveWatcher(watcher.email)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No watchers added yet.
              </p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

const FeedbackDetailsPage: React.FC = () => {
  const params = useParams<{ feedbackId: string }>();
  const router = useRouter();
  const feedbackId = params?.feedbackId;

  useEffect(() => {
    if (!feedbackId) {
      router.push('/system/feedback');
    }
  }, [feedbackId, router]);

  return (
    <PermissionGuard
      requiredPermissions={['SYSTEM_ADMIN', 'SUPER_ADMIN']}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need system administration permissions to review feedback submissions."
    >
      {feedbackId ? <FeedbackDetailsContent feedbackId={feedbackId} /> : null}
    </PermissionGuard>
  );
};

export default FeedbackDetailsPage;
