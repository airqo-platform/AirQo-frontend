import React from 'react';
import Footer from './components/Footer';
import ShortCuts from './components/ShortCuts';

const Calendar = () => {
  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  return (
    <div className='flex items-center justify-center w-full min-h-screen bg-none'>
      <div className='flex bg-white shadow-lg rounded-xl'>
        <div className='flex flex-col'>
          <div className='flex divide-x'>
            {/* shortcut section */}
            <ShortCuts />
            {/* calendar section */}
            <div className='flex flex-col px-6 pt-5 pb-6'>
              <div className='flex items-center justify-between'>
                <button className='flex items-center justify-center p-2 hover:bg-gray-50 border border-gray-300 rounded-md'>
                  <svg className='w-6 h-6 text-gray-500 stroke-current' fill='none'>
                    <path
                      d='M13.25 8.75L9.75 12l3.5 3.25'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
                <div className='text-sm text-gray-700 font-semibold'>February 2023</div>
                <button className='flex items-center justify-center p-2 hover:bg-gray-50 border border-gray-300 rounded-md'>
                  <svg className='w-6 h-6 text-gray-500 stroke-current' fill='none'>
                    <path
                      d='M10.75 8.75l3.5 3.25-3.5 3.25'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
              </div>
              <div className='grid grid-cols-7 text-xs text-center text-gray-900'>
                {/* Days of the week */}
                {daysOfWeek.map((day) => (
                  <span className='flex text-gray-600 items-center justify-center w-10 h-10 font-semibold rounded-lg'>
                    {day}
                  </span>
                ))}

                <span className='flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg'>
                  1
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg'>
                  2
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg'>
                  3
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg'>
                  4
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg'>
                  5
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg'>
                  6
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg'>
                  7
                </span>

                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>8</span>
                <span className='flex items-center justify-center w-10 h-10 font-semibold rounded-lg bg-gray-50'>
                  9
                </span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>10</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>11</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>12</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>13</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>14</span>

                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>15</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>16</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>17</span>
                <span className='flex items-center justify-center w-10 h-10 text-white bg-blue-600 rounded-l-lg'>
                  18
                </span>
                <span className='flex items-center justify-center w-10 h-10 font-semibold text-blue-600 rounded-none bg-gray-50'>
                  19
                </span>
                <span className='flex items-center justify-center w-10 h-10 font-semibold text-blue-600 rounded-none bg-gray-50'>
                  20
                </span>
                <span className='flex items-center justify-center w-10 h-10 font-semibold text-blue-600 rounded-none rounded-tr-lg bg-gray-50'>
                  21
                </span>

                <span className='flex items-center justify-center w-10 h-10 font-semibold text-blue-600 rounded-none rounded-l-lg bg-gray-50'>
                  22
                </span>
                <span className='flex items-center justify-center w-10 h-10 font-semibold text-blue-600 rounded-none bg-gray-50'>
                  23
                </span>
                <span className='flex items-center justify-center w-10 h-10 font-semibold text-blue-600 rounded-none bg-gray-50'>
                  24
                </span>
                <span className='flex items-center justify-center w-10 h-10 font-semibold text-blue-600 rounded-none bg-gray-50'>
                  25
                </span>
                <span className='flex items-center justify-center w-10 h-10 font-semibold text-blue-600 rounded-none bg-gray-50'>
                  26
                </span>
                <span className='flex items-center justify-center w-10 h-10 font-semibold text-blue-600 rounded-none bg-gray-50'>
                  27
                </span>
                <span className='flex items-center justify-center w-10 h-10 font-semibold text-blue-600 rounded-none rounded-br-lg bg-gray-50'>
                  28
                </span>

                <span className='flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg'>
                  1
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg'>
                  2
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg'>
                  3
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg'>
                  4
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg'>
                  5
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg'>
                  6
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg'>
                  7
                </span>
              </div>
            </div>
            <div className='flex flex-col px-6 pt-5 pb-6'>
              <div className='flex items-center justify-between'>
                <button className='flex items-center justify-center p-2 hover:bg-gray-50 border border-gray-300 rounded-md'>
                  <svg className='w-6 h-6 text-gray-900 stroke-current' fill='none'>
                    <path
                      d='M13.25 8.75L9.75 12l3.5 3.25'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
                <div className='text-sm text-gray-700 font-semibold'>March 2023</div>
                <button className='flex items-center justify-center p-2 hover:bg-gray-50 border border-gray-300 rounded-md'>
                  <svg className='w-6 h-6 text-gray-900 stroke-current' fill='none'>
                    <path
                      d='M10.75 8.75l3.5 3.25-3.5 3.25'
                      strokeWidth='1.5'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
              </div>
              <div className='grid grid-cols-7 text-xs text-center text-gray-900'>
                {/* Days of the week */}
                {daysOfWeek.map((day) => (
                  <span className='flex text-gray-600 items-center justify-center w-10 h-10 font-semibold rounded-lg'>
                    {day}
                  </span>
                ))}

                <span className='flex items-center justify-center w-10 h-10 text-blue-600 rounded-none rounded-tl-lg bg-gray-50'>
                  1
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-blue-600 rounded-none bg-gray-50'>
                  2
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-blue-600 rounded-none bg-gray-50'>
                  3
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-blue-600 rounded-none bg-gray-50'>
                  4
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-blue-600 rounded-none bg-gray-50'>
                  5
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-blue-600 rounded-none bg-gray-50'>
                  6
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-blue-600 rounded-none bg-gray-50'>
                  7
                </span>

                <span className='flex items-center justify-center w-10 h-10 text-blue-600 rounded-none rounded-bl-lg bg-gray-50'>
                  8
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-blue-600 rounded-none bg-gray-50'>
                  9
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-blue-600 rounded-none bg-gray-50'>
                  10
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-white bg-blue-600 rounded-r-lg'>
                  11
                </span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>12</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>13</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>14</span>

                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>15</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>16</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>17</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>18</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>19</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>20</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>21</span>

                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>22</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>23</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>24</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>25</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>26</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>27</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>28</span>

                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>29</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>30</span>
                <span className='flex items-center justify-center w-10 h-10 rounded-lg'>31</span>
                <span className='flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg'>
                  1
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg'>
                  2
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg'>
                  3
                </span>
                <span className='flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg'>
                  4
                </span>
              </div>
            </div>
          </div>
          {/* footer section */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default Calendar;
