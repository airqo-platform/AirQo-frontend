import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import LoadSpinner from './src/components/LoadSpinner';
import store from './store';
import NetworkStatus from './NetworkStatus';
import Scroll_to_top from './src/components/Scroll_to_top';
import ReactGA from 'react-ga';

// Lazy load components
const HomePage = lazy(() => import('src/pages/HomePage'));
const Press = lazy(() => import('./src/pages/Press/Press'));
const LegalPage = lazy(() => import('./src/pages/Legal'));
const ResearchPage = lazy(() => import('./src/pages/OurSolutions/ResearchPage'));
const CommunityPage = lazy(() => import('./src/pages/OurSolutions/CommunityPage'));
const AfricanCitiesPage = lazy(() => import('./src/pages/OurSolutions/AfricanCitiesPage'));
const AboutUsPage = lazy(() => import('./src/pages/AboutUsPage'));
const ContactUsPage = lazy(() => import('./src/pages/ContactUs/ContactUs'));
const ContactForm = lazy(() => import('./src/pages/ContactUs/ContactForm'));
const Feedback = lazy(() => import('./src/pages/ContactUs/Feedback'));
const ExploreData = lazy(() => import('./src/pages/ExploreData'));
const CareerPage = lazy(() => import('./src/pages/CareerPage'));
const CareerDetailPage = lazy(() => import('./src/pages/CareerDetailPage'));
const PublicationsPage = lazy(() => import('./src/pages/Publications/Publications'));
const EventsPage = lazy(() => import('./src/pages/Events'));
const EventsDetailsPage = lazy(() => import('./src/pages/Events/Details'));
const MonitorPage = lazy(() => import('./src/pages/OurProducts/MonitorPage'));
const AnalyticsPage = lazy(() => import('./src/pages/OurProducts/AnalyticsPage'));
const MobileAppPage = lazy(() => import('./src/pages/OurProducts/MobileAppPage'));
const APIPage = lazy(() => import('./src/pages/OurProducts/ApiPage'));
const CalibrationPage = lazy(() => import('./src/pages/OurProducts/CalibrationPage'));
const QRCodeRedirectPage = lazy(() => import('./src/pages/ExploreData/Redirect'));
const CleanAirPage = lazy(() => import('./src/pages/CleanAir/CleanAirAbout'));
const CleanAirMemberPage = lazy(() => import('./src/pages/CleanAir/CleanAirPartners'));
const CleanAirEventsPage = lazy(() => import('./src/pages/CleanAir/CleanAirEvents'));
const CleanAirResourcesPage = lazy(() => import('./src/pages/CleanAir/CleanAirPublications'));
const CleanAirEventsDetailsPage = lazy(() => import('./src/pages/CleanAir/EventDetails'));
const CleanAirForumEvent = lazy(() => import('./src/pages/CleanAir/CleanAirForumEvent'));
const PartnerDetailPage = lazy(() => import('./src/pages/Partners'));
const Error404 = lazy(() => import('src/pages/ErrorPages/Error404'));
const ExploreApp = lazy(() => import('./src/pages/ExploreData'));

// PageTracker component
const PageTracker = () => {
  const location = useLocation();
  React.useEffect(() => {
    ReactGA.pageview(location.pathname + location.search);
  }, [location]);
  return null;
};

const AppRoutes = () => (
  <Suspense fallback={<LoadSpinner />}>
    <PageTracker />
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
      <Route path="/clean-air/event-details/:uniqueTitle" element={<CleanAirEventsDetailsPage />} />
      <Route path="*" element={<Error404 />} />
    </Routes>
    <Scroll_to_top />
  </Suspense>
);

const App = () => {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      ReactGA.initialize('G-79ZVCLEDSG');
    }
  }, []);

  return (
    <NetworkStatus>
      <Provider store={store}>
        <I18nextProvider i18n={i18n}>
          <Router>
            <AppRoutes />
          </Router>
        </I18nextProvider>
      </Provider>
    </NetworkStatus>
  );
};

export default App;
