import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { Provider } from 'react-redux';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import LoadSpinner from './src/components/LoadSpinner';
import store from './store';
import NetworkStatus from './NetworkStatus';
import Scroll_to_top from './src/components/Scroll_to_top';
import ReactGA4 from 'react-ga4';

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

const ROUTES = [
  { path: '/', Component: HomePage },
  { path: '/solutions/research', Component: ResearchPage },
  { path: '/solutions/communities', Component: CommunityPage },
  { path: '/solutions/african-cities', Component: AfricanCitiesPage },
  { path: '/careers', Component: CareerPage },
  { path: '/careers/:uniqueTitle', Component: CareerDetailPage },
  { path: '/about-us', Component: AboutUsPage },
  { path: '/press', Component: Press },
  { path: '/legal', Component: LegalPage },
  { path: '/contact', Component: ContactUsPage },
  { path: '/contact/form', Component: ContactForm },
  { path: '/contact/sent', Component: Feedback },
  { path: '/explore-data', Component: ExploreData },
  { path: '/explore-data/download-apps', Component: ExploreApp },
  { path: '/partners/:uniqueTitle', Component: PartnerDetailPage },
  { path: '/resources', Component: PublicationsPage },
  { path: '/events', Component: EventsPage },
  { path: '/events/:uniqueTitle', Component: EventsDetailsPage },
  { path: '/products/monitor', Component: MonitorPage },
  { path: '/products/analytics', Component: AnalyticsPage },
  { path: '/products/mobile-app', Component: MobileAppPage },
  { path: '/products/api', Component: APIPage },
  { path: '/download-apps', Component: QRCodeRedirectPage },
  { path: '/products/calibrate', Component: CalibrationPage },
  { path: '/clean-air', Component: CleanAirPage },
  { path: '/clean-air/about', Component: CleanAirPage },
  { path: '/clean-air/membership', Component: CleanAirMemberPage },
  { path: '/clean-air/events', Component: CleanAirEventsPage },
  { path: '/clean-air/resources', Component: CleanAirResourcesPage },
  { path: '/clean-air/forum', Component: CleanAirForumEvent },
  { path: '/clean-air/event-details/:uniqueTitle', Component: CleanAirEventsDetailsPage },
  { path: '*', Component: Error404 }
];

const PageTracker = () => {
  const location = useLocation();
  useEffect(() => {
    ReactGA4.send({ hitType: 'pageview', page: location.pathname + location.search });
  }, [location]);
  return null;
};

const AppRoutes = () => (
  <Suspense fallback={<LoadSpinner />}>
    <PageTracker />
    <Routes>
      {ROUTES.map(({ path, Component }) => (
        <Route key={path} path={path} element={<Component />} />
      ))}
    </Routes>
    <Scroll_to_top />
  </Suspense>
);

const App = () => {
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      ReactGA4.initialize('G-79ZVCLEDSG');
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
