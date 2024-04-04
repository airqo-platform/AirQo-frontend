import { useEffect, useState } from 'react';
import ContentBox from '@/components/Layout/content_box';
import Button from '@/components/Button';
import AddIcon from '@/icons/Actions/plus.svg';
import TokenTable from '@/components/Settings/API/tokens_table';

const API = () => {
  return (
    <div data-testid='api-tab' className='px-3 lg:px-16 py-3 flex flex-col gap-10'>
      <div className='flex justify-start flex-col md:grid md:grid-cols-3 gap-4 items-start'>
        <div className='md:col-span-1'>
          <h3 className='text-grey-710 font-medium text-sm'>API clients</h3>
          <p className='text-grey-500 text-sm'>
            To generate an API token, you'll need to create a client. Clients are used to generate
            API tokens that can be used to authenticate with the API.
          </p>
        </div>
        <div className='md:col-span-2 w-full'>
          <ContentBox noMargin>
            <div className='flex flex-col py-6 px-5 gap-5'>
              <div>
                {/* // TODO: ADD CLIENTS TABLE */}
                {/* <div className='w-auto flex flex-col items-end'>
          <TokenTable/>
          <Button
            onClick={() => {}}
            className='w-[152px] flex justify-center items-center gap-2 rounded py-3 px-4 bg-blue-600 text-white text-sm font-medium'
          >
            <AddIcon /> Create client
          </Button>
          </div> */}
              </div>
            </div>
          </ContentBox>
        </div>
      </div>
      <div className='flex justify-start flex-col md:grid md:grid-cols-3 gap-4 items-start'>
        <div className='md:col-span-1'>
          <h3 className='text-grey-710 font-medium text-sm'>API tokens</h3>
          <p className='text-grey-500 text-sm'>
            Your secret API keys are listed below. Please note that we do not display your secret
            API keys again after you generate them.
          </p>
        </div>
        <div className='md:col-span-2 w-full'>
          <TokenTable />
        </div>
      </div>
    </div>
  );
};

export default API;
