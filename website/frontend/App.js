import React, { Suspense } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Provider } from 'react-redux';

import Loadspinner from './src/components/LoadSpinner';

const HomePage = React.lazy(() => import('src/pages/HomePage'));
const Press = React.lazy(() => import('src/pages/Press/Press'));
const LegalPage = React.lazy(() => import('src/pages/Legal'));
const ResearchPage = React.lazy(() => import('src/pages/OurSolutions/ResearchPage'));
const CommunityPage = React.lazy(() => import('src/pages/OurSolutions/CommunityPage'));
const AfricanCitiesPage = React.lazy(() => import('src/pages/OurSolutions/AfricanCitiesPage'));
const AboutUsPage = React.lazy(() => import('src/pages/AboutUsPage'));
const ContactUsPage = React.lazy(() => import('src/pages/ContactUs/ContactUs'));
const ContactForm = React.lazy(() => import('src/pages/ContactUs/ContactForm'));
const Feedback = React.lazy(() => import('src/pages/ContactUs/Feedback'));
const ExploreData = React.lazy(() => import('src/pages/ExploreData'));
const CareerPage = React.lazy(() => import('src/pages/CareerPage'));
const CareerDetailPage = React.lazy(() => import('src/pages/CareerDetailPage'));
const PublicationsPage = React.lazy(() => import('src/pages/Publications/Publications'));
const EventsPage = React.lazy(() => import('src/pages/Events'));
const EventsDetailsPage = React.lazy(() => import('src/pages/Events/Details'));
const MonitorPage = React.lazy(() => import('src/pages/OurProducts/MonitorPage'));
const AnalyticsPage = React.lazy(() => import('src/pages/OurProducts/AnalyticsPage'));
const MobileAppPage = React.lazy(() => import('src/pages/OurProducts/MobileAppPage'));
const APIPage = React.lazy(() => import('src/pages/OurProducts/ApiPage'));
const CalibrationPage = React.lazy(() => import('src/pages/OurProducts/CalibrationPage'));
const QRCodeRedirectPage = React.lazy(() => import('src/pages/ExploreData/Redirect'));
const CleanAirPage = React.lazy(()=>import('src/pages/CleanAir'))
const CleanAirEventsPage = React.lazy(() => import('src/pages/CleanAir/CleanAirEvents'))
const CleanAirPartnersPage = React.lazy(() => import('src/pages/CleanAir/CleanAirPartners'))
const CleanAirPressPage = React.lazy(() => import('src/pages/CleanAir/CleanAirPress'))

import { loadAirQloudSummaryData } from 'reduxStore/AirQlouds/operations';
import store from './store';
import PartnerDetailPage from './src/pages/Partners';
import Error404 from 'src/pages/ErrorPages/Error404';
import { ExploreApp } from './src/pages/ExploreData';

store.dispatch(loadAirQloudSummaryData());

const App = () => {
  return (
    <Provider store={store}>
      <Router>
        <Suspense fallback={<Loadspinner />}>
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
            <Route path="/publications" element={<PublicationsPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/events/:uniqueTitle" element={<EventsDetailsPage />} />
            <Route path="/products/monitor" element={<MonitorPage />} />
            <Route path="/products/analytics" element={<AnalyticsPage />} />
            <Route path="/products/mobile-app" element={<MobileAppPage />} />
            <Route path="/products/api" element={<APIPage />} />
            <Route path="/download-apps" element={<QRCodeRedirectPage />} />
            <Route path="/products/calibrate" element={<CalibrationPage />} />
            <Route path="/clean-air" element={<CleanAirPage />}/>
            <Route path='/clean-air/events' element={<CleanAirEventsPage />} />
            <Route path='/clean-air/partners' element={<CleanAirPartnersPage />} />
            <Route path='/clean-air/press' element={<CleanAirPressPage />} />
            <Route path="*" element={<Error404 />} />
          </Routes>
        </Suspense>
      </Router>
    </Provider>
  );
};

export default App;
