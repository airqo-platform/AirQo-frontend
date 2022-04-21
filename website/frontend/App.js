import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from 'src/pages/HomePage';
import ResearchPage from 'src/pages/ResearchPage';
import Press from 'src/pages/Press/Press';
import Terms from "./src/pages/Legal/Terms";
import CommunityPage from "./src/pages/CommunityPage";
import AboutUsPage from "./src/pages/AboutUsPage";
import ContactUsPage from './src/pages/ContactUs/ContactUs';
import ContactForm from './src/pages/ContactUs/ContactForm';
import AfricanCitiesPage, { ContentUganda, ContentKenya } from "./src/pages/AfricanCitiesPage";
import GetInvolved from './src/pages/GetInvolved';

const App = () => (
    <Router>
        <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/solutions/research" element={<ResearchPage />} />
            <Route path="/solutions/communities" element={<CommunityPage />} />
            <Route path="/solutions/african-cities" element={<AfricanCitiesPage />}>
                <Route path="uganda" element={<ContentUganda />} />
                <Route path="kenya" element={<ContentKenya />} />
            </Route>
            <Route path="/about-us" element={<AboutUsPage />} />
            <Route path="/press" element={<Press />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/contact" element={<ContactUsPage />} />
            <Route path="/contact/form" element={<ContactForm />} />
            <Route path="/get-involved" element={<GetInvolved />} />
        </Routes>

    </Router>
);

export default App;
