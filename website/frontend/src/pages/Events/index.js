import React, { useState } from 'react';
import Page from '../Page';
import SEO from 'utilities/seo';
import EventsHeader from './Header';
import EventsNavigation from './Navigation';
import { useInitScrollTop } from 'utilities/customHooks';
import EventCard from './EventCard';
import { useSelector } from 'react-redux';
import SectionLoader from '../../components/LoadSpinner/SectionLoader';
import { useTranslation } from 'react-i18next';

const EventsPage = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  const loading = useSelector((state) => state.eventsData.loading);
  const [numEventsToShow, setNumEventsToShow] = useState(9);
  const navTabs = [`${t('about.events.navTabs.upcoming')}`, `${t('about.events.navTabs.past')}`];
  const selectedNavTab = useSelector((state) => state.eventsNavTab.tab);
  const allEventsData = useSelector((state) => state.eventsData.events);

  /**
   * @description filter events data based on the website category and event tag
   * @param {Array} allEventsData
   * @returns {Array} eventsApiData
   * @returns {Array} featuredEvents
   * @returns {Array} upcomingEvents
   * @returns {Array} pastEvents
   */
  const eventsApiData = allEventsData.filter((event) => event.website_category === 'airqo');
  const featuredEvents = eventsApiData.filter((event) => event.event_tag === 'featured');
  const upcomingEvents = eventsApiData.filter((event) => {
    if (event.end_date !== null) return days(new Date(event.end_date), new Date()) >= 1;
    return days(new Date(event.start_date), new Date()) >= -0;
  });
  const pastEvents = eventsApiData.filter((event) => {
    if (event.end_date !== null) return days(new Date(event.end_date), new Date()) <= 0;
    return days(new Date(event.start_date), new Date()) <= -1;
  });

  /**
   * @description function to calculate the difference between two dates
   * @param {Date} date_1
   * @param {Date} date_2
   * @returns {Number} TotalDays
   */
  const days = (date_1, date_2) => {
    let difference = date_1.getTime() - date_2.getTime();
    let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
    return TotalDays;
  };

  /**
   * @description function to handle the see less button
   */
  const handleSeeLess = () => {
    setNumEventsToShow(9);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Page>
        {/* SEO */}
        <SEO
          title="Events"
          siteTitle="AirQo"
          description="Advancing air quality management in African cities"
        />

        {loading ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '50vh'
            }}>
            <SectionLoader />
          </div>
        ) : (
          <div className="list-page events">
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
                  {selectedNavTab === t('about.events.navTabs.upcoming') &&
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
                          web_category={event.website_category}
                        />
                      ))}
                  {selectedNavTab === t('about.events.navTabs.past') &&
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
                          web_category={event.website_category}
                        />
                      ))}
                </div>
              </div>
              {upcomingEvents.length === 0 &&
              selectedNavTab === t('about.events.navTabs.upcoming') ? (
                <div className="no-events">
                  <span>{t('about.events.noEvents')}</span>
                </div>
              ) : null}
              <div className="see-more-container">
                {(upcomingEvents.length > numEventsToShow &&
                  selectedNavTab === t('about.events.navTabs.upcoming')) ||
                (pastEvents.length > numEventsToShow &&
                  selectedNavTab === t('about.events.navTabs.past')) ? (
                  <div className="see-more">
                    <button onClick={() => setNumEventsToShow(numEventsToShow + 6)}>
                      {t('about.events.cta.showMore')}
                    </button>
                  </div>
                ) : null}
                {numEventsToShow > 9 && (
                  <div className="see-less">
                    <button onClick={() => handleSeeLess()}>
                      {t('about.events.cta.showLess')}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Page>
    </>
  );
};

export default EventsPage;
