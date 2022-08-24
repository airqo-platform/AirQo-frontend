import React from 'react';
import { useInitScrollTop } from 'utils/customHooks';
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
import SEO from 'utils/seo';

const HomePage = () => {
    useInitScrollTop();
    return(
        <Page>
            <div className="HomePage">
                <SEO
                    title="AirQo Africa"
                    siteTitle="Clean Air for all African Cities"
                    description="AirQo is Africa's leading air quality monitoring, research and analytics network. We use low cost technologies and AI to close the gaps in air quality data across the continent. Work with us to find data-driven solutions to your air quality challenges."
                />
                <Hero />
                <Partners />
                <AirQuality />
                <Monitor />
                <AnalyticsSection />
                <ApiSection />
                <MapSection />
                <GetApp />
                <HighlightsSection />
            </div>
        </Page>
    );
}

export default HomePage;
