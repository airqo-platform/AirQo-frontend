import PersonIcon from '@/icons/Settings/person.svg';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import DialogWrapper from '../../Modal/DialogWrapper';
import Toast from '@/components/Toast';
import { createClientApi } from '@/core/apis/Settings';
import { useDispatch } from 'react-redux';
import { addClients } from '@/lib/store/services/apiClient';
import { getUserDetails } from '@/core/apis/Account';

const AddClientForm = ({ open, closeModal }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState({
    isError: false,
    message: '',
    type: '',
  });
  const [clientName, setClientName] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const userInfo = useSelector((state) => state.login.userInfo);

  const handleInputValueChange = (type, value) => {
    if (type === 'clientName') {
      setClientName(value);
    } else if (type === 'ipAddress') {
      setIpAddress(value);
    }
  };

  const handleRemoveInputValue = (value) => {
    if (value === 'clientName') {
      setClientName('');
    } else if (value === 'ipAddress') {
      setIpAddress('');
    }
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

    // TODO: Handling cases where clientName is empty
    if (!clientName) {
      setIsError({
        isError: true,
        message: "Client name can't be empty",
        type: 'error',
      });
      setLoading(false);
      return;
    }

    try {
      const data = {
        name: clientName,
        user_id: userInfo?._id,
      };

      // Add ipAddress to data if it is not empty
      if (ipAddress) {
        data.ip_address = ipAddress;
      }

      const response = await createClientApi(data);

      if (response.success === true) {
        const res = await getUserDetails(userInfo?._id);

        if (res.success === true) {
          dispatch(addClients(res.users[0].clients));
        }
      }
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
      primaryButtonText={'Register'}
      loading={loading}
      ModalIcon={PersonIcon}>
      {isError?.isError && <Toast type={isError?.type} message={isError?.message} />}
      <h3 className='text-lg font-medium text-secondary-neutral-light-800 leading-[26px] mb-2'>
        Create new client
      </h3>

      <div className='flex flex-col gap-3 justify-start'>
        <div className='relative'>
          <input
            type='text'
            placeholder='Enter client name'
            className='input input-bordered w-full pl-3 placeholder-shown:text-secondary-neutral-light-300 text-secondary-neutral-light-800 text-sm leading-[26px] border border-secondary-neutral-light-100 bg-secondary-neutral-light-25 rounded'
            value={clientName}
            onChange={(e) => handleInputValueChange('clientName', e.target.value)}
          />

          {clientName?.length > 0 && (
            <button
              className='absolute inset-y-0 right-0 flex justify-center items-center mr-3 pointer-events-auto'
              onClick={() => handleRemoveInputValue(clientName)}>
              ✕
            </button>
          )}
        </div>

        <div className='relative'>
          <input
            type='text'
            placeholder='Enter ip address (optional)'
            className='input input-bordered w-full pl-3 placeholder-shown:text-secondary-neutral-light-300 text-secondary-neutral-light-800 text-sm leading-[26px] border border-secondary-neutral-light-100 bg-secondary-neutral-light-25 rounded'
            value={ipAddress}
            onChange={(e) => handleInputValueChange('ipAddress', e.target.value)}
          />

          {ipAddress?.length > 0 && (
            <button
              className='absolute inset-y-0 right-0 flex justify-center items-center mr-3 pointer-events-auto'
              onClick={() => handleRemoveInputValue(ipAddress)}>
              ✕
            </button>
          )}
        </div>
      </div>
    </DialogWrapper>
  );
};

export default AddClientForm;
