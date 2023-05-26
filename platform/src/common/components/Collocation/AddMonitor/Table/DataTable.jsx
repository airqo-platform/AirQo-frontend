import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  addDevices,
  removeDevices,
  addDevice,
} from '@/lib/store/services/collocation/selectedCollocateDevicesSlice';
import moment from 'moment';

// dropdown
import Dropdown from './Dropdown';

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
    collocationDevices.map((device) => allDevices.push(device.device));
    if (e.target.checked) {
      dispatch(addDevices(allDevices));
    } else {
      dispatch(removeDevices(allDevices));
    }
  };

  const handleSelectDevice = (e, device) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      dispatch(addDevices([device.device]));
    } else {
      dispatch(removeDevices([device.device]));
    }
  };

  // dropdown menu list
  const [menu, setMenu] = useState([
    {
      id: 1,
      name: 'View Reports',
      link: '#',
    },
    {
      id: 2,
      name: 'Edit device',
      link: '#',
    },
    {
      id: 3,
      name: 'Delete batch',
      link: '#',
    },
  ]);

  return (
    <table
      className='border-collapse text-xs text-left w-full mb-6'
      data-testid='collocation-device-selection-table'>
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
          <th scope='col' className='font-normal w-[120px] px-4 pb-3 opacity-40'>
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        {paginatedData.length > 0 &&
          paginatedData.map((device, index) => {
            return (
              <tr className='border-b border-b-slate-300' key={index}>
                <td scope='row' className='w-[61px] py-3 px-6'>
                  <input
                    type='checkbox'
                    checked={selectedCollocateDevices.includes(device.device)}
                    value={device}
                    onChange={(e) => handleSelectDevice(e, device)}
                  />
                </td>
                <td scope='row' className='w-[145px] px-4 py-3 uppercase'>
                  {device.device}
                </td>
                <td scope='row' className='w-[145px] px-4 py-3'>
                  {moment(device.time).format('MMM DD, YYYY')}
                </td>
                <td scope='row' className='w-[145px] px-4 py-3'>
                  {' '}
                </td>
                <td scope='row' className='w-[145px] px-4 py-3'></td>
                <td scope='row' className='w-[120px] px-4 py-3'>
                  <Dropdown menu={menu} device={device.id} />
                </td>
              </tr>
            );
          })}
      </tbody>
    </table>
  );
};

export default DataTable;
