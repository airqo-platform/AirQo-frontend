import React, { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useSelector, useDispatch } from 'react-redux';
import DialogWrapper from '../../Modal/DialogWrapper';
import Toast from '@/components/Toast';
import { updateClientApi, getClientsApi } from '@/core/apis/Settings';
import { addClients, addClientsDetails } from '@/lib/store/services/apiClient';
import { getUserDetails } from '@/core/apis/Account';
import PlusIcon from '@/icons/Actions/PlusIcon';
import DeleteIcon from '@/icons/Actions/DeleteIcon';
import PersonIcon from '@/icons/Settings/person.svg';

const EditClientForm = ({ open, closeModal, data }) => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const userInfo = useSelector((state) => state.login.userInfo);
  const clientID = data?._id;
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState({
    isError: false,
    message: '',
    type: '',
  });
  const [clientName, setClientName] = useState('');
  const [ipAddresses, setIpAddresses] = useState(['']);

  // Get user ID from session with fallback to Redux state
  const userId = session?.user?.id || userInfo?.id || userInfo?._id;

  useEffect(() => {
    handleInitialData();
  }, [data]);

  const handleInitialData = () => {
    setClientName(data?.name || '');

    const ipAddresses = Array.isArray(data?.ip_addresses)
      ? data?.ip_addresses
      : data?.ip_addresses
        ? [data?.ip_addresses]
        : [''];

    setIpAddresses(ipAddresses);
  };

  const handleInputValueChange = useCallback((type, value, index) => {
    if (type === 'clientName') {
      setClientName(value);
    } else if (type === 'ipAddress') {
      setIpAddresses((prev) => {
        const newIpAddresses = [...prev];
        newIpAddresses[index] = value;
        return newIpAddresses;
      });
    }
  }, []);

  const handleRemoveInputValue = useCallback((type, index) => {
    if (type === 'clientName') {
      setClientName('');
    } else if (type === 'ipAddress') {
      setIpAddresses((prev) => prev.filter((_, i) => i !== index));
    }
  }, []);

  const handleAddIpAddress = useCallback(() => {
    setIpAddresses((prev) => [...prev, '']);
  }, []);

  const handleSubmit = async () => {
    setLoading(true);

    if (!clientName) {
      setIsError({
        isError: true,
        message: "Client name can't be empty",
        type: 'error',
      });
      setLoading(false);
      return;
    }

    if (!userId) {
      setIsError({
        isError: true,
        message: 'User ID is required',
        type: 'error',
      });
      setLoading(false);
      return;
    }

    try {
      const data = {
        name: clientName,
        user_id: userId,
      };

      const filteredIpAddresses = ipAddresses.filter((ip) => ip.trim() !== '');
      if (filteredIpAddresses.length > 0) {
        data.ip_addresses = filteredIpAddresses;
      }

      const response = await updateClientApi(data, clientID);
      if (response.success !== true) {
        throw new Error('Failed to update client');
      }
      const res = await getUserDetails(userId);
      const resp = await getClientsApi(userId);
      dispatch(addClients(res.users[0].clients));
      dispatch(addClientsDetails(resp.clients));
      closeModal();
    } catch (error) {
      setIsError({
        isError: true,
        message: error?.response?.data?.message || 'Failed to Edit client',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isError.isError) {
      const timer = setTimeout(() => {
        setIsError({
          isError: false,
          message: '',
          type: '',
        });
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [isError.isError]);

  return (
    <DialogWrapper
      open={open}
      onClose={closeModal}
      handleClick={handleSubmit}
      primaryButtonText="Update"
      loading={loading}
      ModalIcon={PersonIcon}
    >
      {isError.isError && (
        <Toast type={isError.type} message={isError.message} />
      )}
      <h3 className="text-lg font-medium text-secondary-neutral-light-800 dark:text-white leading-[26px] mb-2">
        Edit client
      </h3>

      <div className="flex flex-col gap-3 justify-start max-h-[350px] overflow-y-auto">
        <div className="relative">
          <input
            type="text"
            placeholder="Enter client name"
            className="input input-bordered w-full pl-3 dark:bg-transparent dark:text-white placeholder-shown:text-secondary-neutral-light-300 text-secondary-neutral-light-800 text-sm leading-[26px] border border-secondary-neutral-light-100 bg-secondary-neutral-light-25 rounded"
            value={clientName}
            onChange={(e) =>
              handleInputValueChange('clientName', e.target.value)
            }
          />
          {clientName && (
            <button
              className="absolute inset-y-0 right-0 flex justify-center items-center mr-3"
              onClick={() => handleRemoveInputValue('clientName')}
            >
              ✕
            </button>
          )}
        </div>

        {ipAddresses.map((ip, index) => (
          <div key={index} className="relative">
            <input
              type="text"
              placeholder={`Enter IP address ${index + 1}`}
              className="input input-bordered w-full pl-3 dark:bg-transparent dark:text-white placeholder-shown:text-secondary-neutral-light-300 text-secondary-neutral-light-800 text-sm leading-[26px] border border-secondary-neutral-light-100 bg-secondary-neutral-light-25 rounded"
              value={ip}
              onChange={(e) =>
                handleInputValueChange('ipAddress', e.target.value, index)
              }
            />
            <button
              className="absolute inset-y-0 right-0 flex justify-center items-center mr-3"
              onClick={() => handleRemoveInputValue('ipAddress', index)}
            >
              <DeleteIcon fill={'#6b7280'} />
            </button>
          </div>
        ))}

        <button
          onClick={handleAddIpAddress}
          className="flex items-center justify-start text-sm text-[var(--org-primary,var(--color-primary,#145fff))] hover:text-[var(--org-primary-800,var(--color-primary,#145fff))]"
        >
          <PlusIcon size={16} className="mr-1" fill="#6b7280" />
          Add another IP address
        </button>
      </div>
    </DialogWrapper>
  );
};

export default React.memo(EditClientForm);
