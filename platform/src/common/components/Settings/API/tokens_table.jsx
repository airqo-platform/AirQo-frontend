import { useEffect, useState } from 'react';
import Skeleton from '../../Collocation/DeviceStatus/Table/Skeleton';
import moment from 'moment';
import { getClientsApi } from '@/core/apis/Settings';
import CopyIcon from '@/icons/Common/copy.svg';
import { useSelector } from 'react-redux';
import Toast from '@/components/Toast';
import { useDispatch } from 'react-redux';
import { addClientsDetails } from '@/lib/store/services/apiClient';

const TokenTable = () => {
  const dispatch = useDispatch();
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const userInfo = useSelector((state) => state.login.userInfo);
  const clientsData = useSelector((state) => state.apiClient.clientsDetails);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await getClientsApi(userInfo?._id);
        if (response.success === true) {
          dispatch(addClientsDetails(response.clients));
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  let result =
    clientsData?.length > 0 &&
    clientsData
      .flatMap((item) => item.access_token || [])
      .map((token) => ({
        clientName: clientsData.find((client) => client._id === token.client_id)?.name,
        createdAt: token && token.createdAt ? token.createdAt : undefined,
        expiresAt: token && token.expires ? token.expires : undefined,
        token: token && token.token ? token.token : undefined,
      }));

  return (
    <div className='overflow-x-scroll'>
      {showAlert && <Toast type={'success'} message={'Token copied to clipboard!'} />}
      <table
        className='border-collapse rounded-lg text-xs text-left w-full mb-6'
        data-testid='settings-tokens-table'
      >
        <thead>
          <tr className='text-secondary-neutral-light-500 text-xs border-y border-y-secondary-neutral-light-100 bg-secondary-neutral-light-25'>
            <th scope='col' className='font-medium w-[200px] px-4 py-3 opacity-40'>
              Client name
            </th>
            <th scope='col' className='font-medium w-[138px] px-4 py-3 opacity-40'>
              Token
            </th>
            <th scope='col' className='font-medium w-[138px] px-4 py-3 opacity-40'>
              Created date
            </th>
            <th scope='col' className='font-medium w-[138px] px-4 py-3 opacity-40'>
              Expires at
            </th>
            <th scope='col' className='font-medium w-24 px-4 py-3 opacity-40'></th>
          </tr>
        </thead>

        {isLoading ? (
          <Skeleton />
        ) : (
          <tbody>
            {result?.length > 0 ? (
              result.map((client, index) => {
                return (
                  <tr className={`border-b border-b-secondary-neutral-light-100`} key={index}>
                    <td
                      scope='row'
                      className='w-[200px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-800'
                    >
                      {client?.clientName}
                    </td>
                    <td
                      scope='row'
                      className='w-[138px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400'
                    >
                      {client?.token
                        ? `${client.token.slice(0, 2)}..........${client.token.slice(-2)}`
                        : ''}
                    </td>
                    <td
                      scope='row'
                      className='w-[138px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400'
                    >
                      {moment(client?.createdAt).format('MMM DD, YYYY')}
                    </td>
                    <td
                      scope='row'
                      className='w-[138px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400'
                    >
                      {moment(client?.expiresAt).format('MMM DD, YYYY')}
                    </td>
                    <td
                      scope='row'
                      className='w-24 px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400 capitalize'
                    >
                      <div
                        className='w-9 h-9 p-2.5 bg-white rounded border border-gray-200 justify-center items-center gap-2 cursor-pointer'
                        onClick={() => {
                          navigator.clipboard.writeText(client?.token);
                          setShowAlert(true);
                          setTimeout(() => {
                            setShowAlert(false);
                          }, 6000);
                        }}
                      >
                        <CopyIcon className='w-4 h-4' />
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
    </div>
  );
};

export default TokenTable;
