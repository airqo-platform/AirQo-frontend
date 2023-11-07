import React, { useEffect, useState } from 'react';
import SEO from 'utilities/seo';
import { isEmpty } from 'underscore';
import { useInitScrollTop } from 'utilities/customHooks';
import { getAllEvents } from '../../../reduxStore/Events/EventSlice';
import { useDispatch, useSelector } from 'react-redux';
import { ButtonCTA } from 'components/CleanAir';
import EventsNavigation from '../Events/Navigation';
import { SplitSection } from 'components/CleanAir';
import EventCard from '../Events/EventCard';
import event1 from 'assets/img/cleanAir/event-sec1.png';
import event2 from 'assets/img/cleanAir/event-sec2.png';

const ITEMS_PER_PAGE = 9;

const days = (date_1, date_2) => {
  let difference = date_1.getTime() - date_2.getTime();
  let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
  return TotalDays;
};

const CleanAirEvents = () => {
  useInitScrollTop();
  const dispatch = useDispatch();
  const navTabs = ['upcoming events', 'past events'];
  const selectedNavTab = useSelector((state) => state.eventsNavTab.tab);
  const allEventsData = useSelector((state) => state.eventsData.events);

  const [currentPage, setCurrentPage] = useState(1);

  const eventsApiData = allEventsData.filter((event) => event.website_category === 'cleanair');

  const upcomingEvents = eventsApiData.filter((event) => {
    if (event.end_date !== null) return days(new Date(event.end_date), new Date()) >= 1;
    return days(new Date(event.start_date), new Date()) >= -0;
  });

  const pastEvents = eventsApiData.filter((event) => {
    if (event.end_date !== null) return days(new Date(event.end_date), new Date()) <= 0;
    return days(new Date(event.start_date), new Date()) <= -1;
  });

  const handlePageChange = (direction) => {
    if (direction === 'next') {
      setCurrentPage(currentPage + 1);
      document.getElementById('top_body').scrollIntoView();
    } else if (direction === 'prev' && currentPage > 1) {
      setCurrentPage(currentPage - 1);
      document.getElementById('top_body').scrollIntoView();
    }
  };

  const eventsToShow = selectedNavTab === 'upcoming events' ? upcomingEvents : pastEvents;
  const totalPages = Math.ceil(eventsToShow.length / ITEMS_PER_PAGE);

  const loading = useSelector((state) => state.eventsData.loading);

  useEffect(() => {
    if (isEmpty(eventsApiData)) {
      dispatch(getAllEvents());
    }
  }, [selectedNavTab]);

  return (
    <div>
      <SEO
        title="CLEAN-Air Africa Network | Events"
        siteTitle="CLEAN-Air Africa Network"
        description="CLEAN-Air Africa Network is a network of African cities, governments, and partners committed to improving air quality and reducing carbon emissions through sustainable transport and mobility solutions."
      />

      <div className="partners">
        <div className="partners-wrapper">
          <p className="partners-intro">
            The CLEAN-Air Network provides a platform that unites organizations and individuals
            committed to air quality management. The platform provides a launchpad for your
            engagement activities, from conferences and webinars to workshops.
            <br />
            <br />
            Members will also have access to a diverse pool of experts who can be invited to
            participate in different engagement activities, either as speakers or co-organizers.
          </p>
        </div>
      </div>

      <div className="partners">
        <div className="partners-wrapper">
          <div className="event-intro-image">
            <img src={event1} alt="CLEAN-Air Africa Network Events" className="events-image" />
          </div>
        </div>
      </div>

      <hr className="separator-1" />

      <SplitSection
        content="  <p
            style={{
              color: '#353E52',
              fontSize: '24px',
              lineHeight: '32px',
              fontWeight: 400,
              fontStyle: 'normal'
            }}>
            Increase your event's visibility. Register your workshops, conferences, webinars, trainings, roundtable meetings, outdoor campaigns etc and tap into invaluable networking prospects.
          </p>"
        showButton={true}
        customBtn={
          <ButtonCTA
            label="Register Event"
            link="https://docs.google.com/forms/d/14jKDs2uCtMy2a_hzyCiJnu9i0GbxITX_DJxVB4GGP5c/edit"
            style={{
              width: '200px',
              marginTop: '10px'
            }}
          />
        }
        imgURL={event2}
        bgColor="#FFFFFF"
        reverse
      />

      <div className="list-page events">
        <div className="page-body" id="top_body">
          <div className="content">
            <EventsNavigation navTabs={navTabs} />
            <div className="event-cards">
              {eventsToShow
                .slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
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
          </div>
          {loading ? (
            <div
              style={{
                display: 'flex',
                width: '100%',
                justifyContent: 'center',
                alignItems: 'center',
                marginTop: '50px'
              }}>
              loading ...
            </div>
          ) : null}
          {!loading && upcomingEvents.length === 0 && selectedNavTab === 'upcoming events' ? (
            <div className="no-events">There are currently no events</div>
          ) : null}
          {eventsToShow.length > ITEMS_PER_PAGE && (
            <ul className="pagination">
              <li className="page-item">
                <a
                  disabled={currentPage === 1}
                  className="page-link"
                  onClick={() => handlePageChange('prev')}>
                  {'<'}
                </a>
              </li>
              <li className="page-item">
                <a className={'page-link page-number active'}>{currentPage}</a>
              </li>
              <li className="page-item">
                <a
                  disabled={currentPage === totalPages}
                  className="page-link"
                  onClick={() => handlePageChange('next')}>
                  {'>'}
                </a>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default CleanAirEvents;
