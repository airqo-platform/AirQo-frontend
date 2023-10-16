import { useState } from 'react';
import Skeleton from '../../Collocation/DeviceStatus/Table/Skeleton';
import moment from 'moment';

const TeamsTable = ({ users, onEdit, onDelete, isLoading }) => {
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(null);

  return (
    <div className='overflow-x-scroll md:overflow-x-hidden'>
      <table
        className='border-collapse text-xs text-left w-full mb-6'
        data-testid='collocation-device-status-summary'
      >
        <thead>
          <tr className='text-black text-xs border-y border-y-secondary-neutral-light-100 bg-secondary-neutral-light-25'>
            <th scope='col' className='font-normal w-[61px] py-[10px] px-[21px]'>
              <input
                type='checkbox'
                // checked={
                //   collocationDevices.length > 0 &&
                //   selectedCollocateDevices.length === collocationDevices.length
                // }
                // onChange={handleSelectAllDevices}
              />
            </th>
            <th scope='col' className='font-medium w-[175px] px-4 py-3 opacity-40'>
              Name
            </th>
            <th scope='col' className='font-medium w-[175px] px-4 py-3 opacity-40'>
              Status
            </th>
            <th scope='col' className='font-medium w-[175px] px-4 py-3 opacity-40'>
              Date joined
            </th>
            <th scope='col' className='font-medium w-[175px] px-4 py-3 opacity-40'>
              Last seen
            </th>
            <th scope='col' className='font-medium w-[175px] px-4 py-3 opacity-40'>
              Role
            </th>
            <th scope='col' className='font-medium w-[175px] px-4 py-3 opacity-40'>
              Organisation
            </th>
          </tr>
        </thead>

        {isLoading ? (
          <Skeleton />
        ) : (
          <tbody>
            {users.length > 0 ? (
              users.map((user, index) => {
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
                    <td scope='row' className='w-[61px] py-[10px] px-[21px]'>
                      <input
                        type='checkbox'
                        // checked={selectedCollocateDevices.includes(device.device_name)}
                        value={user}
                        onChange={(e) => handleSelectDevice(e, user)}
                      />
                    </td>
                    <td scope='row' className='w-[175px] px-4 py-3'>
                      <div className='font-medium text-sm leading-5 text-secondary-neutral-light-800'>
                        {user.firstName + ' ' + user.lastName}
                      </div>
                      <div className='font-normal text-sm leading-5 text-secondary-neutral-light-400'>
                        {user.email}
                      </div>
                    </td>
                    <td scope='row' className='w-[175px] px-4 py-3'>
                      <div
                        className={`px-2 py-[2px] rounded-2xl w-auto flex justify-center items-center ${
                          user.status.toLowerCase() === 'active'
                            ? 'bg-success-50 text-success-700'
                            : 'bg-secondary-neutral-light-50 text-secondary-neutral-light-500'
                        }`}
                      >
                        {user.status}
                      </div>
                    </td>
                    <td
                      scope='row'
                      className='w-[175px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400'
                    >
                      {moment(user.createdAt).format('MMM DD, YYYY')}
                    </td>
                    <td
                      scope='row'
                      className='w-[175px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400'
                    >
                      {moment(user.lastSeen).format('MMM DD, YYYY')}
                    </td>
                    <td
                      scope='row'
                      className='w-[175px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400'
                    >
                      {user.role.role_name}
                    </td>
                    <td
                      scope='row'
                      className='w-[175px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400'
                    >
                      {user.organisation}
                    </td>
                    {/* <td scope='row' className='w-[75px] px-4 py-3'>
                      <Dropdown
                        menu={menu}
                        length={index === collocationDevices.length - 1 ? 'last' : ''}
                        onItemClick={(id) => handleItemClick(id, device, index)}
                      />
                    </td> */}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan='6' className='text-center pt-6 text-grey-300'>
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

export default TeamsTable;
