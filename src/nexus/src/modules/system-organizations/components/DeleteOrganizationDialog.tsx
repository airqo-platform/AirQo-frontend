'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, Input } from '@/shared/components/ui';

export interface DeleteOrganizationDialogProps {
  isOpen: boolean;
  /** Exact name the operator must type before deletion is allowed. */
  groupTitle: string;
  isDeleting: boolean;
  /** Backend failure message (e.g. the 501 response) shown inline. */
  error?: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Confirmation dialog for deleting an organization.
 *
 * Deletion is irreversible, so the confirm action stays disabled until the
 * operator types the organization name exactly. When the backend refuses the
 * delete (staging answers 501) the error is rendered inline and the dialog
 * stays open — the parent only closes it after a successful delete.
 */
const DeleteOrganizationDialog: React.FC<DeleteOrganizationDialogProps> = ({
  isOpen,
  groupTitle,
  isDeleting,
  error,
  onClose,
  onConfirm,
}) => {
  const [confirmText, setConfirmText] = useState('');

  // Start every attempt from a clean input so a previous failure (or a
  // previous organization) never leaves a stale value behind.
  useEffect(() => {
    if (isOpen) {
      setConfirmText('');
    }
  }, [isOpen]);

  const matchesTitle = confirmText === groupTitle;
  const canConfirm = matchesTitle && !isDeleting;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={isDeleting ? () => undefined : onClose}
      title="Delete organization"
      subtitle="This action cannot be undone"
      size="md"
      preventBackdropClose={isDeleting}
      ariaLabel={`Delete organization ${groupTitle}`}
      primaryAction={{
        label: isDeleting ? 'Deleting…' : 'Delete organization',
        variant: 'danger',
        onClick: onConfirm,
        disabled: !canConfirm,
        loading: isDeleting,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
        disabled: isDeleting,
      }}
    >
      <div className="space-y-4">
        <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          <p>
            You are about to permanently delete <strong>{groupTitle}</strong>.
          </p>
          <p className="mt-2">
            All organization data — members, roles and settings — will be
            removed. Members will lose their access to this organization.
          </p>
        </div>

        <Input
          label={`Type “${groupTitle}” to confirm`}
          id="delete-organization-confirm"
          name="delete-organization-confirm"
          value={confirmText}
          onChange={event =>
            setConfirmText(
              typeof event?.target?.value === 'string'
                ? event.target.value
                : ''
            )
          }
          placeholder={groupTitle}
          autoComplete="off"
          disabled={isDeleting}
          description="The name must match exactly."
        />

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <p className="font-medium">Deletion failed</p>
            <p className="mt-1">{error}</p>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default DeleteOrganizationDialog;
