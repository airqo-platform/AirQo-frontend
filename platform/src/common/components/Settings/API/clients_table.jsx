import { useEffect, useState } from 'react';
import Skeleton from '../../Collocation/DeviceStatus/Table/Skeleton';
import moment from 'moment';
import { getUserDetails } from '@/core/apis/Account';
import CopyIcon from '@/icons/Common/copy.svg';
import { useSelector } from 'react-redux';
import Toast from '@/components/Toast';

const ClientsTable = () => {
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(null);
  const [clientDetails, setClientDetails] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const userInfo = useSelector((state) => state.login.userInfo);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await getUserDetails(userInfo?._id);
        if (res.success === true) {
          setClientDetails(res.users[0].clients);
        }
      } catch (error) {
        console.error(error);
      } finally {
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
              Client ID
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
            {clientDetails?.length > 0 ? (
              clientDetails?.map((client, index) => {
                return (
                  <tr
                    className={`border-b border-b-secondary-neutral-light-100 ${
                      hoveredRowIndex === index ? 'bg-secondary-neutral-light-25' : ''
                    } ${focusedRowIndex === index ? 'bg-gray-200' : ''}`}
                    key={index}
                    onMouseEnter={() => setHoveredRowIndex(index)}
                    onMouseLeave={() => setHoveredRowIndex(null)}
                    onFocus={() => setFocusedRowIndex(index)}
                    onBlur={() => setFocusedRowIndex(null)}
                  >
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
                      {client?._id}
                    </td>
                    <td
                      scope='row'
                      className='w-[138px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400'
                    >
                      {client?.ip_address}
                    </td>
                    <td
                      scope='row'
                      className='w-[138px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400'
                    >
                      {client?.isActive ? 'Activated' : 'Not Activated'}
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
                      Generate Token
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

export default ClientsTable;
