import React from 'react'
import AccountPageLayout from '../../../common/components/Account/Layout'

const AccountCreationPage3 = () => {
  return (
    <AccountPageLayout>
      <div className='w-full'>
        <h2 className='text-3xl text-black-700 font-medium'>Verify your details</h2>
        <p className='text-xl text-black-700 font-normal mt-3'>
          We sent a verification email to <b>greta.nagawa@gmail.com</b>
        </p>
        <div className='mt-6'>
          <span className='text-sm text-grey-300'>Not seeing the email?</span>
          <span className='text-sm text-blue-900 font-medium'>
            {' '}
            <a href='#'>Resend</a>
          </span>
        </div>
      </div>
    </AccountPageLayout>
  );
}

export default AccountCreationPage3