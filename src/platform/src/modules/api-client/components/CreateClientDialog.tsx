'use client';

import React, { useState } from 'react';
import { Button, Input, Dialog } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui';
import { useCreateClient } from '@/shared/hooks/useClient';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { isValidIpAddress } from '@/shared/lib/validators';
import type { CreateClientData } from '../types';

interface CreateClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const CreateClientDialog: React.FC<CreateClientDialogProps> = ({
  isOpen,
  onClose,
  userId,
}) => {
  const [clientName, setClientName] = useState('');
  const [ipAddresses, setIpAddresses] = useState<string[]>(['']);
  const [ipErrors, setIpErrors] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { trigger: createClient } = useCreateClient();

  const handleAddIpAddress = () => {
    setIpAddresses([...ipAddresses, '']);
    setIpErrors([...ipErrors, '']);
  };

  const handleRemoveIpAddress = (index: number) => {
    if (ipAddresses.length > 1) {
      setIpAddresses(ipAddresses.filter((_, i) => i !== index));
      setIpErrors(ipErrors.filter((_, i) => i !== index));
    }
  };

  const handleIpAddressChange = (index: number, value: string) => {
    const newIpAddresses = [...ipAddresses];
    newIpAddresses[index] = value;
    setIpAddresses(newIpAddresses);

    // Clear error when user starts typing
    const newIpErrors = [...ipErrors];
    newIpErrors[index] = '';
    setIpErrors(newIpErrors);
  };

  const handleSubmit = async () => {
    if (!clientName.trim()) {
      toast.error('Client name is required');
      return;
    }

    setIsSubmitting(true);
    try {
      const filteredIpAddresses = ipAddresses.filter(ip => ip.trim() !== '');

      // Validate IP addresses
      const newIpErrors = [...ipErrors];
      let hasErrors = false;
      for (let i = 0; i < ipAddresses.length; i++) {
        const ip = ipAddresses[i].trim();
        if (ip && !isValidIpAddress(ip)) {
          newIpErrors[i] = 'Invalid IP address format';
          hasErrors = true;
        } else {
          newIpErrors[i] = '';
        }
      }
      setIpErrors(newIpErrors);

      if (hasErrors) {
        setIsSubmitting(false);
        return;
      }

      const clientData: CreateClientData = {
        name: clientName.trim(),
        user_id: userId,
        ...(filteredIpAddresses.length > 0 && {
          ip_addresses: filteredIpAddresses,
        }),
      };

      await createClient(clientData);
      toast.success('Client created successfully');
      setClientName('');
      setIpAddresses(['']);
      onClose();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      console.error('Client creation error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setClientName('');
      setIpAddresses(['']);
      setIpErrors(['']);
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New API Client"
      // use built-in footer via primaryAction / secondaryAction
      primaryAction={{
        label: 'Create',
        onClick: handleSubmit,
        disabled: isSubmitting || !clientName.trim(),
        loading: isSubmitting,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: handleClose,
        disabled: isSubmitting,
        variant: 'outlined',
        loading: isSubmitting,
      }}
    >
      <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Client Name *
          </label>
          <Input
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="Enter a descriptive name for your client"
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Choose a name that helps you identify this client later
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            IP Addresses (Optional)
          </label>
          <div className="space-y-2">
            {ipAddresses.map((ip, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="flex-1">
                  <Input
                    value={ip}
                    onChange={e => handleIpAddressChange(index, e.target.value)}
                    placeholder="192.168.1.1"
                    className="w-full"
                  />
                  {ipErrors[index] && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {ipErrors[index]}
                    </p>
                  )}
                </div>
                {ipAddresses.length > 1 && (
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={() => handleRemoveIpAddress(index)}
                    className="px-3"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleAddIpAddress}
              className="w-full"
            >
              + Add IP Address
            </Button>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Restrict access to specific IP addresses (leave empty for no
            restrictions)
          </p>
        </div>
      </div>
    </Dialog>
  );
};

export default CreateClientDialog;
