import React, { useEffect, useState } from 'react';
import SEO from 'utilities/seo';
import { isEmpty } from 'underscore';
import { useInitScrollTop } from 'utilities/customHooks';
import { getAllEvents } from '../../../reduxStore/Events/EventSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RegisterSection, IntroSection } from 'components/CleanAir';
import eventImage from 'assets/img/cleanAir/events.png';
import useWindowSize from 'utilities/customHooks';
import Loadspinner from 'src/components/LoadSpinner/SectionLoader';
import { useTranslation, Trans } from 'react-i18next';
import Membership from 'assets/img/cleanAir/membership.png';

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

  const eventsToShow =
    selectedNavTab === t('cleanAirSite.events.subNavs.upcoming') ? upcomingEvents : pastEvents;
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

      {/* Intro section */}
      <IntroSection image={eventImage} subtext1={t('cleanAirSite.events.section1.text')} />

      {/* Events Navigation */}
      <div class="events">
        <h1 class="events-title">Upcoming Events</h1>
        <div class="event-cards">
          <div class="event-card">
            <img src="image.jpg" alt="Event Image" class="event-image" />
            <h2 class="event-title">Climate and Clean Air Conference 2024</h2>
            <p class="event-subtitle">Healthy Air for All? Responding to a changing environment.</p>
            <p class="event-date">21st February, 2024</p>
            <button class="event-button">Read more</button>
          </div>
        </div>

        <hr />

        <h1 class="events-title">Past Events</h1>
        <div class="event-cards">
          <div class="event-card">
            <img src="image.jpg" alt="Event Image" class="event-image" />
            <h2 class="event-title">Climate and Clean Air Conference 2024</h2>
            <p class="event-subtitle">Healthy Air for All? Responding to a changing environment.</p>
            <p class="event-date">21st February, 2024</p>
            <button class="event-button">Read more</button>
          </div>
        </div>
      </div>

      {/* Register Membership */}
      <RegisterSection link="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform" />
    </div>
  );
};

export default CleanAirEvents;
