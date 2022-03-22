import React from 'react';
import Page from './Page';
import Hero from '../components/Hero';
import Monitor from '../components/Monitor';
import TopBar from '../components/nav/TopBar';

const HomePage = () => (
    <Page>
        <div className="HomePage">
            <TopBar />
            <Hero />
            <Monitor />
        </div>
    </Page>
);

export default HomePage;
