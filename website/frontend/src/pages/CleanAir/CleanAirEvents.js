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
import useWindowSize from 'utilities/customHooks';
import Loadspinner from 'src/components/LoadSpinner/SectionLoader';
import { useTranslation, Trans } from 'react-i18next';

const ITEMS_PER_PAGE = 9;

const days = (date_1, date_2) => {
  let difference = date_1.getTime() - date_2.getTime();
  let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
  return TotalDays;
};

const CleanAirEvents = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const navTabs = [
    t('cleanAirSite.events.subNavs.upcoming'),
    t('cleanAirSite.events.subNavs.past')
  ];
  const selectedNavTab = useSelector((state) => state.eventsNavTab.tab);
  const allEventsData = useSelector((state) => state.eventsData.events);
  const { width } = useWindowSize();

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

  useEffect(() => {
    let backdropRevElement = document.querySelector('.backdrop-rev');

    if (backdropRevElement) {
      if (width < 1081) {
        backdropRevElement.style.flexDirection = 'column';
      } else {
        backdropRevElement.style.flexDirection = 'column-reverse';
      }
    }
  }, [width]);

  return (
    <div className="page-wrapper">
      <SEO
        title="Events"
        siteTitle="CLEAN-Air Network"
        description="CLEAN-Air Africa Network is a network of African cities, governments, and partners committed to improving air quality and reducing carbon emissions through sustainable transport and mobility solutions."
      />

      <div className="partners">
        <div className="partners-wrapper">
          <p className="partners-intro">
            <Trans i18nKey="cleanAirSite.events.section1">
              The CLEAN-Air Network provides a platform for facilitating engagement activities
              including conferences, webinars, workshops, training and community campaigns.
              <br />
              <br />
              Partners will have access to shared resources in the form of social media toolkits,
              press release templates, digital banners, etc. that can be customised to suit every
              activity. Members will also have access to a diverse pool of experts who can be
              invited to participate in different engagement activities, either as speakers or
              co-organizers, etc.
            </Trans>
          </p>
        </div>
      </div>

      {/* <div className="partners">
        <div className="partners-wrapper">
          <div className="event-intro-image">
            <img src={event1} alt="CLEAN-Air Africa Network Events" className="events-image" />
          </div>
        </div>
      </div> */}

      <div>
        <hr className="separator-1" />
      </div>

      <div>
        <SplitSection
          content={t('cleanAirSite.events.section2.subText')}
          showButton={true}
          customBtn={
            <ButtonCTA
              label={t('cleanAirSite.events.section2.cta')}
              link="https://docs.google.com/forms/d/14jKDs2uCtMy2a_hzyCiJnu9i0GbxITX_DJxVB4GGP5c/edit"
              style={{
                width: '200px',
                marginTop: '10px'
              }}
            />
          }
          imgURL={event2}
          bgColor="#FFFFFF"
          wrapperPadding="0"
          reverse
          titleSection={true}
        />
      </div>

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
                    web_category={event.website_category}
                  />
                ))}
            </div>
          </div>
          {loading ? <Loadspinner /> : null}
          {!loading && upcomingEvents.length === 0 && selectedNavTab === 'upcoming events' ? (
            <div className="no-events">There are currently no upcoming events</div>
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
