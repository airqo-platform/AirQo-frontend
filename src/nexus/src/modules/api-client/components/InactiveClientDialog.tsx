'use client';

import React from 'react';
import ReusableDialog from '@/shared/components/ui/dialog';
import { toast } from '@/shared/components/ui';
import { useRequestClientActivation } from '@/shared/hooks/useClient';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';

interface InactiveClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  clientId: string;
  clientName: string;
}

const InactiveClientDialog: React.FC<InactiveClientDialogProps> = ({
  isOpen,
  onClose,
  clientId,
  clientName,
}) => {
  const { trigger: requestActivation, isMutating } =
    useRequestClientActivation();

  const handleRequestActivation = async () => {
    try {
      await requestActivation(clientId);
      toast.success('Activation request sent successfully');
      onClose();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      console.error('Failed to request activation:', error);
    }
  };

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title="Inactive Client"
      subtitle={`Client: ${clientName}`}
      size="md"
      primaryAction={{
        label: 'Send Activation Request',
        onClick: handleRequestActivation,
        disabled: isMutating,
        loading: isMutating,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
        variant: 'outlined',
        loading: isMutating,
      }}
    >
      <div className="space-y-4">
        <p className="text-gray-700 dark:text-gray-300">
          You cannot generate a token for an inactive client. Reach out to
          support for assistance at{' '}
          <a
            href="mailto:support@airqo.net"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 underline"
          >
            support@airqo.net
          </a>{' '}
          or send an activation request.
        </p>
      </div>
    </ReusableDialog>
  );
};

export default InactiveClientDialog;
