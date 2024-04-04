import { useEffect, useState } from 'react';
import Skeleton from '../../Collocation/DeviceStatus/Table/Skeleton';
import moment from 'moment';
import { getUserDetails } from '@/core/apis/Account';
import EditIcon from '@/icons/Common/edit-pencil.svg';
import { useSelector } from 'react-redux';
import Toast from '@/components/Toast';
import { addClients } from '@/lib/store/services/apiClient';
import { isEmpty } from 'underscore';
import { useDispatch } from 'react-redux';
import EditClientForm from './EditClientForm';

const ClientsTable = () => {
  const dispatch = useDispatch();
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [openEditForm, setOpenEditForm] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const userInfo = useSelector((state) => state.login.userInfo);
  const clients = useSelector((state) => state.apiClient.clients);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      if (isEmpty(clients)) {
        try {
          const res = await getUserDetails(userInfo?._id);
          if (res.success === true) {
            dispatch(addClients(res.users[0].clients));
          }
        } catch (error) {
          console.error(error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className='overflow-x-scroll'>
      {showAlert && <Toast type={'success'} message={'Token copied to clipboard!'} />}
      <table
        className='border-collapse rounded-lg text-xs text-left w-full mb-6'
        data-testid='settings-clients-table'
      >
        <thead>
          <tr className='text-secondary-neutral-light-500 text-xs border-y border-y-secondary-neutral-light-100 bg-secondary-neutral-light-25'>
            <th scope='col' className='font-medium w-[200px] px-4 py-3 opacity-40'>
              Client name
            </th>
            <th scope='col' className='font-medium w-[138px] px-4 py-3 opacity-40'>
              IP Address
            </th>
            <th scope='col' className='font-medium w-[138px] px-4 py-3 opacity-40'>
              Status
            </th>
            <th scope='col' className='font-medium w-[138px] px-4 py-3 opacity-40'>
              Created date
            </th>
            <th scope='col' className='font-medium w-[138px] px-4 py-3 opacity-40'>
              Generate token
            </th>
            <th scope='col' className='font-medium w-24 px-4 py-3 opacity-40'></th>
          </tr>
        </thead>

        {isLoading ? (
          <Skeleton />
        ) : (
          <tbody>
            {clients?.length > 0 ? (
              clients?.map((client, index) => {
                return (
                  <tr className={`border-b border-b-secondary-neutral-light-100`} key={index}>
                    <td
                      scope='row'
                      className='w-[200px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-800'
                    >
                      {client?.name}
                    </td>
                    <td
                      scope='row'
                      className='w-[138px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400'
                    >
                      {client?.ip_address}
                    </td>
                    <td scope='row' className='w-[138px] px-4 py-3'>
                      <div
                        className={`px-2 py-[2px] rounded-2xl w-auto inline-flex justify-center text-sm leading-5 items-center mx-auto ${
                          client?.isActive
                            ? 'bg-success-50 text-success-700'
                            : 'bg-secondary-neutral-light-50 text-secondary-neutral-light-500'
                        }`}
                      >
                        {client?.isActive ? 'Activated' : 'Not Activated'}
                      </div>
                    </td>
                    <td
                      scope='row'
                      className='w-[138px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400'
                    >
                      {moment(client?.createdAt).format('MMM DD, YYYY')}
                    </td>
                    <td scope='row' className='w-[138px] px-4 py-3'>
                      <div
                        title={
                          !client?.isActive ? 'Tap to generate token' : 'Token already generated'
                        }
                        className={`px-4 py-2 rounded-2xl w-auto inline-flex justify-center text-sm leading-5 items-center mx-auto ${
                          !client?.isActive
                            ? 'bg-success-700 text-success-50 cursor-pointer'
                            : 'bg-secondary-neutral-light-50 text-secondary-neutral-light-500'
                        }`}
                        onClick={() => {
                          if (!client?.isActive) {
                            // Generate token
                          }
                        }}
                      >
                        Generate
                      </div>
                    </td>
                    <td
                      scope='row'
                      className='w-24 px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400 capitalize'
                    >
                      <div
                        className='w-9 h-9 p-2.5 bg-white rounded border border-gray-200 justify-center items-center gap-2 cursor-pointer'
                        onClick={() => {
                          setOpenEditForm(true);
                          setSelectedClient(client);
                        }}
                      >
                        <EditIcon className='w-4 h-4' />
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan='6' className='text-center py-3 text-grey-300'>
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        )}
      </table>
      <EditClientForm
        open={openEditForm}
        closeModal={() => setOpenEditForm(false)}
        cIP={selectedClient?.ip_address}
        cName={selectedClient?.name}
        clientID={selectedClient?._id}
      />
    </div>
  );
};

export default ClientsTable;
