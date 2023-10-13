import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';

import TopBar from 'components/nav/TopBar';
import Hero from 'components/Hero';
import Partners from 'components/Partners';
import AirQuality from 'components/AirQuality/AirQuality';
import Monitor from 'components/Monitor';
import { AnalyticsSection } from 'components/AnalyticsSection';
import ApiSection from 'components/ApiSection/ApiSection';
import MapSection from 'components/MapSection/MapSection';
import GetApp from 'components/get-app/GetApp';
import HighlightsSection from 'components/HighlightsSection';
import ImpactNumbers from 'components/ImpactNumbers';
import Footer from 'components/Footer';
import store from '../../../store';

const testComponentRendering = (Component) => {
    return (
        <Provider store={store}>
            <BrowserRouter>
                <Component />
            </BrowserRouter>
        </Provider>
    );
};

// Testing if each component renders without crashing
test('renders TopBar without crashing', () => {
    testComponentRendering(TopBar);
});

test('renders HeroSection without crashing', () => {
    testComponentRendering(Hero);
});

test('renders PartnersSection without crashing', () => {
    testComponentRendering(Partners);
});

test('renders AirQualitySection without crashing', () => {
    testComponentRendering(AirQuality);
});

test('renders MonitorSection without crashing', () => {
    testComponentRendering(Monitor);
});

test('renders AnalyticsSection without crashing', () => {
    testComponentRendering(AnalyticsSection);
});

test('renders ApiSection without crashing', () => {
    testComponentRendering(ApiSection);
});

test('renders MapSection without crashing', () => {
    testComponentRendering(MapSection);
});

test('renders GetApp without crashing', () => {
    testComponentRendering(GetApp);
});

// Test video files
jest.mock('../../assets/video/opening.mov', () => {
    return {
        default: 'opening.mov',
    };
});
const video = require('../../assets/video/opening.mov');
test('Mocked .mov file', () => {
    expect(video.default).toBe('opening.mov');
});