import { useState } from 'react';
import Skeleton from '../../Collocation/DeviceStatus/Table/Skeleton';
import moment from 'moment';
import Image from 'next/image';

const TeamsTable = ({ users, isLoading }) => {
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [focusedRowIndex, setFocusedRowIndex] = useState(null);

  return (
    <div className='overflow-x-scroll md:overflow-x-hidden'>
      <table
        className='border-collapse text-xs text-left w-full mb-6'
        data-testid='settings-team-table'
      >
        <thead>
          <tr className='text-black text-xs border-y border-y-secondary-neutral-light-100 bg-secondary-neutral-light-25'>
            <th scope='col' className='font-medium w-[175px] px-4 py-3 opacity-40'>
              Name
            </th>
            <th scope='col' className='font-medium w-[118px] px-4 py-3 opacity-40'>
              Status
            </th>
            <th scope='col' className='font-medium w-[138px] px-4 py-3 opacity-40'>
              Date joined
            </th>
            <th scope='col' className='font-medium w-[138px] px-4 py-3 opacity-40'>
              Last seen
            </th>
            <th scope='col' className='font-medium w-[140px] px-4 py-3 opacity-40'>
              Job title
            </th>
            <th scope='col' className='font-medium w-[110px] px-4 py-3 opacity-40'>
              Role
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
                    <td scope='row' className='w-[322px] px-4 py-3'>
                      <div className='flex gap-3'>
                        <>
                          {user.profileImage ? (
                            <Image
                              src={user.profileImage}
                              width='40'
                              height='40'
                              layout='responsive'
                            />
                          ) : (
                            <div className='flex justify-center items-center w-10 h-10 rounded-full bg-gray-200'>
                              {user.firstName.charAt(0).toUpperCase() +
                                user.lastName.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </>
                        <div>
                          <div className='font-medium text-sm leading-5 text-secondary-neutral-light-800'>
                            {user.firstName + ' ' + user.lastName}
                          </div>
                          <div className='font-normal text-sm leading-5 text-secondary-neutral-light-400'>
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td scope='row' className='w-[118px] px-4 py-3'>
                      <div
                        className={`px-2 py-[2px] rounded-2xl w-auto inline-flex justify-center text-sm items-center mx-auto ${
                          user.isActive === 'active'
                            ? 'bg-success-50 text-success-700'
                            : 'bg-secondary-neutral-light-50 text-secondary-neutral-light-500'
                        }`}
                      >
                        {user.isActive === 'active' ? 'Active' : 'Pending'}
                      </div>
                    </td>
                    <td
                      scope='row'
                      className='w-[138px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400'
                    >
                      {moment(user.createdAt).format('MMM DD, YYYY')}
                    </td>
                    <td
                      scope='row'
                      className='w-[138px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400'
                    >
                      {user.isActive && moment(user.lastLogin).format('MMM DD, YYYY')}
                    </td>
                    <td
                      scope='row'
                      className='w-[140px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400 capitalize'
                    >
                      {user.jobTitle}
                    </td>
                    <td
                      scope='row'
                      className='w-[110px] px-4 py-3 font-medium text-sm leading-5 text-secondary-neutral-light-400'
                    >
                      {user.role_name}
                    </td>
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
