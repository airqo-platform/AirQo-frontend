import React from 'react';
import ContactUs from '.';
import Cards from './cards';
import { useInitScrollTop } from 'utilities/customHooks';

const ContactUsPage = () => {
  useInitScrollTop();
  return (
    <>
      <ContactUs>
        <Cards />
      </ContactUs>
    </>
  );
};

export default ContactUsPage;
