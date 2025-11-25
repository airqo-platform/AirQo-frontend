'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input, Dialog } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { isValidIpAddress } from '@/shared/lib/validators';
import { clientService } from '@/shared/services/clientService';
import type { Client } from '@/shared/types/api';

interface EditClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  onSuccess?: () => void;
}

const EditClientDialog: React.FC<EditClientDialogProps> = ({
  isOpen,
  onClose,
  client,
  onSuccess,
}) => {
  const [clientName, setClientName] = useState('');
  const [ipAddresses, setIpAddresses] = useState<string[]>(['']);
  const [ipErrors, setIpErrors] = useState<string[]>(['']);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && client) {
      setClientName(client.name);
      setIpAddresses(
        client.ip_addresses.length > 0 ? client.ip_addresses : ['']
      );
      setIpErrors(
        client.ip_addresses.length > 0
          ? client.ip_addresses.map(() => '')
          : ['']
      );
    }
  }, [isOpen, client]);

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
    if (!client) {
      toast.error('Client data is missing');
      return;
    }
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

      const clientData = {
        name: clientName.trim(),
        ...(filteredIpAddresses.length > 0 && {
          ip_addresses: filteredIpAddresses,
        }),
      };

      await clientService.updateClient(client._id, clientData);
      toast.success('Client updated successfully');
      onSuccess?.();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      console.error('Client update error:', error);
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
      title="Edit API Client"
      primaryAction={{
        label: 'Update',
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

export default EditClientDialog;
