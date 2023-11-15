import React from 'react';

const ShortCuts = () => {
  return (
    <div className='py-6 border-r border-gray-100 w-40'>
      <ul className='flex flex-col text-sm leading-5 font-normal'>
        <li>
          <button className='px-6 py-[10px] w-full leading-5 hover:bg-gray-50 text-gray-700 text-left'>
            Today
          </button>
        </li>
        <li>
          <button className='px-6 py-[10px] w-full leading-5 hover:bg-gray-50 text-gray-700 text-left'>
            Yesterday
          </button>
        </li>
        <li>
          <button className='px-6 py-[10px] w-full leading-5 hover:bg-gray-50 text-gray-700 text-left'>
            Last 7 days
          </button>
        </li>
        <li>
          <button className='px-6 py-[10px] w-full leading-5 hover:bg-gray-50 text-gray-700 text-left'>
            Last 30 days
          </button>
        </li>
        <li>
          <button className='px-6 py-[10px] w-full leading-5 hover:bg-gray-50 text-gray-700 text-left'>
            Last 90 days
          </button>
        </li>
        <li>
          <button className='px-6 py-[10px] w-full leading-5 hover:bg-gray-50 text-gray-700 text-left'>
            This month
          </button>
        </li>
        <li>
          <button className='px-6 py-[10px] w-full leading-5 hover:bg-gray-50 text-gray-700 text-left'>
            This year
          </button>
        </li>
        <li>
          <button className='px-6 py-[10px] w-full leading-5 hover:bg-gray-50 text-gray-700 text-left'>
            Last year
          </button>
        </li>
      </ul>
    </div>
  );
};

export default ShortCuts;
