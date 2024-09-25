import React, { useState, useRef } from 'react';
import withAuth from '@/core/utils/protectedRoute';
import Layout from '@/components/Layout';
import OverView from './_components/OverView';
import AlertBox from '@/components/AlertBox';

import { useOutsideClick } from '@/core/hooks';

const AuthenticatedHomePage = () => {
  const [alert, setAlert] = useState({ type: '', message: '', show: false });
  const [customise, setCustomise] = useState(false);

  const customiseRef = useRef();

  useOutsideClick(customiseRef, () => {
    if (customise) setCustomise(false);
  });

  return (
    <Layout
      topbarTitle={'Analytics'}
      noBorderBottom
      pageTitle={'Analytics'}
      showSearch
    >
      <AlertBox
        type={alert.type}
        message={alert.message}
        show={alert.show}
        hide={() => setAlert({ ...alert, show: false })}
      />
      <OverView />
    </Layout>
  );
};

export default withAuth(AuthenticatedHomePage);
