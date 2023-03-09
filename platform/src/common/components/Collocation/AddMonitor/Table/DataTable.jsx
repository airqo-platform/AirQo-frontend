import { humanReadableDate } from '@/core/utils/dateTime';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addDevices,
  removeDevices,
  addDevice,
} from '@/lib/store/services/addMonitor/selectedCollocateDevicesSlice';

const DataTable = ({ paginatedData, collocationDevices }) => {
  const dispatch = useDispatch();
  const selectedCollocateDevices = useSelector(
    (state) => state.selectedCollocateDevices.selectedCollocateDevices,
  );

  useEffect(() => {
    if (selectedCollocateDevices.length > 0) {
      dispatch(removeDevices());
    }
  }, []);

  const handleSelectAllDevices = (e) => {
    const allDevices = [];
    collocationDevices.map((device) => allDevices.push(device._id));
    if (e.target.checked) {
      dispatch(addDevices(allDevices));
    } else {
      dispatch(removeDevices(allDevices));
    }
  };

  const handleSelectDevice = (e, device) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      dispatch(addDevices([device._id]));
    } else {
      dispatch(removeDevices([device._id]));
    }
  };

  return (
    <table className='border-collapse text-sm text-left w-full mb-6'>
      <thead>
        <tr className='border-b border-b-slate-300 text-black'>
          <th scope='col' className='font-normal w-[61px] pb-3 px-6'>
            <input
              type='checkbox'
              checked={selectedCollocateDevices.length === collocationDevices.length}
              onChange={handleSelectAllDevices}
            />
          </th>
          <th scope='col' className='font-normal w-[145px] px-4 pb-3 opacity-40'>
            Monitor name
          </th>
          <th scope='col' className='font-normal w-[145px] px-4 pb-3 opacity-40'>
            Date added
          </th>
          <th scope='col' className='font-normal w-[145px] px-4 pb-3 opacity-40'>
            Added by
          </th>
          <th scope='col' className='font-normal w-[209px] px-4 pb-3 opacity-40'>
            Comments
          </th>
        </tr>
      </thead>
      <tbody>
        {paginatedData.length > 0 &&
          paginatedData.map((device) => {
            return (
              <tr className='border-b border-b-slate-300' key={device._id}>
                <td scope='row' className='w-[61px] py-3 px-6'>
                  <input
                    type='checkbox'
                    checked={selectedCollocateDevices.includes(device._id)}
                    value={device}
                    onChange={(e) => handleSelectDevice(e, device)}
                  />
                </td>
                <td scope='row' className='w-[145px] px-4 py-3'>
                  {device.long_name}
                </td>
                <td scope='row' className='w-[145px] px-4 py-3'>
                  {humanReadableDate(device.createdAt)}
                </td>
                <td scope='row' className='w-[145px] px-4 py-3'>
                  {' '}
                </td>
                <td scope='row' className='w-[145px] px-4 py-3'></td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
};

export default DataTable;
