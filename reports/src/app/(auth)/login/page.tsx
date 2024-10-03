import React from 'react';

import FormComponent from '@/components/forms/auth';
import CustomInputField from '@/components/ui/customInputField';

const Page = () => {
  return (
    <div className="min-h-screen">
      <FormComponent btnText="Login">
        <CustomInputField
          name="email"
          type="email"
          autoComplete="email"
          placeholder="JoneDoe@airqo.net"
          label="Email"
        />
        <CustomInputField
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          label="Password"
        />
      </FormComponent>
    </div>
  );
};

export default Page;
