import React, { useEffect, useState } from 'react';
import Page from '../Page';
import SEO from 'utils/seo';
import EventsHeader from './Header';
import EventsNavigation from './Navigation';
import { useInitScrollTop } from 'utils/customHooks';
import EventCard from './EventCard';
import { useDispatch, useSelector } from 'react-redux';
import { getAllEvents } from '../../../reduxStore/Events/EventSlice';
import { isEmpty } from 'underscore';
import Loadspinner from '../../components/LoadSpinner';

const EventsPage = () => {
  useInitScrollTop();
  const dispatch = useDispatch();

  const days = (date_1, date_2) => {
    let difference = date_1.getTime() - date_2.getTime();
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays;
  };

  const navTabs = ['upcoming events', 'past events'];
  const selectedNavTab = useSelector((state) => state.eventsNavTab.tab);
  const eventsApiData = useSelector((state) => state.eventsData.events);

  const featuredEvents = eventsApiData.filter((event) => event.event_tag === 'featured');
  const upcomingEvents = eventsApiData.filter((event) => {
    if (event.end_date !== null) return days(new Date(event.end_date), new Date()) >= 1;
    return days(new Date(event.start_date), new Date()) >= -0;
  });
  const pastEvents = eventsApiData.filter((event) => {
    if (event.end_date !== null) return days(new Date(event.end_date), new Date()) <= 0;
    return days(new Date(event.start_date), new Date()) <= -1;
  });

  const loading = useSelector((state) => state.eventsData.loading);

  // hook to handle see more/less button
  const [numEventsToShow, setNumEventsToShow] = useState(3);

  // for handling see less button
  const handleSeeLess = () => {
    setNumEventsToShow(9);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (isEmpty(eventsApiData)) {
      dispatch(getAllEvents());
    }
  }, [selectedNavTab]);

  return (
    <>
      {loading ? (
        <Loadspinner />
      ) : (
        <Page>
          <div className="list-page events">
            <SEO
              title="Events"
              siteTitle="AirQo"
              description="Advancing air quality management in African cities"
            />
            {featuredEvents.length > 0 &&
              featuredEvents
                .slice(0, 1)
                .map((event) => (
                  <EventsHeader
                    key={event.id}
                    title={event.title}
                    subText={event.title_subtext}
                    startDate={event.start_date}
                    endDate={event.end_date}
                    startTime={event.start_time}
                    endTime={event.end_time}
                    registerLink={event.registration_link}
                    detailsLink={event.unique_title}
                    eventImage={event.event_image}
                    show={true}
                  />
                ))}
            <div className="page-body">
              <div className="content">
                <EventsNavigation navTabs={navTabs} />
                <div className="event-cards">
                  {selectedNavTab === 'upcoming events' &&
                    upcomingEvents
                      .slice(0, numEventsToShow)
                      .map((event) => (
                        <EventCard
                          key={event.id}
                          image={event.event_image}
                          title={event.title}
                          subText={event.title_subtext}
                          startDate={event.start_date}
                          endDate={event.end_date}
                          link={event.unique_title}
                        />
                      ))}
                  {selectedNavTab === 'past events' &&
                    pastEvents
                      .slice(0, numEventsToShow)
                      .map((event) => (
                        <EventCard
                          key={event.id}
                          image={event.event_image}
                          title={event.title}
                          subText={event.title_subtext}
                          startDate={event.start_date}
                          endDate={event.end_date}
                          link={event.unique_title}
                        />
                      ))}
                </div>
                {upcomingEvents.length === 0 && selectedNavTab === 'upcoming events' ? (
                  <div className="no-events">
                    <span>There are currently no events</span>
                  </div>
                ) : null}
              </div>
              {(upcomingEvents.length > numEventsToShow && selectedNavTab === 'upcoming events') ||
              (pastEvents.length > numEventsToShow && selectedNavTab === 'past events') ? (
                <div className="see-more">
                  <button onClick={() => setNumEventsToShow(numEventsToShow + 6)}>More</button>
                </div>
              ) : null}

              {numEventsToShow > 9 && (
                <div className="see-less">
                  <button onClick={() => handleSeeLess()}>Less</button>
                </div>
              )}
            </div>
          </div>
        </Page>
      )}
    </>
  );
};

export default EventsPage;
