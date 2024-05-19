import React, { useState, useMemo, useCallback } from 'react';
import SEO from 'utilities/seo';
import { useInitScrollTop, useClickOutside } from 'utilities/customHooks';
import { useSelector } from 'react-redux';
import {
  RegisterSection,
  IntroSection,
  RotatingLoopIcon,
  usePagination,
  Pagination
} from 'components/CleanAir';
import eventImage from 'assets/img/cleanAir/events.webp';
import { useTranslation } from 'react-i18next';
import DoneIcon from '@mui/icons-material/Done';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import Slide from '@mui/material/Slide';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FilterListIcon from '@mui/icons-material/FilterList';
import CleanAirPageContainer from './Page';

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

const CleanAirEvents = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  const allEventsData = useSelector((state) => state.eventsData.events);
  const navigate = useNavigate();
  const itemsPerPage = 3;
  const [openDate, setOpenDate] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState();
  const [filter, setFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState(0);
  const [hideEvents, setHideEvents] = useState(true);
  const loading = useSelector((state) => state.eventsData.loading);
  const language = useSelector((state) => state.eventsNavTab.languageTab);

  /**
   * @description Custom hook to handle click outside of the date and filter dropdowns
   * @param {Function} callback
   * @returns {Object} dateRef
   */
  const dateRef = useClickOutside(() => setOpenDate(false));
  const filterRef = useClickOutside(() => setOpenFilter(false));

  /**
   * @description filter events data based on the website category.
   * @returns {Array} eventsApiData
   * @returns {Array} upcomingEvents
   * @returns {Array} pastEvents
   */
  const eventsApiData = useMemo(() => {
    return allEventsData.filter((event) => {
      if (event.website_category !== 'cleanair') {
        return false;
      }

      if (selectedMonth !== 0) {
        const eventDate = new Date(event.start_date);
        if (eventDate.getMonth() !== selectedMonth - 1) {
          return false;
        }
      }

      if (filter && filter !== 'all' && filter !== 'others' && event.event_category !== filter) {
        return false;
      }

      return true;
    });
  }, [allEventsData, selectedMonth, filter, language]);

  const upcomingEvents = useMemo(() => getUpcomingEvents(eventsApiData), [eventsApiData]);
  const pastEvents = useMemo(() => getPastEvents(eventsApiData), [eventsApiData]);

  /**
   * @description function to get upcoming events and past events
   * @param {Array} events
   * @returns {Array} upcomingEvents
   * @returns {Array} pastEvents
   */
  function getUpcomingEvents(events) {
    return events.filter((event) => {
      if (event.end_date !== null) return days(new Date(event.end_date), new Date()) >= 1;
      return days(new Date(event.start_date), new Date()) >= -0;
    });
  }

  function getPastEvents(events) {
    return events.filter((event) => {
      if (event.end_date !== null) return days(new Date(event.end_date), new Date()) <= 0;
      return days(new Date(event.start_date), new Date()) <= -1;
    });
  }

  /**
   * @description function to route to event details page
   */
  const routeToDetails = useCallback(
    (events) => (event) => {
      event.preventDefault();
      navigate(`/clean-air/event-details/${events.unique_title}/`);
    },
    [navigate]
  );

  const handleDateSelect = (value) => {
    setFilter('all');
    setSelectedDate(value);
    setSelectedMonth(value - 1);
    setOpenDate(false);
  };

  const handleFilterSelect = (value) => {
    setSelectedDate(1);
    setFilter(value);
    setOpenFilter(false);
  };

  /**
   * @description Custom hook to handle pagination
   */
  const {
    currentItems: currentPastEvents,
    currentPage: currentPastPage,
    setCurrentPage: setCurrentPastPage,
    totalPages: totalPastPages
  } = usePagination(pastEvents, itemsPerPage);

  const {
    currentItems: currentUpcomingEvents,
    currentPage: currentUpcomingPage,
    setCurrentPage: setCurrentUpcomingPage,
    totalPages: totalUpcomingPages
  } = usePagination(upcomingEvents, itemsPerPage);

  /**
   * @description dropdown options for date and filter
   * @returns {Array} dates
   * @returns {Array} filterOption1
   * @returns {Array} filterOption2
   */
  const dates = [
    { month: t('cleanAirSite.events.dropdowns.filter.options1.1'), value: 1 },
    { month: t('cleanAirSite.events.dropdowns.date.options.1'), value: 2 },
    { month: t('cleanAirSite.events.dropdowns.date.options.2'), value: 3 },
    { month: t('cleanAirSite.events.dropdowns.date.options.3'), value: 4 },
    { month: t('cleanAirSite.events.dropdowns.date.options.4'), value: 5 },
    { month: t('cleanAirSite.events.dropdowns.date.options.5'), value: 6 },
    { month: t('cleanAirSite.events.dropdowns.date.options.6'), value: 7 },
    { month: t('cleanAirSite.events.dropdowns.date.options.7'), value: 8 },
    { month: t('cleanAirSite.events.dropdowns.date.options.8'), value: 9 },
    { month: t('cleanAirSite.events.dropdowns.date.options.9'), value: 10 },
    { month: t('cleanAirSite.events.dropdowns.date.options.10'), value: 11 },
    { month: t('cleanAirSite.events.dropdowns.date.options.11'), value: 12 },
    { month: t('cleanAirSite.events.dropdowns.date.options.12'), value: 13 }
  ];

  const filterOption1 = [
    { label: t('cleanAirSite.events.dropdowns.filter.options1.1'), value: 'all' },
    { label: t('cleanAirSite.events.dropdowns.filter.options1.2'), value: 'webinar' },
    { label: t('cleanAirSite.events.dropdowns.filter.options1.3'), value: 'workshop' },
    { label: t('cleanAirSite.events.dropdowns.filter.options1.4'), value: 'marathon' },
    { label: t('cleanAirSite.events.dropdowns.filter.options1.5'), value: 'conference' },
    { label: t('cleanAirSite.events.dropdowns.filter.options1.6'), value: 'summit' },
    { label: t('cleanAirSite.events.dropdowns.filter.options1.7'), value: 'commemoration' },
    { label: t('cleanAirSite.events.dropdowns.filter.options1.8'), value: 'others' }
  ];

  const filterOption2 = [
    { label: t('cleanAirSite.events.dropdowns.filter.options2.1'), value: 'all' },
    { label: t('cleanAirSite.events.dropdowns.filter.options2.2'), value: 'in-person' },
    { label: t('cleanAirSite.events.dropdowns.filter.options2.3'), value: 'hybrid' },
    { label: t('cleanAirSite.events.dropdowns.filter.options2.4'), value: 'others' }
  ];

  return (
    <CleanAirPageContainer>
      <div className="page-wrapper">
        <SEO
          title="Events"
          siteTitle="CLEAN-Air Network"
          description="CLEAN-Air Africa Network is a network of African cities, governments, and partners committed to improving air quality and reducing carbon emissions through sustainable transport and mobility solutions."
        />

        {/* Intro section */}
        <IntroSection
          image={eventImage}
          subtext1={t('cleanAirSite.events.section1.text')}
          imagePosition={'50%'}
        />

        {/* Events */}
        {loading ? (
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              padding: '50px 0'
            }}>
            <RotatingLoopIcon />
          </div>
        ) : null}
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 'auto',
            backgroundColor: '#EDF3FF',
            display: loading ? 'none' : 'block'
          }}>
          <div className="events">
            <div className="events-header">
              <h1 className="events-title">{t('cleanAirSite.events.sectionTitles.upcoming')}</h1>
              <div className="events-header-buttons">
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setOpenDate(!openDate)}>
                    <span style={{ marginRight: '10px' }}>
                      {t('cleanAirSite.events.dropdowns.date.btnLabel')}
                    </span>{' '}
                    <KeyboardArrowDownIcon />
                  </button>
                  <Slide direction="down" in={openDate}>
                    <ul
                      className="drop-down-list"
                      ref={dateRef}
                      style={{
                        left: window.innerWidth < 768 ? '0' : ''
                      }}>
                      {dates.map((date) => (
                        <li
                          key={date.value}
                          style={{
                            backgroundColor: date.value === selectedDate ? '#EBF5FF' : ''
                          }}
                          onClick={() => handleDateSelect(date.value)}>
                          {date.month}
                          {date.value === selectedDate && (
                            <DoneIcon sx={{ stroke: '#145FFF', width: '16px', height: '16px' }} />
                          )}
                        </li>
                      ))}
                    </ul>
                  </Slide>
                </div>
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setOpenFilter(!openFilter)}>
                    <FilterListIcon />{' '}
                    <span style={{ marginLeft: '10px' }}>
                      {t('cleanAirSite.events.dropdowns.filter.btnLabel')}
                    </span>
                  </button>
                  <Slide direction="down" in={openFilter}>
                    <ul
                      className="drop-down-list"
                      ref={filterRef}
                      style={{
                        left: window.innerWidth < 768 ? '0' : ''
                      }}>
                      <div className="label">
                        {t('cleanAirSite.events.dropdowns.filter.label1')}
                      </div>
                      <div>
                        {filterOption1.map((option) => (
                          <li
                            key={option.value}
                            style={{
                              backgroundColor: option.value === filter ? '#EBF5FF' : ''
                            }}
                            onClick={() => {
                              handleFilterSelect(option.value);
                            }}>
                            {option.label}
                            {option.value === filter && (
                              <DoneIcon sx={{ stroke: '#145FFF', width: '16px', height: '16px' }} />
                            )}
                          </li>
                        ))}
                      </div>
                      <div className="label">
                        {t('cleanAirSite.events.dropdowns.filter.label2')}
                      </div>
                      <div>
                        {filterOption2.map((option) => (
                          <li
                            key={option.value}
                            style={{
                              backgroundColor: option.value === filter ? '#EBF5FF' : ''
                            }}
                            onClick={() => {
                              setFilter(option.value);
                              setOpenFilter(false);
                            }}>
                            {option.label}
                            {option.value === filter && (
                              <DoneIcon sx={{ stroke: '#145FFF', width: '16px', height: '16px' }} />
                            )}
                          </li>
                        ))}
                      </div>
                    </ul>
                  </Slide>
                </div>
              </div>
            </div>
            <div className="event-cards">
              {currentUpcomingEvents.length > 0 ? (
                <>
                  {currentUpcomingEvents.map((event) => (
                    <div className="event-card" key={event.id}>
                      <img
                        src={event.event_image}
                        alt="Event Image"
                        className="event-image"
                        loading="lazy"
                      />
                      <div className="even-card-details">
                        <h2 className="event-title">
                          {event.title.length > 50 ? event.title.slice(0, 50) + '...' : event.title}
                        </h2>
                        <p className="event-subtitle">
                          {event.title_subtext.length > 100
                            ? event.title_subtext.slice(0, 100) + '...'
                            : event.title_subtext}
                        </p>
                        <p className="event-date">
                          {format(new Date(event.start_date), 'dd MMMM, yyyy')}
                        </p>
                        <button className="event-button" onClick={routeToDetails(event)}>
                          {t('cleanAirSite.events.card.btnText')}
                        </button>
                      </div>
                    </div>
                  ))}
                  {/* Pagination */}
                  <Pagination
                    currentPage={currentUpcomingPage}
                    setCurrentPage={setCurrentUpcomingPage}
                    totalPages={totalUpcomingPages}
                  />
                </>
              ) : (
                <div className="no-events">
                  <p>{t('cleanAirSite.events.noEvents')}</p>
                </div>
              )}
            </div>

            <hr />

            <div className="events-header">
              <h1 className="events-title">{t('cleanAirSite.events.sectionTitles.past')}</h1>
              <div>
                <button
                  onClick={() => {
                    setHideEvents(!hideEvents);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    outline: 'none'
                  }}>
                  <KeyboardArrowDownIcon />
                </button>
              </div>
            </div>
            {hideEvents && (
              <div className="event-cards">
                {currentPastEvents.length > 0 ? (
                  <>
                    {currentPastEvents.map((event) => (
                      <div className="event-card" key={event.id}>
                        <img
                          src={event.event_image}
                          alt="Event Image"
                          className="event-image"
                          loading="lazy"
                        />
                        <div className="even-card-details" onClick={routeToDetails(event)}>
                          <h2 className="event-title">
                            {event.title.length > 50
                              ? event.title.slice(0, 50) + '...'
                              : event.title}
                          </h2>
                          <p className="event-subtitle">
                            {event.title_subtext.length > 100
                              ? event.title_subtext.slice(0, 100) + '...'
                              : event.title_subtext}
                          </p>
                          <p className="event-date">{event.date}</p>
                          <button className="event-button">
                            {t('cleanAirSite.events.card.btnText')}
                          </button>
                        </div>
                      </div>
                    ))}
                    {/* Pagination */}
                    <Pagination
                      currentPage={currentPastPage}
                      setCurrentPage={setCurrentPastPage}
                      totalPages={totalPastPages}
                    />
                  </>
                ) : (
                  <div className="no-events">
                    <p>{t('cleanAirSite.events.noEvents')}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Register Membership */}
        <RegisterSection link="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform" />
      </div>
    </CleanAirPageContainer>
  );
};

export default CleanAirEvents;
