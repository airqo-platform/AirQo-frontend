import React from 'react';
import { useInitScrollTop } from 'utilities/customHooks';
import Page from './Page';
import Hero from '../components/Hero';
import Monitor from '../components/Monitor';
import GetApp from '../components/get-app/GetApp';
import MapSection from '../components/MapSection/MapSection';
import { AnalyticsSection } from '../components/AnalyticsSection';
import ApiSection from '../components/ApiSection/ApiSection';
import AirQuality from '../components/AirQuality/AirQuality';
import Partners from '../components/Partners';
import HighlightsSection from '../components/HighlightsSection';
import SEO from 'utilities/seo';
// import TweetsComponent from '../components/Tweets';
import ImpactNumbers from '../components/ImpactNumbers';

const HomePage = () => {
  useInitScrollTop();
  return (
    <Page>
      <div className="HomePage">
        <SEO
          title="AirQo Africa"
          siteTitle="Clean Air for all African Cities"
          description="AirQo is Africa's leading air quality monitoring network, using low-cost sensors and AI to provide crucial data for African cities. Join us in creating data-driven solutions for cleaner air across the continent."
          canonicalUrl={['https://airqo.africa', 'https://airqo.net', 'https://airqo.mak.ac.ug']}
          keywords="air quality, Africa, pollution monitoring, clean air, urban health, environmental data, AI, smart cities"
          article={false}
        />
        <Hero />
        <Partners />
        <AirQuality />
        <ImpactNumbers />
        <Monitor />
        <AnalyticsSection />
        <ApiSection />
        <MapSection />
        <GetApp />
        <HighlightsSection />
        {/* <TweetsComponent /> */}
      </div>
    </Page>
  );
};

export default HomePage;
