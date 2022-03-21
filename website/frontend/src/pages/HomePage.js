import React from 'react';
import Page from './Page';
import Hero from '../components/Hero';
import Monitor from '../components/Monitor';

const HomePage = () => (
    <Page>
        <div className="HomePage">
            <Hero />
            <Monitor />
        </div>
    </Page>
);

export default HomePage;
