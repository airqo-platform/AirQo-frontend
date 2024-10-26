import React, { useEffect, useState, useMemo, useRef } from 'react';
import withAuth from '@/core/utils/protectedRoute';
import Layout from '@/components/Layout';
import { useDispatch, useSelector } from 'react-redux';
import OverView from './_components/OverView';
import AlertBox from '@/components/AlertBox';
import { getIndividualUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import { fetchSitesSummary } from '@/lib/store/services/sitesSummarySlice';
import { useOutsideClick } from '@/core/hooks';
import { setChartSites } from '@/lib/store/services/charts/ChartSlice';

const AuthenticatedHomePage = () => {
  const dispatch = useDispatch();
  const [alert, setAlert] = useState({ type: '', message: '', show: false });
  const [customise, setCustomise] = useState(false);
  const preferenceData = useSelector(
    (state) => state.defaults.individual_preferences,
  );
  const customiseRef = useRef();

  useOutsideClick(customiseRef, () => {
    if (customise) setCustomise(false);
  });

  // Memoize user data from local storage to avoid rerenders
  const user = useMemo(
    () => JSON.parse(localStorage.getItem('loggedUser')),
    [],
  );

  // Fetch sites summary only once when the component mounts
  useEffect(() => {
    dispatch(fetchSitesSummary());
  }, [dispatch]);

  // Fetch user preferences only if a user is found in local storage
  useEffect(() => {
    if (user) {
      dispatch(getIndividualUserPreferences(user._id));
    }
  }, [dispatch, user]);

  /**
   * Sets chart details based on user preferences.
   */
  useEffect(() => {
    if (
      preferenceData &&
      preferenceData.length > 0 &&
      preferenceData[0]?.selected_sites
    ) {
      const { selected_sites } = preferenceData[0];
      const chartSites = selected_sites
        .map((site) => site?._id)
        .filter(Boolean);
      dispatch(setChartSites(chartSites));
    }
  }, [dispatch, preferenceData]);

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
