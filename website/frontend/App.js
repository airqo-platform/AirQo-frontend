import React, { Suspense, useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import LoadSpinner from './src/components/LoadSpinner';
import { loadAirQloudSummaryData } from 'reduxStore/AirQlouds/operations';
import store from './store';
import PartnerDetailPage from './src/pages/Partners';
import Error404 from 'src/pages/ErrorPages/Error404';
import { ExploreApp } from './src/pages/ExploreData';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import NetworkStatus from './NetworkStatus';

import Press from './src/pages/Press/Press';
import LegalPage from './src/pages/Legal';
import ResearchPage from './src/pages/OurSolutions/ResearchPage';
import CommunityPage from './src/pages/OurSolutions/CommunityPage';
import AfricanCitiesPage from './src/pages/OurSolutions/AfricanCitiesPage';
import AboutUsPage from './src/pages/AboutUsPage';
import ContactUsPage from './src/pages/ContactUs/ContactUs';
import ContactForm from './src/pages/ContactUs/ContactForm';
import Feedback from './src/pages/ContactUs/Feedback';
import ExploreData from './src/pages/ExploreData';
import CareerPage from './src/pages/CareerPage';
import CareerDetailPage from './src/pages/CareerDetailPage';
import PublicationsPage from './src/pages/Publications/Publications';
import EventsPage from './src/pages/Events';
import EventsDetailsPage from './src/pages/Events/Details';
import MonitorPage from './src/pages/OurProducts/MonitorPage';
import AnalyticsPage from './src/pages/OurProducts/AnalyticsPage';
import MobileAppPage from './src/pages/OurProducts/MobileAppPage';
import APIPage from './src/pages/OurProducts/ApiPage';
import CalibrationPage from './src/pages/OurProducts/CalibrationPage';
import QRCodeRedirectPage from './src/pages/ExploreData/Redirect';
import CleanAirPage from './src/pages/CleanAir/CleanAirAbout';
import CleanAirMemberPage from './src/pages/CleanAir/CleanAirPartners';
import CleanAirEventsPage from './src/pages/CleanAir/CleanAirEvents';
import CleanAirResourcesPage from './src/pages/CleanAir/CleanAirPublications';
import CleanAirEventsDetailsPage from './src/pages/CleanAir/EventDetails';
import CleanAirForumEvent from './src/pages/CleanAir/CleanAirForumEvent';

const HomePage = React.lazy(() => import('src/pages/HomePage'));

store.dispatch(loadAirQloudSummaryData());

const App = () => {
  const [showScroll, setShowScroll] = useState(false);

  const checkScrollTop = useCallback(() => {
    const shouldShowScroll = window.scrollY >= 400;
    if (showScroll !== shouldShowScroll) {
      setShowScroll(shouldShowScroll);
    }
  }, [showScroll]);

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [checkScrollTop]);

  const ScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <NetworkStatus>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <Suspense fallback={<LoadSpinner />}>
            <Router>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/solutions/research" element={<ResearchPage />} />
                <Route path="/solutions/communities" element={<CommunityPage />} />
                <Route path="/solutions/african-cities" element={<AfricanCitiesPage />} />
                <Route path="/careers" element={<CareerPage />} />
                <Route path="/careers/:uniqueTitle" element={<CareerDetailPage />} />
                <Route path="/about-us" element={<AboutUsPage />} />
                <Route path="/press" element={<Press />} />
                <Route path="/legal" element={<LegalPage />} />
                <Route path="/contact" element={<ContactUsPage />} />
                <Route path="/contact/form" element={<ContactForm />} />
                <Route path="/contact/sent" element={<Feedback />} />
                <Route path="/explore-data" element={<ExploreData />} />
                <Route path="/explore-data/download-apps" element={<ExploreApp />} />
                <Route path="/partners/:uniqueTitle" element={<PartnerDetailPage />} />
                <Route path="/resources" element={<PublicationsPage />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:uniqueTitle" element={<EventsDetailsPage />} />
                <Route path="/products/monitor" element={<MonitorPage />} />
                <Route path="/products/analytics" element={<AnalyticsPage />} />
                <Route path="/products/mobile-app" element={<MobileAppPage />} />
                <Route path="/products/api" element={<APIPage />} />
                <Route path="/download-apps" element={<QRCodeRedirectPage />} />
                <Route path="/products/calibrate" element={<CalibrationPage />} />
                <Route path="/clean-air" element={<CleanAirPage />} />
                <Route path="/clean-air/about" element={<CleanAirPage />} />
                <Route path="/clean-air/membership" element={<CleanAirMemberPage />} />
                <Route path="/clean-air/events" element={<CleanAirEventsPage />} />
                <Route path="/clean-air/resources" element={<CleanAirResourcesPage />} />
                <Route path="/clean-air/forum" element={<CleanAirForumEvent />} />
                <Route
                  path="/clean-air/event-details/:uniqueTitle"
                  element={<CleanAirEventsDetailsPage />}
                />
                <Route path="*" element={<Error404 />} />
              </Routes>
            </Router>
          </Suspense>
        </I18nextProvider>
        {showScroll && (
          <div className="scroll-top" onClick={ScrollTop}>
            <ArrowUpwardIcon
              className="scroll-top-icon"
              sx={{
                width: '40px',
                height: '40px',
                color: '#FFF'
              }}
            />
          </div>
        )}
      </Provider>
    </NetworkStatus>
  );
};

export default App;
