import React from 'react';
import Layout from '@/components/Layout';
import { useState } from 'react';
import classNames from 'classnames';
import { BiEnvelope } from 'react-icons/bi';
import { BiLock } from 'react-icons/bi';
import { BiPhone } from 'react-icons/bi';
import { BiTimeFive } from 'react-icons/bi';
import { BiTrash } from 'react-icons/bi';
import { BiChevronDown } from 'react-icons/bi';
import { CiSliderHorizontal } from 'react-icons/ci';
import { CiCalendar } from "react-icons/ci";

function ProfileDetails() {
  /* Tabs Toggling Function */
  const [toggleState, setToggleState] = useState(1);

  const toggleTab = (index) => {
    setToggleState(index);
  };
  /* Button Settings Functions */
  const [isSelected, setIsSelected] = useState(false);
  const [isSelectedb, setIsSelectedb] = useState(false);
  const [isSelectedc, setIsSelectedc] = useState(false);

  return (
    <Layout>
      <nav className='pl-16 border-b-[1px] left-64  right-2 top-16 tabs z-50 bg-white justify-between gap-6 flex items-center pt-1 absolute'>
        <div className='pr-80'>
          <button
            className={
              toggleState === 1
                ? 'text-blue-500 border-blue-500 pr-3 pt-2 pb-5 font-medium tab-bordered tab-active'
                : 'pr-3 pt-2 pb-5 font-medium'
            }
            onClick={() => toggleTab(1)}>
            Profile Details
          </button>
          <button
            className={
              toggleState === 2
                ? 'text-blue-500 border-blue-500 pl-3 pt-2 pb-5 font-medium tab-bordered tab-active'
                : 'pl-3 pt-2 pb-5 font-medium'
            }
            onClick={() => toggleTab(2)}>
            Email Settings
          </button>
        </div>
        <div className='flex items-start pl-28 pr-6'>
          <button className='bg-blue-100 text-blue-500 text-sm font-medium py-2 px-3 mr-3 rounded'>
          <div className='flex items-end'>
          <CiCalendar className='mr-2 icon text-2xl text-blue-500'/>
          Last 7 days
          <BiChevronDown className='ml-2 icon text-2xl text-blue-500' />
          </div>
          
          </button>
          <button className='bg-gray-200 py-2 px-3 border border-none rounded'>
            <CiSliderHorizontal className=' icon text-2xl text-gray-500' />
          </button>
        </div>
      </nav>

      {/* Profile Details page */}
      <div className='ml-0 pl-0 pr-10 flex items-center pt-0 mt-0'>
        <div
          className={
            toggleState === 1
              ? 'bg-white pl-16 pt-20 w-full h-full active-content'
              : 'bg-white pl-16 pt-20 w-full h-full hidden'
          }>
          <div className='flex items-end mt-3'>
            <div className='w-32 h-32 px-5 py-9 bg-green-100 rounded-md flex justify-center items-center'>
              <div className='text-center text-green-600 text-2xl font-medium font-inter leading-36 break-words'>
                AQ
              </div>
            </div>
            <button className=' mr-4 ml-6 px-4 py-4 bg-blue-500 bg-opacity-10 text-blue-500 break-words rounded'>
              Upload Photo
            </button>
            <button className='px-4 mt-27 py-4 bg-red-500 bg-opacity-10 text-red-500 rounded'>
              <BiTrash className='icon text-2xl ml-0 text-red-500 text-opacity-40 pointer-events-none' />
            </button>
          </div>

          <div className='flex items-center justify-between'>
            <span className='mb-4 mt-4 pr-10 flex-1'>
              <p className='text-gray-600 mt-2 self-stretch text-sm font-normal leading-6.8 break-words'>
                We recommend starting with our onboarding checklist.
              </p>
            </span>
            <button className='bg-gray-100 text-gray-400 text-sm font-medium leading-4 py-3 px-4 mr-3 border border-gray-300 rounded'>
              Save Changes
            </button>
            <button className='bg-white py-2 px-2 border border-gray-300 rounded'>
              <BiChevronDown className=' icon text-2xl  text-gray-500' />
            </button>
          </div>
          <hr className='h my-8' />

          <div className='flex items-center justify-between'>
            <span className='flex-1 self-start'>
              <p className='text-2x1 font-medium self-stretch text-black leading-7 break-words'>
                Name
              </p>
              <p className='text-gray-600 mt-2 self-stretch text-sm font-normal leading-6.8 break-words'>
                We recommend starting with our onboarding checklist.
              </p>
            </span>

            <button className='bg-gray-100 text-gray-400 text-sm font-medium leading-4 py-3 px-4 mr-3 border border-gray-300 rounded'>
              Save Changes
            </button>
            <button className='bg-white py-2 px-2 border border-gray-300 rounded'>
              <BiChevronDown className=' icon text-2xl  text-gray-500' />
            </button>
          </div>

          <div className='flex items-center justify-between w-3'>
            <div className='pt-6 self-stretch rounded-md pr-6 flex-1'>
              <input
                className='bg-gray-200 pr-10 rounded-2 mb-1 border-none placeholder-text-gray-600 mt-2 text-sm font-normal leading-6.8 break-words'
                type='text'
                placeholder='First name'
              />
            </div>
            <div className='flex-1 pt-6'>
              <input
                className='bg-gray-200 pr-10 rounded-2 mb-1 border-none placeholder-text-gray-600 mt-2 text-sm font-normal leading-6.8 break-words'
                type='text'
                placeholder='Last name'
              />
            </div>
          </div>

          <hr className='h my-8' />

          <div className='flex items-center justify-between'>
            <span className='flex-1 self-start'>
              <p className='text-2x1 font-medium self-stretch text-black leading-7 break-words'>
                Country
              </p>
              <p className='text-gray-600 mt-2 self-stretch text-sm font-normal leading-6.8 break-words'>
                We recommend starting with our onboarding checklist
              </p>
            </span>
            <button className='bg-gray-100 text-gray-400 text-sm font-medium leading-4 py-3 px-4 mr-3 border border-gray-300 rounded'>
              Save Changes
            </button>
            <button className='bg-white py-2 px-2 border border-gray-300 rounded'>
              <BiChevronDown className=' icon text-2xl  text-gray-500' />
            </button>
          </div>

          <div className='flex items-center justify-between w-3'>
            <div className='pt-6 self-stretch rounded-md pr-6 flex-1'>
              <div className='relative flex items-center'>
                <input
                  className='bg-gray-200 pr-10 rounded-2 mb-1 border-none placeholder-text-gray-600 mt-2 text-sm font-normal leading-6.8 break-words'
                  type='text'
                  placeholder='Select country'
                />
                <button className='absolute p-1 right-1 bg-gray-200'>
                  <BiChevronDown className=' icon text-2xl  text-gray-500' />
                </button>
              </div>
            </div>
            <div className='pr-8 flex-1 pt-6'>
              <div className='relative flex items-center'>
                <BiTimeFive className='icon text-2xl absolute ml-3 text-gray-500 pointer-events-none' />
                <input
                  className='bg-gray-200 pl-10 rounded-2 mb-1 border-none placeholder-text-gray-600 mt-2 text-sm font-normal leading-6.8 break-words'
                  type='text'
                  placeholder='Select Time zone'
                />
                <button className='absolute p-1 right-1 bg-gray-200'>
                  <BiChevronDown className=' icon text-2xl  text-gray-500' />
                </button>
              </div>
            </div>
          </div>

          <hr className='h my-8' />
        </div>

        {/* Email settings page */}
        <div
          className={
            toggleState === 2
              ? 'bg-white pl-16 pt-20 w-full h-full active-content'
              : 'bg-white pl-16 pt-20 w-full h-full hidden'
          }>
          <div className='flex items-center justify-between'>
            <span className='flex-1 self-start'>
              <p className='text-2x1 font-medium self-stretch text-black leading-7 break-words'>
                Email
              </p>
              <p className='text-gray-600 mt-2 self-stretch text-sm font-normal leading-6.8 break-words'>
                We recommend starting with our onboarding checklist
              </p>
            </span>
            <button className='bg-gray-100 text-gray-400 text-sm font-medium leading-4 py-3 px-4 mr-3 border border-gray-300 rounded'>
              Save Changes
            </button>
            <button className='bg-white py-2 px-2 border border-gray-300 rounded'>
              <BiChevronDown className=' icon text-2xl  text-gray-500' />
            </button>
          </div>

          <div className='flex items-center justify-between w-3'>
            <form action='' className=' pt-6 self-stretch rounded-md pr-6 flex-1'>
              <div className='relative flex items-center'>
                <BiEnvelope className='icon text-2xl absolute ml-3 text-gray-500 pointer-events-none' />
                <input
                  className='bg-gray-200 pr-16 pl-11 rounded-2 mb-1 border-none placeholder-text-gray-600 mt-2 text-sm font-normal leading-6.8 break-words'
                  type='text'
                  placeholder='Enter your email'
                />
              </div>
            </form>
          </div>

          <hr className='h my-8' />

          <div className='flex items-center justify-between'>
            <span className='flex-1 self-start'>
              <p className='text-2x1 font-medium self-stretch text-black leading-7 break-words'>
                Phone Number
              </p>
              <p className='text-gray-600 mt-2 self-stretch text-sm font-normal leading-6.8 break-words'>
                We recommend starting with our onboarding checklist
              </p>
            </span>
            <button className='bg-gray-100 text-gray-400 text-sm font-medium leading-4 py-3 px-4 mr-3 border border-gray-300 rounded'>
              Save Changes
            </button>
            <button className='bg-white py-2 px-2 border border-gray-300 rounded'>
              <BiChevronDown className=' icon text-2xl  text-gray-500' />
            </button>
          </div>

          <div className='flex items-center justify-between w-3'>
            <div className='pt-6 self-stretch rounded-md pr-6 flex-1'>
              <div className='relative flex items-center'>
                <BiPhone className='icon text-2xl absolute ml-3 text-gray-500 pointer-events-none' />
                <input
                  className='bg-gray-200 pr-16  pl-11 rounded-2 mb-1 border-none placeholder-text-gray-600 mt-2 text-sm font-normal leading-6.8 break-words'
                  type='text'
                  placeholder='Add your phone number'
                />
              </div>
            </div>
          </div>

          <hr className='h my-8' />

          <div className='flex items-center justify-between'>
            <span className='flex-1 self-start'>
              <p className='text-2x1 font-medium self-stretch text-black leading-7 break-words'>
                Password
              </p>
              <p className='text-gray-600 mt-2 self-stretch text-sm font-normal leading-6.8 break-words'>
                We recommend starting with our onboarding checklist
              </p>
            </span>
            <button className='bg-gray-100 text-gray-400 text-sm font-medium leading-4 py-3 px-4 mr-3 border border-gray-300 rounded'>
              Save Changes
            </button>
            <button className='bg-white py-2 px-2 border border-gray-300 rounded'>
              <BiChevronDown className=' icon text-2xl  text-gray-500' />
            </button>
          </div>

          <div className='flex items-center justify-between w-3'>
            <div className='pt-6 self-stretch rounded-md pr-6 flex-1'>
              <div className='relative flex items-center'>
                <BiLock className='icon absolute ml-3 text-gray-500 pointer-events-none' />
                <input
                  className='bg-gray-200 pr-16 pl-11 rounded-2 mb-1 border-none placeholder-text-gray-600 mt-2 text-sm font-normal leading-6.8 break-words'
                  type='text'
                  placeholder='Current password'
                />
              </div>
            </div>
            <div className='flex-1 pt-6'>
              <div className='relative flex items-center'>
                <BiLock className='icon absolute ml-3 text-gray-500 pointer-events-none' />
                <input
                  className='bg-gray-200 pr-14 pl-10 rounded-2 mb-1 border-none placeholder-text-gray-600 mt-2 text-sm font-normal leading-6.8 break-words'
                  type='text'
                  placeholder='New password'
                />
              </div>
            </div>
          </div>
          <div className='pr-64 flex-1 pt-6'>
            <div className='relative flex items-center'>
              <BiLock className='icon absolute ml-3 text-gray-500 pointer-events-none' />
              <input
                className='bg-gray-200 pl-11 w-full rounded-2  border-none placeholder-text-gray-600 mt-2 text-sm font-normal leading-6.8 break-words'
                type='text'
                placeholder='New password'
              />
            </div>
          </div>

          <hr className='h my-8' />

          <div className='flex items-center justify-between'>
            <div className='relative pr-4'>
              <div className='w-14 h-14 rounded-full border-4 border-gray-300 flex justify-center items-center'>
                <span className='text-gray-700 text-xl font-semibold leading-6'>0/3</span>
              </div>
            </div>
            <span className='flex-1 self-start'>
              <p className='text-2x1 font-medium self-stretch text-black leading-7 break-words'>
                Notifications
              </p>
              <p className='text-gray-600 mt-2 self-stretch text-sm font-normal leading-6.8 break-words'>
                We recommend starting with our onboarding checklist
              </p>
            </span>
            <button className='bg-gray-100 text-gray-400 text-sm font-medium leading-4 py-3 px-4 mr-3 border border-gray-300 rounded'>
              Save Changes
            </button>
            <button className='bg-white py-2 px-2 border border-gray-300 rounded'>
              <BiChevronDown className=' icon text-2xl  text-gray-500' />
            </button>
          </div>

          <div className='pt-6 flex items-start justify-between'>
            <div
              onClick={() => setIsSelected(!isSelected)}
              class={classNames(
                'w-9 h-5 mt-1 bg-blue-500 rounded-full cursor-pointer transition-all duration-500 flex justify-end items-center',
                { ' bg-gray-200 ': isSelected },
              )}>
              <span
                className={classNames(
                  'm-0.5 h-4 w-4 bg-white rounded-full transition-all duration-500',
                  {
                    'mr-5': isSelected,
                  },
                )}></span>
            </div>

            <span className='pl-5 flex-1 self-start'>
              <p className='text-2x1 font-medium self-stretch text-black leading-7 break-words'>
                Air Quality Updates
              </p>
              <p className='text-gray-600 mt-2 self-stretch text-sm font-normal leading-6.8 break-words'>
                Supporting Text
              </p>
            </span>
          </div>

          <div className='pt-6 flex items-start justify-between'>
            <div
              onClick={() => setIsSelectedb(!isSelectedb)}
              class={classNames(
                'w-9 h-5 mt-1 bg-blue-500 rounded-full cursor-pointer transition-all duration-500 flex justify-end items-center',
                { ' bg-gray-200 ': isSelectedb },
              )}>
              <span
                className={classNames(
                  'm-0.5 h-4 w-4 bg-white rounded-full transition-all duration-500',
                  {
                    'mr-5': isSelectedb,
                  },
                )}></span>
            </div>
            <span className='pl-5 flex-1 self-start'>
              <p className='text-2x1 font-medium self-stretch text-black leading-7 break-words'>
                AirQo Updates and Announcements
              </p>
              <p className='text-gray-600 mt-2 self-stretch text-sm font-normal leading-6.8 break-words'>
                Supporting Text
              </p>
            </span>
          </div>

          <div className='pt-6 flex items-start justify-between'>
            <div
              onClick={() => setIsSelectedc(!isSelectedc)}
              class={classNames(
                'w-9 h-5 mt-1 bg-blue-500 rounded-full cursor-pointer transition-all duration-500 flex justify-end items-center',
                { ' bg-gray-200 ': isSelectedc },
              )}>
              <span
                className={classNames(
                  'm-0.5 h-4 w-4 bg-white rounded-full transition-all duration-500',
                  {
                    'mr-5': isSelectedc,
                  },
                )}></span>
            </div>
            <span className='pl-5 flex-1 self-start'>
              <p className='text-2x1 font-medium self-stretch text-black leading-7 break-words'>
                AirQo Newsletter
              </p>
              <p className='text-gray-600 mt-2 self-stretch text-sm font-normal leading-6.8 break-words'>
                Supporting Text
              </p>
            </span>
          </div>
          <hr className='h my-8' />
        </div>
      </div>
    </Layout>
  );
}

export default ProfileDetails;
