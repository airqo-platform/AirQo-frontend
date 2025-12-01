'use client';

import React, { useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { Button, Dialog } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui';
import { useInitiateAccountDeletion, useUser } from '@/shared/hooks';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { AqAlertTriangle } from '@airqo/icons-react';

const AccountDeletionCard: React.FC = () => {
  const posthog = usePostHog();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { user } = useUser();
  const { trigger: initiateDeletion, isMutating: deleting } =
    useInitiateAccountDeletion();

  const handleInitiateDeletion = async () => {
    if (!user?.email) {
      toast.error('User email not found');
      return;
    }

    try {
      await initiateDeletion({ email: user.email });

      posthog?.capture('account_deletion_initiated');

      setShowDeleteDialog(false);
      toast.success(
        'Account deletion initiated. Please check your email for confirmation.'
      );
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      toast.error(errorMessage);
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  return (
    <>
      {/* Account Deletion Card */}
      <div className="bg-white border border-red-200 rounded-lg shadow-sm overflow-hidden">
        <div className="px-6 py-5 bg-red-50 border-b border-red-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-600">
                  Permanently delete your account and all associated data
                </p>
              </div>
            </div>
            <Button
              variant="filled"
              onClick={handleDeleteClick}
              className="bg-red-600 hover:bg-red-700 text-white border-red-600 ring-red-600 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete Account"
        subtitle="This action cannot be undone"
        icon={AqAlertTriangle}
        iconColor="text-red-600"
        iconBgColor="bg-red-100"
        primaryAction={{
          label: deleting ? 'Initiating deletion process...' : 'Delete Account',
          onClick: handleInitiateDeletion,
          loading: deleting,
          className:
            'bg-red-600 hover:bg-red-700  ring-red-600 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 text-white',
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => setShowDeleteDialog(false),
        }}
        preventBackdropClose={deleting}
        size="md"
      >
        <div className="space-y-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mb-4">
              <AqAlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-sm text-gray-600">
              You will receive an email with a confirmation link to complete the
              deletion.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-xs text-red-700 font-medium">
              This will permanently delete your account, all data, and remove
              access to all organizations.
            </p>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default AccountDeletionCard;
