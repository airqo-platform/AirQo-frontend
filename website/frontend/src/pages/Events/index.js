import React from 'react';
import Page from '../Page';
import SEO from 'utils/seo';
import EventsHeader from './Header';
import EventsNavigation from './Navigation';
import { useInitScrollTop } from 'utils/customHooks';
import EventCard from './EventCard';
import DummyImage from 'assets/img/AfricanCities/UnepKenya-2.jpg';

const EventsPage = () => {
  useInitScrollTop();
  return (
    <Page>
      <div className="list-page">
        <SEO
          title="Events"
          siteTitle="AirQo"
          description="Advancing air quality management in African cities"
        />
        <EventsHeader title={'AirQo at Cop27'} subText={'Advancing air quality management in African cities'} />
        <EventsNavigation />
        <div>
          <EventCard
            image={DummyImage}
            title={'AirQo conference'}
            subText={
              'AirQo Project to expand its air quality monitoring network to more African countries'
            }
            startDate={'24th March, 2023'}
          />
        </div>
      </div>
    </Page>
  );
};

export default EventsPage;
