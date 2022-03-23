import React from 'react';
import Page from './Page';
import Hero from '../components/Hero';
import Monitor from '../components/Monitor';
import GetApp from '../components/get-app/GetApp';
import MapSection from '../components/MapSection/MapSection';
import Partners from '../components/Partners';

const HomePage = () => (
    <Page>
        <div className="HomePage">
            <Hero />
            <Partners />
            <Monitor />
            <MapSection />
            <GetApp />
        </div>
    </Page>
);

export default HomePage;
