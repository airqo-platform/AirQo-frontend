import React, { useEffect, useState, useRef } from 'react';
import withAuth from '@/core/utils/protectedRoute';
import Layout from '@/components/Layout';
import OverView from './_components/OverView';
import { useDispatch } from 'react-redux';
import { fetchUserPreferences } from '@/lib/store/services/charts/userDefaultsSlice';
import AlertBox from '@/components/AlertBox';

import useOutsideClick from '@/core/utils/useOutsideClick';

const AuthenticatedHomePage = () => {
  const dispatch = useDispatch();
  const [alert, setAlert] = useState({ type: '', message: '', show: false });
  const [customise, setCustomise] = useState(false);

  const customiseRef = useRef();

  useOutsideClick(customiseRef, () => {
    if (customise) setCustomise(false);
  });

  useEffect(() => {
    const userId = JSON.parse(localStorage.getItem('loggedUser'))?._id;
    if (userId) {
      dispatch(fetchUserPreferences(userId));
    }
  }, [dispatch]);

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
