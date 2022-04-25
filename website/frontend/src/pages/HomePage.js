import React from 'react';
import Page from './Page';
import Hero from '../components/Hero';
import Monitor from '../components/Monitor';
import GetApp from '../components/get-app/GetApp';
import MapSection from '../components/MapSection/MapSection';
import { AnalyticsSection } from '../components/AnalyticsSection';
import ApiSection from '../components/ApiSection/ApiSection';
import AirQommunitiesSection from '../components/AirQommunitiesSection/AirQommunitiesSection';

const HomePage = () => (
    <Page>
        <div className="HomePage">
            <Hero />
            <Monitor />
            <AnalyticsSection />
            <ApiSection />
            <MapSection />
            <GetApp />
            <AirQommunitiesSection />
        </div>
    </Page>
);

export default HomePage;
