import { humanReadableDate } from '@/core/utils/dateTime';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addDevices,
  removeDevices,
  addDevice,
} from '@/lib/store/services/addMonitor/selectedCollocateDevicesSlice';
import Skeleton from './Skeleton';

const DataTable = ({ filteredData, collocationDevices, isLoading }) => {
  const dispatch = useDispatch();

  const selectedCollocateDevices = useSelector(
    (state) => state.selectedCollocateDevices.selectedCollocateDevices,
  );

  useEffect(() => {
    if (selectedCollocateDevices.length > 0) {
      dispatch(removeDevices(collocationDevices));
    }
  }, []);

  const handleSelectAllDevices = (e) => {
    const allDevices = [];
    collocationDevices.map((device) => allDevices.push(device.device_id));
    if (e.target.checked) {
      dispatch(addDevices(allDevices));
    } else {
      dispatch(removeDevices(allDevices));
    }
  };

  const handleSelectDevice = (e, device) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      dispatch(addDevices([device.device_id]));
    } else {
      dispatch(removeDevices([device.device_id]));
    }
  };

  return (
    <table className='border-collapse text-sm text-left w-full mb-6'>
      <thead>
        <tr className='border-b border-b-slate-300 text-black'>
          <th scope='col' className='font-normal w-[61px] py-[10px] px-[21px]'>
            <input
              type='checkbox'
              checked={
                collocationDevices.length > 0 &&
                selectedCollocateDevices.length === collocationDevices.length
              }
              onChange={handleSelectAllDevices}
            />
          </th>
          <th scope='col' className='font-normal w-[175px] px-4 py-3 opacity-40'>
            Monitor name
          </th>
          <th scope='col' className='font-normal w-[175px] px-4 py-3 opacity-40'>
            Added by
          </th>
          <th scope='col' className='font-normal w-[175px] px-4 py-3 opacity-40'>
            Start date
          </th>
          <th scope='col' className='font-normal w-[175px] px-4 py-3 opacity-40'>
            End date
          </th>
          <th scope='col' className='font-normal w-[175px] px-4 py-3 opacity-40'>
            Status
          </th>
        </tr>
      </thead>

      {isLoading ? (
        <Skeleton />
      ) : (
        <tbody>
          {filteredData.length > 0 &&
            filteredData.map((device) => {
              return (
                <tr className='border-b border-b-slate-300' key={device.device_id}>
                  <td scope='row' className='w-[61px] py-[10px] px-[21px]'>
                    <input
                      type='checkbox'
                      checked={selectedCollocateDevices.includes(device.device_id)}
                      value={device}
                      onChange={(e) => handleSelectDevice(e, device)}
                    />
                  </td>
                  <td scope='row' className='w-[175px] px-4 py-3'>
                    {device.device_id}
                  </td>
                  <td scope='row' className='w-[175px] px-4 py-3'>
                    {' '}
                  </td>
                  <td scope='row' className='w-[175px] px-4 py-3'>
                    {humanReadableDate(device.start_date)}
                  </td>
                  <td scope='row' className='w-[175px] px-4 py-3'>
                    {humanReadableDate(device.end_date)}
                  </td>
                  <td scope='row' className='w-[175px] px-4 py-3'>
                    {device.status}
                  </td>
                </tr>
              );
            })}
        </tbody>
      )}
    </table>
  );
};

export default DataTable;
