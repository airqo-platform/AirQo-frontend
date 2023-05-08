import React, { useState } from 'react';
import AccountPageLayout from '@/components/Account/Layout';
import RadioComponent from '@/components/Account/RadioComponent';

const AccountCreationPage4 = () => {
  const radioButtonText = [
    'Education related',
    'Business related',
    'Personal related',
    'Nonprofit related',
    'Government related',
    'Others',
  ];
  const [clickedButton, setClickedButton] = useState('');

  return (
    <AccountPageLayout>
      <div className='w-full'>
        <h2 className='text-3xl text-black-700 font-medium'>
          What brings you to the AirQo Analytics Dashboard?
        </h2>
        <p className='text-xl text-black-700 font-normal mt-3'>
          We will help you get started based on your response
        </p>
        <div className='mt-6'>
          <div className='w-full grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-4'>
            {clickedButton === ''
              ? radioButtonText.map((text, index) => (
                  <div key={index} className='w-full' onClick={() => setClickedButton(text)}>
                    <RadioComponent text={text} />
                  </div>
                ))
              : radioButtonText
                  .filter((button) => button === clickedButton)
                  .map((text, index) => (
                    <div key={index} className='w-full col-span-2'>
                      <RadioComponent text={text} />
                      <div className='mt-6'>
                        <div className='w-full'>
                          <div className='text-sm'>Give us more details about your interests?</div>
                          <div className='mt-2 w-10/12'>
                            <textarea
                              rows='3'
                              className='textarea textarea-lg w-full bg-form-input rounded-none outline-0 focus:border-0'
                              placeholder='Type here'></textarea>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
          </div>
        </div>
        <div className='mt-10'>
          <div className='w-1/3 mt-6 md:mt-0'>
            <a href='#'>
              <button className='w-full btn bg-blue-900 rounded-none text-sm outline-none border-none hover:bg-blue-950'>
                Continue
              </button>
            </a>
          </div>
        </div>
      </div>
    </AccountPageLayout>
  );
};

export default AccountCreationPage4;
