import React from 'react';
import Layout from '@/components/Layout';
import { useState } from 'react';
import classNames from 'classnames';
import { BiEnvelope } from "react-icons/bi";
import { BiLock } from "react-icons/bi";
import { BiPhone } from "react-icons/bi";
import { BiTimeFive } from "react-icons/bi";
import { BiTrash } from "react-icons/bi";
import { BiChevronDown } from "react-icons/bi";



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
      <div className='pl-9 pb-0 mb-0 pr-10 gap-10 flex items-center pt-1 absolute mt-0'>
        <button className={toggleState === 1? "text-blue-700 font-bold underline" :""} onClick={() => toggleTab(1)}>
          Profile Details
        </button>
        <button className={toggleState === 2? "text-blue-700 font-bold underline" :""} onClick={() => toggleTab(2)}>
          Email Settings
        </button>
      </div>

      {/* Profile Details page */}
      <div className='ml-0 pl-0 pr-10 flex items-center pt-0 mt-0'>
        <div
          className={
            toggleState === 1
              ? 'bg-white p-20 w-full h-full   active-content'
              : 'bg-white p-20 w-full h-full hidden'
          }>
          <div className='pl-0 pr-10 flex items-center pt-0'>
            <div className='rounded bg-green-550 bg-opacity-20 p-20 flex flex-col justify-center items-center w-30 h-150 cursor-pointer mb-1 mt-0'>
              <input type='file' placeholder='KJC' hidden />
            </div>
            <button className='mr-6 mt-28 ml-6 px-4 py-2 bg-blue-500 bg-opacity-10 text-blue-500 rounded'>
              Upload Photo
            </button>
            <button className='px-4 mt-28 py-2 bg-red-500 bg-opacity-10 text-red-500 rounded'>
              <BiTrash className="icon text-2xl ml-0 text-red-500 text-opacity-60 pointer-events-none" />
            </button>
          </div>

          <div className='pl-0 flex pt-0.01 items-center justify-between mb-0.01'>
            <span className='mb-4 mt-4 pl-0 pr-10 flex-1 pt-7 self-start'>
              <p className='text-gray-500 mt-2'>
                We recommend starting with our onboarding checklist
              </p>
            </span>
            <button className='bg-gray-100 text-gray-300 py-1 px-2 mt-5 mr-14 border border-gray-300 rounded'>
              Save Changes
            </button>
          </div>
          <hr className='h mt-3 mx-0 my-0.1' />

          <div className='flex items-center justify-between mb-0.01'>
            <span className='mb-4 mt-4 pl-0 pr-10 flex-1 pt-7 self-start'>
              <p className='text-x1  font-bold '>Name</p>
              <p className='text-gray-500 mt-2'>
                We recommend starting with our onboarding checklist
              </p>
            </span>
            <button className='bg-gray-100 text-gray-300 py-1 px-2 mt-5 mr-14 border border-gray-300 rounded'>
              Save Changes
            </button>
          </div>

          <div className='flex items-center justify-between w-3 gap-0.01 mb-6 mt-0.09 '>
            <div className=' mt-0.05 pl-0 pr-10 flex-1 pt-8'>
              <input
                className='bg-gray-200 rounded-2 mb-1 border-none'
                type='text'
                placeholder='First name'
              />
            </div>
            <div className='mr-4 pl-4 pr-10 flex-1 pt-8'>
              <input
                className='bg-gray-200 rounded-2 mb-1 border-none'
                type='text'
                placeholder='Last name'
              />
            </div>
          </div>

          <hr className='h mt-3 mx-0 my-0.1' />

          <div className='flex items-center justify-between mb-0.01'>
            <span className='mb-4 mt-4 pl-0 pr-10 flex-1 pt-7 self-start'>
              <p className='text-x1  font-bold '>Country</p>
              <p className='text-gray-500 mt-2'>
                We recommend starting with our onboarding checklist
              </p>
            </span>
            <button className='bg-gray-100 text-gray-300 py-1 px-2 mt-5 mr-14 border border-gray-300 rounded'>
              Save Changes
            </button>
          </div>

          <div className='flex items-center justify-between w-3 gap-0 mb-6 mt-0.09 '>
            <div className=' mt-0.05 pl-0 pr-10 flex-1 pt-8'>
              <div className='relative flex items-center'>
              <input
                className='bg-gray-200 rounded-2 mb-1 border-none'
                type='text'
                placeholder='Select country'

              />
              <button className='absolute p-2 mb-1 right-1 bg-gray-200'>
              <BiChevronDown className=" icon text-2xl  text-gray-500" />
              </button>
              </div>
            </div>
            <div className='mr-4 pl-4 pr-10 flex-1 pt-8'>
              <div className='relative flex items-center'>
              <BiTimeFive className="icon text-2xl absolute ml-3 text-gray-500 pointer-events-none" />
              <input
                className='bg-gray-200 pl-10 rounded-2 mb-1 border-none'
                type='text'
                placeholder='Select time zone'
              />
              <button className='absolute p-2 mb-1 right-1 bg-gray-200'>
              <BiChevronDown className=" icon text-2xl  text-gray-500" />
              </button>
              </div>
            </div>
          </div>

          <hr className='h mt-3 mx-0 my-0.1 mb-10' />
        </div>

        {/* Email settings page */}
        <div
          className={
            toggleState === 2
              ? 'bg-white p-20 w-full h-full   active-content'
              : 'bg-white p-20 w-full h-full hidden'
          }>
          <div className='flex items-center justify-between mb-0.01'>
            <span className='mb-4 mt-0 pl-0 pr-10 flex-1 pt-0 self-start'>
              <p className='text-x1  font-bold '>Email</p>
              <p className='text-gray-500 mt-2'>
                We recommend starting with our onboarding checklist
              </p>
            </span>
            <button className='bg-gray-100 text-gray-300 py-1 px-2 mt-5 mr-14 border border-gray-300 rounded'>
              Save Changes
            </button>
          </div>

          <div className='flex items-center justify-between w-3 gap-0.01 mb-6 mt-0.09 '>
            <form action='' className=' mt-0.05 pl-0 pr-10 flex-1 pt-8'>
            <div className='relative flex items-center'>
            <BiEnvelope className="icon text-2xl absolute ml-3 text-gray-500 pointer-events-none" />
              <input
                className='bg-gray-200 pr-3 pl-12 rounded-2 mb-1 border-none'
                type='text'
                placeholder='Enter your email'
              />
            </div>
            </form>
          </div>

          <hr className='h mt-3 mx-0 my-0.1' />

          <div className='flex items-center justify-between mb-0.01'>
            <span className='mb-4 mt-4 pl-0 pr-10 flex-1 pt-7 self-start'>
              <p className='text-x1  font-bold '>Phone number</p>
              <p className='text-gray-500 mt-2'>
                We recommend starting with our onboarding checklist
              </p>
            </span>
            <button className='bg-gray-100 text-gray-300 py-1 px-2 mt-5 mr-14 border border-gray-300 rounded'>
              Save Changes
            </button>
          </div>

          <div className='flex items-center justify-between w-3 gap-0.01 mb-6 mt-0.09 '>
            <div className=' mt-0.05 pl-0 pr-10 flex-1 pt-8'>
              <div className='relative flex items-center'>
              <BiPhone className="icon text-2xl absolute ml-3 text-gray-500 pointer-events-none" />
              <input
                className='bg-gray-200 pr-3 pl-11 rounded-2 mb-1 border-none'
                type='text'
                placeholder='Add your phone number'
                
              />
              </div>
            </div>
          </div>

          <hr className='h mt-3 mx-0 my-0.1' />

          <div className='flex items-center justify-between mb-0.01'>
            <span className='mb-4 mt-4 pl-0 pr-10 flex-1 pt-7 self-start'>
              <p className='text-x1  font-bold '>Password</p>
              <p className='text-gray-500 mt-2'>
                We recommend starting with our onboarding checklist
              </p>
            </span>
            <button className='bg-gray-100 text-gray-300 py-1 px-2 mt-5 mr-14 border border-gray-300 rounded'>
              Save Changes
            </button>
          </div>

          <div className='flex items-center justify-between w-3 gap-0 mb-6 mt-0.09 '>
            <div className=' mt-0.05 pl-0 pr-10 flex-1 pt-8'>
            <div className='relative flex items-center'>
              <BiLock className="icon absolute ml-3 text-gray-500 pointer-events-none" />
              <input
                className='bg-gray-200 pr-3 pl-9 rounded-2 mb-1 border-none'
                type='text'
                placeholder='Current password'
              />
              </div>
            </div>
            <div className=' mt-0.05 pl-0  flex-1 pt-8'>
              <div className='relative flex items-center'>
              <BiLock className="icon absolute ml-3 text-gray-500 pointer-events-none" />
              <input
                className='bg-gray-200 pr-3 pl-8 rounded-2 mb-1 border-none'
                type='text'
                placeholder='New password'
              />
              </div>
            </div>
          </div>
          <div className=' mt-0 pl-0 pr-20 flex-1 mr-28 pt-0'>
            <div className='relative flex items-center'>
            <BiLock className="icon absolute ml-3 text-gray-500 pointer-events-none" />
            <input
              className='bg-gray-200 pr-3 pl-10 w-full rounded-2  mb-1 border-none'
              type='text'
              placeholder='New password'
            />
            </div>
          </div>

          <hr className='h mt-3 mx-0 my-0.1 mb-0' />

          <div className='flex items-center justify-between mb-0'>
            <span className='mb-4 mt-4 pl-0 pr-10 flex-1 pt-7 self-start'>
              <p className='text-x1  font-bold '>Notifications</p>
              <p className='text-gray-500 mt-2'>
                We recommend starting with our onboarding checklist
              </p>
            </span>
            <button className='bg-gray-100 text-gray-300 py-1 px-2 mt-5 mr-14 border border-gray-300 rounded'>
              Save Changes
            </button>
          </div>

          <div className='flex mt-0 items-center justify-between gap-7 mb-0.01'>
            <div
              onClick={() => setIsSelected(!isSelected)}
              className={classNames(
                'flex w-20 h-10 bg-gray-500 m-0 mt-3 rounded-full cursor-pointer transition-all duration-500',
                { 'bg-blue-700': isSelected },
              )}>
              <span
                className={classNames(
                  'm-0.5 h-9 w-10 bg-white rounded-full transition-all duration-500',
                  {
                    'ml-10': isSelected,
                  },
                )}></span>
            </div>
            <span className='mb-4 mt-4 pl-0 pr-10 flex-1 pt-7 self-start'>
              <p className='text-x1  font-bold '>Air Quality Updates</p>
              <p className='text-gray-500 mt-2'>Supporting Text</p>
            </span>
          </div>

          <div className='flex mt-0 items-center justify-between gap-7 mb-0 pb-0'>
            <div
              onClick={() => setIsSelectedb(!isSelectedb)}
              className={classNames(
                'flex w-20 h-10 bg-gray-500 m-0 mt-3 rounded-full cursor-pointer transition-all duration-500',
                { 'bg-blue-700': isSelectedb },
              )}>
              <span
                className={classNames(
                  'm-0.5 h-9 w-10 bg-white rounded-full transition-all duration-500',
                  {
                    'ml-10': isSelectedb,
                  },
                )}></span>
            </div>
            <span className='mb-4 mt-4 pl-0 pr-10 flex-1 pt-7 self-start'>
              <p className='text-x1  font-bold '>AirQo Updates and Announcements</p>
              <p className='text-gray-500 mt-2'>Supporting Text</p>
            </span>
          </div>

          <div className='flex mt-0 items-center justify-between gap-7 mb-0.01'>
            <div
              onClick={() => setIsSelectedc(!isSelectedc)}
              className={classNames(
                'flex w-20 h-10 bg-gray-500 m-0 mt-3 rounded-full cursor-pointer transition-all duration-500',
                { 'bg-blue-700': isSelectedc },
              )}>
              <span
                className={classNames(
                  'm-0.5 h-9 w-10 bg-white rounded-full transition-all duration-500',
                  {
                    'ml-10': isSelectedc,
                  },
                )}></span>
            </div>
            <span className='mb-4 mt-4 pl-0 pr-10 flex-1 pt-7 self-start'>
              <p className='text-x1  font-bold '>AirQo Newsletter</p>
              <p className='text-gray-500 mt-2'>Supporting Text</p>
            </span>
          </div>
          <hr className='h mt-3 mx-0 my-0.1' />
        </div>
      </div>
    </Layout>
  );
}

export default ProfileDetails;
