'use client';

import React, { useState } from 'react';
import {
  usePendingInvitations,
  useAcceptInvitation,
  useRejectInvitation,
} from '@/shared/hooks';
import { Button, LoadingSpinner, Dialog } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui/toast';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import {
  AqMail04,
  AqCheck,
  AqX,
  AqCalendar,
  AqBuilding02,
} from '@airqo/icons-react';
import { formatDate } from '@/shared/utils';
import SettingsLayout from './SettingsLayout';

interface Invitation {
  invitation_id: string;
  entity: {
    name: string;
    description?: string;
    type: string;
    slug: string;
  };
  inviter: {
    name: string;
    email: string;
  };
  invited_at: string;
  expires_at: string;
}

type ConfirmationAction = 'accept' | 'reject';

interface ConfirmationState {
  isOpen: boolean;
  action: ConfirmationAction | null;
  invitation: Invitation | null;
}

const OrgInvitesTab: React.FC = () => {
  const { data, isLoading, error, mutate } = usePendingInvitations();
  const { trigger: acceptInvitation, isMutating: isAccepting } =
    useAcceptInvitation();
  const { trigger: rejectInvitation, isMutating: isRejecting } =
    useRejectInvitation();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<ConfirmationState>({
    isOpen: false,
    action: null,
    invitation: null,
  });

  const handleAcceptClick = (invitation: Invitation) => {
    setConfirmation({
      isOpen: true,
      action: 'accept',
      invitation,
    });
  };

  const handleRejectClick = (invitation: Invitation) => {
    setConfirmation({
      isOpen: true,
      action: 'reject',
      invitation,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmation.invitation || !confirmation.action) return;

    const invitationId = confirmation.invitation.invitation_id;
    setProcessingId(invitationId);
    setConfirmation({ isOpen: false, action: null, invitation: null });

    try {
      const result =
        confirmation.action === 'accept'
          ? await acceptInvitation({ invitationId })
          : await rejectInvitation({ invitationId });

      if (result.success) {
        toast.success(
          'Success',
          result.message ||
            `Invitation ${confirmation.action === 'accept' ? 'accepted' : 'rejected'} successfully`
        );
        mutate();
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error('Error', getUserFriendlyErrorMessage(error));
    } finally {
      setProcessingId(null);
    }
  };

  const handleCancelAction = () => {
    setConfirmation({ isOpen: false, action: null, invitation: null });
  };

  const invitations = data?.invitations || [];

  const renderInvitationCard = (invitation: Invitation) => (
    <div
      key={invitation.invitation_id}
      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 bg-white dark:bg-gray-800"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
            <AqBuilding02 size={24} className="text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {invitation.entity.name}
            </h3>
            {invitation.entity.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {invitation.entity.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full">
                {invitation.entity.type}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-500">
                @{invitation.entity.slug}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <AqMail04 size={14} />
                <span className="truncate">
                  {invitation.inviter.name} ({invitation.inviter.email})
                </span>
              </div>
              <div className="flex items-center gap-1">
                <AqCalendar size={14} />
                <span>
                  Invited:{' '}
                  {formatDate(invitation.invited_at, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <AqCalendar size={14} />
                <span>
                  Expires:{' '}
                  {formatDate(invitation.expires_at, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 ml-4">
          <Button
            onClick={() => handleAcceptClick(invitation)}
            disabled={
              processingId === invitation.invitation_id ||
              isAccepting ||
              isRejecting
            }
            variant="filled"
            size="sm"
            className="bg-green-600 hover:bg-green-700 disabled:bg-green-300 dark:disabled:bg-green-900"
          >
            <AqCheck size={16} className="mr-1" />
            Accept
          </Button>
          <Button
            onClick={() => handleRejectClick(invitation)}
            disabled={
              processingId === invitation.invitation_id ||
              isAccepting ||
              isRejecting
            }
            variant="outlined"
            size="sm"
            className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <AqX size={16} className="mr-1" />
            Reject
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <SettingsLayout
        title="Organization Invitations"
        description="View and manage all your pending organization invitations. Accept invitations to join organizations and collaborate with other members."
      >
        <div className="space-y-4">
          {isLoading && (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          )}

          {error && !isLoading && (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400 mb-4">
                Failed to load invitations. Please try again.
              </p>
              <Button onClick={() => mutate()} variant="outlined" size="sm">
                Retry
              </Button>
            </div>
          )}

          {!isLoading && !error && invitations.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No pending invitations at this time.
              </p>
            </div>
          )}

          {!isLoading && !error && invitations.length > 0 && (
            <div className="space-y-4">
              {invitations.map(renderInvitationCard)}
            </div>
          )}
        </div>
      </SettingsLayout>

      <Dialog
        isOpen={confirmation.isOpen}
        onClose={handleCancelAction}
        title={
          confirmation.action === 'accept'
            ? 'Accept Invitation'
            : 'Reject Invitation'
        }
        subtitle={
          confirmation.invitation
            ? `Are you sure you want to ${confirmation.action} the invitation from ${confirmation.invitation.entity.name}?`
            : ''
        }
        primaryAction={{
          label: confirmation.action === 'accept' ? 'Accept' : 'Reject',
          onClick: handleConfirmAction,
          variant: confirmation.action === 'accept' ? 'filled' : 'filled',
          className:
            confirmation.action === 'accept'
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-red-600 hover:bg-red-700',
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: handleCancelAction,
          variant: 'outlined',
        }}
        size="md"
      >
        {confirmation.invitation && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <AqBuilding02 size={16} className="text-primary" />
              <span className="font-medium">
                {confirmation.invitation.entity.name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <AqMail04 size={16} />
              <span>Invited by: {confirmation.invitation.inviter.name}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <AqCalendar size={16} />
              <span>
                Expires:{' '}
                {formatDate(confirmation.invitation.expires_at, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
};

export default OrgInvitesTab;
