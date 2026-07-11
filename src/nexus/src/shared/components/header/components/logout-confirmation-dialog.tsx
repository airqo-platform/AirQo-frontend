'use client';

import React from 'react';
import { AqLogOut02 } from '@airqo/icons-react';
import { Dialog } from '@/shared/components/ui';

interface LogoutConfirmationDialogProps {
  isOpen: boolean;
  isLoggingOut: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutConfirmationDialog: React.FC<LogoutConfirmationDialogProps> = ({
  isOpen,
  isLoggingOut,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Log out"
      subtitle="You will need to sign in again to continue"
      icon={AqLogOut02}
      iconColor="text-amber-600"
      iconBgColor="bg-amber-100"
      primaryAction={{
        label: isLoggingOut ? 'Logging out...' : 'Log out',
        onClick: onConfirm,
        loading: isLoggingOut,
        className:
          'bg-amber-600 hover:bg-amber-700 ring-amber-600 outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 text-white',
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
        disabled: isLoggingOut,
      }}
      preventBackdropClose={isLoggingOut}
      size="md"
    >
      <p className="text-sm text-muted-foreground">
        Are you sure you want to log out of your account?
      </p>
    </Dialog>
  );
};

export default LogoutConfirmationDialog;
