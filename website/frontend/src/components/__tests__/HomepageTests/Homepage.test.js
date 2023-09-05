import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import ImpactNumbers from '../../ImpactNumbers';
import TopBar from '../../nav/TopBar';
import Hero from '../../Hero';
import Partners from '../../Partners';
import AirQuality from '../../AirQuality/AirQuality';
import Monitor from '../../Monitor';
import { AnalyticsSection } from '../../AnalyticsSection';
import ApiSection from '../../ApiSection/ApiSection';
import MapSection from '../../MapSection/MapSection';
import GetApp from '../../get-app/GetApp';
import HighlightsSection from '../../HighlightsSection';
import Footer from '../../Footer';

const testComponentRendering = (Component) => {
  render(
    <BrowserRouter>
      <Component />
    </BrowserRouter>
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

test('renders ImpactNumbers without crashing', () => {
  testComponentRendering(ImpactNumbers);
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

test('renders HighlightsSection without crashing', () => {
  testComponentRendering(HighlightsSection);
});

test('renders Footer without crashing', () => {
  testComponentRendering(Footer);
});
