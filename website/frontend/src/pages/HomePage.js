import React from 'react';
import Page from './Page';
import Hero from '../components/Hero';
import Monitor from '../components/Monitor';
import GetApp from '../components/get-app/GetApp';

const HomePage = () => (
    <Page>
        <div className="HomePage">
            <Hero />
            <Monitor />
            <GetApp />
        </div>
    </Page>
);

export default HomePage;
