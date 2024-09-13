import PersonIcon from '@/icons/Settings/person.svg';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DialogWrapper from '../../Modal/DialogWrapper';
import Toast from '@/components/Toast';
import { createClientApi } from '@/core/apis/Settings';
import { addClients, performRefresh } from '@/lib/store/services/apiClient';
import { getUserDetails } from '@/core/apis/Account';
import PlusIcon from '@/icons/Actions/PlusIcon';
import DeleteIcon from '@/icons/Actions/DeleteIcon';

const AddClientForm = ({ open, closeModal }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState({
    isError: false,
    message: '',
    type: '',
  });
  const [clientName, setClientName] = useState('');
  const [ipAddresses, setIpAddresses] = useState(['']);
  const userInfo = useSelector((state) => state.login.userInfo);

  const handleInputValueChange = (type, value, index) => {
    if (type === 'clientName') {
      setClientName(value);
    } else if (type === 'ipAddress') {
      const newIpAddresses = [...ipAddresses];
      newIpAddresses[index] = value;
      setIpAddresses(newIpAddresses);
    }
  };

  const handleRemoveInputValue = (type, index) => {
    if (type === 'clientName') {
      setClientName('');
    } else if (type === 'ipAddress') {
      const newIpAddresses = ipAddresses.filter((_, i) => i !== index);
      setIpAddresses(newIpAddresses);
    }
  };

  const handleAddIpAddress = () => {
    setIpAddresses([...ipAddresses, '']);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const setErrorState = (message) => {
      setIsError({
        isError: true,
        message,
        type: 'error',
      });
    };

    if (!clientName) {
      setErrorState("Client name can't be empty");
      setLoading(false);
      return;
    }

    try {
      const data = {
        name: clientName,
        user_id: userInfo?._id,
      };

      const filteredIpAddresses = ipAddresses.filter((ip) => ip.trim() !== '');
      if (filteredIpAddresses.length > 0) {
        data.ip_addresses = filteredIpAddresses;
      }

      const response = await createClientApi(data);

      if (response.success === true) {
        const res = await getUserDetails(userInfo?._id);

        if (res.success === true) {
          dispatch(addClients(res.users[0].clients));
        }
      }
      dispatch(performRefresh());
      closeModal();
    } catch (error) {
      setErrorState(error?.response?.data?.message || 'Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogWrapper
      open={open}
      onClose={closeModal}
      handleClick={handleSubmit}
      primaryButtonText='Register'
      loading={loading}
      ModalIcon={PersonIcon}>
      {isError?.isError && <Toast type={isError?.type} message={isError?.message} />}
      <h3 className='text-lg font-medium text-secondary-neutral-light-800 leading-[26px] mb-2'>
        Create new client
      </h3>

      <div className='flex flex-col gap-3 justify-start max-h-[350px] overflow-y-auto'>
        <div className='relative'>
          <input
            type='text'
            placeholder='Enter client name'
            className='input input-bordered w-full pl-3 placeholder-shown:text-secondary-neutral-light-300 text-secondary-neutral-light-800 text-sm leading-[26px] border border-secondary-neutral-light-100 bg-secondary-neutral-light-25 rounded'
            value={clientName}
            onChange={(e) => handleInputValueChange('clientName', e.target.value)}
          />
          {clientName && (
            <button
              className='absolute inset-y-0 right-0 flex justify-center items-center mr-3'
              onClick={() => handleRemoveInputValue('clientName')}>
              x
            </button>
          )}
        </div>

        {ipAddresses.map((ip, index) => (
          <div key={index} className='relative'>
            <input
              type='text'
              placeholder={`${index > 0 ? `Enter IP address ${index + 1}` : 'Enter IP address (Optional)'}`}
              className='input input-bordered w-full pl-3 placeholder-shown:text-secondary-neutral-light-300 text-secondary-neutral-light-800 text-sm leading-[26px] border border-secondary-neutral-light-100 bg-secondary-neutral-light-25 rounded'
              value={ip}
              onChange={(e) => handleInputValueChange('ipAddress', e.target.value, index)}
            />
            {index > 0 && (
              <button
                className='absolute inset-y-0 right-0 flex justify-center items-center mr-3'
                onClick={() => handleRemoveInputValue('ipAddress', index)}>
                <DeleteIcon />
              </button>
            )}
          </div>
        ))}

        <button
          onClick={handleAddIpAddress}
          className='flex items-center justify-start text-sm text-blue-600 hover:text-blue-800'>
          <PlusIcon size={16} className='mr-1' fill={'black'} />
          Add another IP address
        </button>
      </div>
    </DialogWrapper>
  );
};

export default AddClientForm;
