import React from 'react';
import Page from '../Page';
import SEO from 'utils/seo';
import EventsHeader from './Header';
import EventsNavigation from './Navigation';
import { useInitScrollTop } from 'utils/customHooks';
import EventCard from './EventCard';
import DummyImage from 'assets/img/Events/banner.png';
import { useSelector } from 'react-redux';

const EventsPage = () => {
  useInitScrollTop();
  const navTabs = ['upcoming events', 'past events'];
  const selectedNavTab = useSelector((state) => state.eventsNavTab.tab);

  return (
    <Page>
      <div className="list-page events">
        <SEO
          title="Events"
          siteTitle="AirQo"
          description="Advancing air quality management in African cities"
        />
        <EventsHeader
          title={
            'Championing Liveable urban Environments through African Networks for Air (CLEAN AIR)'
          }
          subText={'Extended workshop and launchpad for regional collaborations'}
          startDate={'2023.04.03'}
          endDate={'2023.04.05'}
          startTime={'8:00am'}
          endTime={'5:00pm'}
          registerLink={
            'https://docs.google.com/forms/d/e/1FAIpQLSfm4d8isDZPfpUb9xHbWB9oVOcjyUzXXaVWXiH8c9X482KxDQ/viewform'
          }
          detailsLink={'/events/details'}
        />
        <div className="page-body">
          <div className="content">
            <EventsNavigation navTabs={navTabs} />
            {selectedNavTab === 'upcoming events' ? (
              <>
                <div className="event-cards">
                  <EventCard
                    image={DummyImage}
                    title={
                      'Championing Liveable urban Environments through African Networks for Air (CLEAN AIR)'
                    }
                    subText={'Extended workshop and launchpad for regional collaborations'}
                    startDate={'2023.04.03'}
                    link={'/events/details'}
                  />
                </div>
              </>
            ) : (
              <div
                className="event-cards"
                style={{
                  alignItems: 'center',
                  justifyItems: 'center',
                  gridTemplateColumns: '1fr',
                  fontSize: '36px',
                  fontWeight: '200',
                  textAlign: 'center',
                  lineHeight: '48px'
                }}>
                <span>There are currently no past events</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Page>
  );
};

export default EventsPage;
