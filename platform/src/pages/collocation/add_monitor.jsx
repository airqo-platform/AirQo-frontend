import React, { useState } from 'react';
import Layout from '../../common/components/Layout';
import ContentBox from '../../common/components/Layout/content_box';
import NavigationBreadCrumb from '../../common/components/Navigation/breadcrumb';
import Calendar from 'react-calendar';
import { format } from 'date-fns';
import ArrowRight from '@/icons/Common/arrow_right_blue.svg'

// AVOID USING ABSOLUTE NAMING FOR CLASSES e.g text-[#1C1B1F]. CONFIGURE STYLES IN THE tailwind.config.js FILE TO ENCOURAGE REUSABILITY AND EASY MAINTENANCE
// CREATE COMPONENTS FOR REPETITIVE LAYOUTS. FOLDER: src/common/components/Layout

const AddMonitor = () => {
  const collationDurations = [4, 7, 14];
  const [duration, setDuration] = useState(new Date());
  const value = format(duration, 'dd/mm/yyyy')

  return (
    <Layout>
      <NavigationBreadCrumb backLink={'/collocation/collocate'} navTitle={'Add monitor'}>
        <button className='flex justify-center items-center btn btn-blue normal-case gap-2 rounded-none bg-blue border-transparent hover:bg-dark-blue hover:border-dark-blue text-base' disabled>
          Start collocation
        </button>
      </NavigationBreadCrumb>
      <ContentBox>
        <div className='grid grid-cols-1 md:grid-cols-3'>
          {/* TABLE */}
          <div className='border-r border-grey-150 col-span-2 gap-0'> table</div>
          {/* CALENDAR */}
          <div className='px-8 py-6'>
            <div>
              <h3 className='font-medium text-2xl'> Choose collocation period</h3>
              <h5 className='text text-light-text mb-4'> Select your collocation period.</h5>
              {collationDurations.map((duration) => (
                <div className='border border-grey-100 py-2 px-4 rounded-md my-2 flex flex-row justify-between items-center font-medium'>
                  {duration} {'days'}
                  <input type='radio' />
                </div>
              ))}
              <div className='border border-grey-100 py-2 px-4 rounded-md my-2 flex flex-row justify-between items-center font-medium'>
                Custom
                <input type='radio' />
              </div>
            </div>
            <div className='my-8 flex flex-row justify-between items-center flex-wrap'>
              {/* TODO: Duration upon range selection */}
              <span className='border border-grey-100 rounded-md py-1 px-3 opacity-50 tracking-wide'>
                {value}
              </span>
              <span className='bg-baby-blue h-8 w-8 flex justify-center items-center'>
                <ArrowRight />
              </span>
              <span className='border border-grey-100 rounded-md py-1 px-3 opacity-50 tracking-wide'>
                {value}
              </span>
            </div>
            {/* TODO: Calendar styling and connecting duration */}
            <div>
              <Calendar onChange={setDuration} value={duration} selectRange={true} />
            </div>
          </div>
        </div>
      </ContentBox>
    </Layout>
  );
};

export default AddMonitor;
