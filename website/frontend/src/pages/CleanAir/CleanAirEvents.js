import React, { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import SEO from 'utilities/seo';
import { useInitScrollTop } from 'utilities/customHooks';
import { getAllEvents } from '../../../reduxStore/Events/EventSlice';
import { useDispatch, useSelector } from 'react-redux';
import { RegisterSection, IntroSection, RotatingLoopIcon } from 'components/CleanAir';
import eventImage from 'assets/img/cleanAir/events.png';
import { useTranslation, Trans } from 'react-i18next';
import DoneIcon from '@mui/icons-material/Done';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import Slide from '@mui/material/Slide';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import FilterListIcon from '@mui/icons-material/FilterList';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';

const days = (date_1, date_2) => {
  let difference = date_1.getTime() - date_2.getTime();
  let TotalDays = Math.ceil(difference / (1000 * 3600 * 24));
  return TotalDays;
};

const CleanAirEvents = () => {
  useInitScrollTop();

  // Hooks
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const allEventsData = useSelector((state) => state.eventsData.events);
  const language = useSelector((state) => state.eventsNavTab.languageTab);
  const navigate = useNavigate();

  // State
  const [openDate, setOpenDate] = useState(false);
  const [openFilter, setOpenFilter] = useState(false);
  const [selectedDate, setSelectedDate] = useState();
  const [filter, setFilter] = useState();
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [hideEvents, setHideEvents] = useState(true);
  const [loading, setLoading] = useState(false);

  // Refs
  const dateRef = useRef();
  const filterRef = useRef();

  // Derived data
  const eventsApiData = useMemo(() => {
    return allEventsData.filter((event) => {
      if (event.website_category !== 'cleanair') {
        return false;
      }

      if (selectedMonth) {
        const eventDate = new Date(event.start_date);
        if (eventDate.getMonth() !== selectedMonth) {
          return false;
        }
      }

      if (filter && filter !== 'all' && filter !== 'others' && event.event_category !== filter) {
        return false;
      }

      return true;
    });
  }, [allEventsData, selectedMonth, filter]);

  const upcomingEvents = useMemo(() => getUpcomingEvents(eventsApiData), [eventsApiData]);
  const pastEvents = useMemo(() => getPastEvents(eventsApiData), [eventsApiData]);

  // Effects
  useEffect(() => {
    const fetchAllEvents = async () => {
      setLoading(true);
      try {
        await dispatch(getAllEvents());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllEvents();
  }, [language, dispatch]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dateRef.current && !dateRef.current.contains(event.target)) {
        setOpenDate(false);
      }
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setOpenFilter(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper functions
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

  const routeToDetails = useCallback(
    (events) => (event) => {
      event.preventDefault();
      navigate(`/clean-air/event-details/${events.unique_title}/`);
    },
    [navigate]
  );

  const handleDateSelect = (value) => {
    setSelectedDate(value);
    setSelectedMonth(value - 1);
    setOpenDate(false);
  };

  const handleFilterSelect = (value) => {
    setFilter(value);
    setOpenFilter(false);
  };

  // State
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 3;

  // Derived data
  const currentEvents = useMemo(() => getCurrentEvents(pastEvents), [pastEvents, currentPage]);
  const totalPages = Math.ceil(pastEvents.length / eventsPerPage);

  // Helper functions
  function getCurrentEvents(events) {
    const indexOfLastEvent = currentPage * eventsPerPage;
    const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
    return events.slice(indexOfFirstEvent, indexOfLastEvent);
  }

  const dates = [
    { month: t('cleanAirSite.events.dropdowns.date.options.1'), value: 1 },
    { month: t('cleanAirSite.events.dropdowns.date.options.2'), value: 2 },
    { month: t('cleanAirSite.events.dropdowns.date.options.3'), value: 3 },
    { month: t('cleanAirSite.events.dropdowns.date.options.4'), value: 4 },
    { month: t('cleanAirSite.events.dropdowns.date.options.5'), value: 5 },
    { month: t('cleanAirSite.events.dropdowns.date.options.6'), value: 6 },
    { month: t('cleanAirSite.events.dropdowns.date.options.7'), value: 7 },
    { month: t('cleanAirSite.events.dropdowns.date.options.8'), value: 8 },
    { month: t('cleanAirSite.events.dropdowns.date.options.9'), value: 9 },
    { month: t('cleanAirSite.events.dropdowns.date.options.10'), value: 10 },
    { month: t('cleanAirSite.events.dropdowns.date.options.11'), value: 11 },
    { month: t('cleanAirSite.events.dropdowns.date.options.12'), value: 12 }
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
    { label: t('cleanAirSite.events.dropdowns.filter.options2.1'), value: 'online' },
    { label: t('cleanAirSite.events.dropdowns.filter.options2.2'), value: 'in-person' },
    { label: t('cleanAirSite.events.dropdowns.filter.options2.3'), value: 'hybrid' },
    { label: t('cleanAirSite.events.dropdowns.filter.options2.4'), value: 'others' }
  ];

  return (
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
        imagePosition={'90%'}
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
                    <div className="label">{t('cleanAirSite.events.dropdowns.filter.label1')}</div>
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
                    <div className="label">{t('cleanAirSite.events.dropdowns.filter.label2')}</div>
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
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) => (
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
              ))
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
              {currentEvents.length > 0 ? (
                <>
                  {currentEvents.map((event) => (
                    <div className="event-card" key={event.id}>
                      <img
                        src={event.event_image}
                        alt="Event Image"
                        className="event-image"
                        loading="lazy"
                      />
                      <div className="even-card-details" onClick={routeToDetails(event)}>
                        <h2 className="event-title">
                          {event.title.length > 50 ? event.title.slice(0, 50) + '...' : event.title}
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
                  <div className="pagination">
                    <button
                      onClick={() => {
                        setCurrentPage(currentPage - 1);
                      }}
                      disabled={currentPage === 1}>
                      <KeyboardDoubleArrowLeftIcon
                        sx={{ fill: currentPage === 1 ? '#D1D1D1' : '#000' }}
                      />
                    </button>
                    <p>
                      {currentPage} of {totalPages}
                    </p>
                    <button
                      onClick={() => {
                        setCurrentPage(currentPage + 1);
                      }}
                      disabled={currentPage === totalPages}>
                      <KeyboardDoubleArrowRightIcon
                        sx={{ fill: currentPage === totalPages ? '#D1D1D1' : '#000' }}
                      />
                    </button>
                  </div>
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
  );
};

export default CleanAirEvents;
