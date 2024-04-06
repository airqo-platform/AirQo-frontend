import React, { useState, useEffect, useRef, useCallback } from 'react';
import Page from 'src/pages/CleanAir/Page';
import { AccessTimeOutlined, CalendarMonth, PlaceOutlined } from '@mui/icons-material';
import { Pagination, usePagination } from 'components/CleanAir/pagination/Pagination';
import { SplitTextSection } from 'components/CleanAir';
import BackgroundImage from 'assets/img/cleanAir/section2.png';
import Profile from 'components/Profile';
import { getAllCleanAirForumEventsApi } from '../../../apis';
import { format } from 'date-fns';
import SectionLoader from 'components/LoadSpinner/SectionLoader';

const ITEMS_PER_PAGE = 6;

/**
 * upArrow and downArrow components
 * @returns {React.Component}
 * @description SVG components for up and down arrows
 */
const upArrow = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 15L12 9L6 15"
        stroke="#536A87"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
const downArrow = () => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M6 9L12 15L18 9"
        stroke="#536A87"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

/**
 * CleanAirForumEvent component
 * @returns {React.Component}
 *
 */
const CleanAirForumEvent = () => {
  // Refs
  const wrapperRef = useRef(null);

  // State variables for UI elements and data
  const [showAccordion, setShowAccordion] = useState(null);
  const [isSticky, setSticky] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // State variables for different data sections
  const [forumEvents, setForumEvents] = useState([]);
  const [engagements, setEngagements] = useState(null);
  const [committee, setCommittee] = useState(null);
  const [speakers, setSpeakers] = useState(null);
  const [FundingPartners, setFundingPartners] = useState(null);
  const [OtherPartners, setOtherPartners] = useState(null);
  const [travelLogistics, setTravelLogistics] = useState(null);
  const [support, setSupport] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [hasAbout, setHasAbout] = useState(false);
  const [hasSpeakers, setHasSpeakers] = useState(false);
  const [hasSchedule, setHasSchedule] = useState(false);
  const [hasRegistration, setHasRegistration] = useState(false);
  const [hasTravel, setHasTravel] = useState(false);
  const [hasPartners, setHasPartners] = useState(false);

  // Pagination setup for OtherPartners
  const { currentItems, currentPage, setCurrentPage, totalPages } = usePagination(
    OtherPartners || [],
    ITEMS_PER_PAGE
  );

  const refMapping = {
    about: useRef(null),
    partners: useRef(null),
    speakers: useRef(null),
    schedule: useRef(null),
    registration: useRef(null),
    travel: useRef(null)
  };

  // Fetch and process forum events data
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true); // Start loading
      try {
        const response = await getAllCleanAirForumEventsApi();
        if (response && response.length > 0) {
          const event = response[0];
          // Process and set state for each data section
          setForumEvents(response);
          setEngagements(event.engagements);
          setCommittee(filterByCategory(event.persons, 'Committee Member'));
          setSpeakers(filterByCategory(event.persons, 'Speaker'));
          setFundingPartners(filterByCategory(event.partners, 'Funding Partner'));
          setOtherPartners(filterByCategory(event.partners, 'Other Partner'));
          setTravelLogistics(event.travel_logistics_html);
          setRegistration(event.registration_details_html);
          setSupport(event.supports);
          setSchedule(event.programs);
        }
      } catch (error) {
        console.error('Error fetching forum events:', error);
      }
      setIsLoading(false);
    };

    fetchEvents();
  }, []);

  // Set state for each section based on ref
  useEffect(() => {
    setHasAbout(refMapping.about.current !== null);
    setHasSpeakers(refMapping.speakers.current !== null);
    setHasSchedule(refMapping.schedule.current !== null);
    setHasRegistration(refMapping.registration.current !== null);
    setHasTravel(refMapping.travel.current !== null);
    setHasPartners(refMapping.partners.current !== null);
  }, [refMapping]);

  // Helper function to filter by category
  const filterByCategory = (array, category) => array.filter((item) => item.category === category);

  // Display logic for committee and speakers
  const displayedCommittee = isExpanded ? committee : committee?.slice(0, ITEMS_PER_PAGE);
  const displayedSpeakers = isExpanded ? speakers : speakers?.slice(0, ITEMS_PER_PAGE);

  // Use useCallback to prevent unnecessary re-renders
  const handleClickOutside = useCallback((event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setShowAccordion(null);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  // Use useCallback to prevent unnecessary re-renders
  const checkScrollTop = useCallback(() => {
    const navPosition = refMapping['about'].current
      ? refMapping['about'].current.getBoundingClientRect().top + 200
      : 0;

    setSticky(window.pageYOffset >= navPosition);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    return () => {
      window.removeEventListener('scroll', checkScrollTop);
    };
  }, [checkScrollTop]);

  // Use ternary operator for cleaner code
  const convertTime24to12 = (time24) => {
    let [hours, minutes] = time24.split(':');
    const modifier = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${modifier}`;
  };
  const links = [
    hasAbout && { name: 'About', url: 'about' },
    hasSpeakers && { name: 'Speakers', url: 'speakers' },
    hasSchedule && { name: 'Schedule', url: 'schedule' },
    hasRegistration && { name: 'Registration', url: 'registration' },
    hasPartners && { name: 'Partners', url: 'partners' },
    hasTravel && { name: 'Travel Logistics', url: 'travel' }
  ].filter(Boolean);

  return (
    <Page showNewsLetter={true} showBottomCTAS={false} showSubNav={false}>
      {isLoading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh'
          }}>
          <SectionLoader />
        </div>
      ) : forumEvents.length > 0 ? (
        <div className="CleanAirForumEvent">
          {isSticky && (
            <header
              className="headerScroll"
              style={isSticky ? { position: 'fixed', top: 78, zIndex: 1000, width: '100%' } : {}}>
              <nav className="navigation">
                <ul className="container">
                  {links.map((link) => (
                    <li key={link.name}>
                      <span
                        onClick={(e) => {
                          e.preventDefault();
                          refMapping[link.url].current.scrollIntoView({ behavior: 'smooth' });
                        }}>
                        {link.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </nav>
            </header>
          )}

          <header
            className="header"
            style={{
              backgroundImage: `url(${
                forumEvents.length > 0 && forumEvents[0].background_image
                  ? forumEvents[0].background_image
                  : BackgroundImage
              })`,

              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
            }}>
            <div className="header-info-con container">
              <div className="header-info">
                <span>
                  <CalendarMonth className="icon" />
                  {forumEvents.length > 0 && (
                    <>
                      {format(new Date(forumEvents[0].start_date), 'do MMMM, yyyy')} -{' '}
                      {format(new Date(forumEvents[0].end_date), 'do MMMM, yyyy')}
                    </>
                  )}
                </span>
                <span>
                  <span />
                  <AccessTimeOutlined className="icon" />
                  {forumEvents.length > 0 && (
                    <>
                      {forumEvents[0].start_time.slice(0, -3)} -{' '}
                      {forumEvents[0].end_time.slice(0, -3)}
                    </>
                  )}
                </span>
                <span>
                  <span />
                  <PlaceOutlined className="icon" />
                  {forumEvents.length > 0 && forumEvents[0].location_name}
                </span>
              </div>
              <div className="header-main-info">
                <h1>{forumEvents.length > 0 && forumEvents[0].title}</h1>
                <h2>{forumEvents.length > 0 && forumEvents[0].title_subtext}</h2>
              </div>
              <div
                style={{
                  zIndex: 1000
                }}>
                <button
                  className="register-btn"
                  onClick={() => {
                    if (forumEvents.length > 0) {
                      window.open(forumEvents[0].registration_link, '_blank');
                    }
                  }}>
                  Register here.
                </button>
              </div>
            </div>

            <nav className="navigation">
              <ul className="container">
                {links.map(
                  (link) =>
                    refMapping[link.url] &&
                    refMapping[link.url].current && (
                      <li key={link.name}>
                        <span
                          onClick={(e) => {
                            e.preventDefault();
                            try {
                              refMapping[link.url].current.scrollIntoView({ behavior: 'smooth' });
                            } catch (error) {
                              console.error('Error scrolling to section:', error);
                            }
                          }}>
                          {link.name}
                        </span>
                      </li>
                    )
                )}
              </ul>
            </nav>
          </header>

          <div className="body container">
            <section className="about" ref={refMapping.about}>
              <div className="intro">
                <div
                  dangerouslySetInnerHTML={{
                    __html: forumEvents.length > 0 && forumEvents[0].introduction_html
                  }}
                />
              </div>
            </section>

            {engagements && engagements.objectives.length > 0 && (
              <section className="about">
                <SplitTextSection
                  lists={[]}
                  content={
                    <div className="engagements_list">
                      {engagements.objectives.map((objective) => (
                        <div key={objective.id}>
                          <h3>{objective.title}</h3>
                          <p>{objective.details}</p>
                        </div>
                      ))}
                    </div>
                  }
                  title={<h2 className="section_title">{engagements.title}</h2>}
                  bgColor="#FFFFFF"
                />
              </section>
            )}

            {committee && committee.length > 0 && (
              <>
                <div className="separator" />
                <section className="speakers" ref={refMapping.speakers}>
                  <h2 style={{ marginBottom: '20px' }} className="section_title">
                    Programme committee
                  </h2>
                  <div className="AboutUsPage__pictorial">
                    {displayedCommittee.map((profile) => (
                      <div key={profile.id}>
                        <Profile
                          name={profile.name}
                          title={profile.title}
                          about={profile.biography}
                          ImgPath={profile.picture}
                          readBioBtn={true}
                        />
                      </div>
                    ))}
                    {committee.length > ITEMS_PER_PAGE && (
                      <div className="showMoreLessBtn">
                        <button onClick={() => setIsExpanded(!isExpanded)}>
                          {isExpanded ? 'Show Less' : 'Show More'}
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {schedule && schedule.length > 0 && (
              <>
                <div className="separator" />
                <section className="schedule" ref={refMapping.schedule}>
                  <h2 style={{ marginBottom: '20px' }} className="section_title">
                    Schedule
                  </h2>
                  <div className="schedule" ref={wrapperRef}>
                    {schedule.map((schedule) => (
                      <div
                        className="event"
                        key={schedule.id}
                        onClick={() => setShowAccordion(schedule.id)}>
                        <div className="event-head">
                          <div>
                            <p className="date">{schedule.title}</p>
                            <p className="title">{schedule.program_details}</p>
                          </div>
                          <div>
                            {showAccordion === schedule.id ? (
                              <span>{upArrow()}</span>
                            ) : (
                              <span>{downArrow()}</span>
                            )}
                          </div>
                        </div>

                        {showAccordion === schedule.id &&
                          schedule.sessions.map((session, index) => (
                            <div key={session.id}>
                              <div className="event-details">
                                <div className="event-details__time">
                                  <p>{convertTime24to12(session.start_time)}</p>
                                </div>
                                <div className="event-details__content">
                                  <p className="title">{session.session_title}</p>
                                  {session.html !== '<p><br></p>' && (
                                    <p
                                      className="description"
                                      dangerouslySetInnerHTML={{ __html: session.html }}
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {speakers && speakers.length > 0 && (
              <>
                <div className="separator" />
                <section className="speakers" ref={refMapping.speakers}>
                  <h2 style={{ marginBottom: '20px' }} className="section_title">
                    Speakers
                  </h2>
                  <p>
                    Meet the CLEAN-Air Forum speakers!
                    <br /> We're thrilled to host distinguished speakers from across the globe,
                    alongside prominent city leaders and researchers representing various countries,
                    who will serve as key presenters.
                  </p>
                  <div className="AboutUsPage__pictorial">
                    {displayedSpeakers.map((profile) => (
                      <div key={profile.id}>
                        <Profile
                          name={profile.name}
                          title={profile.title}
                          about={profile.biography}
                          ImgPath={profile.picture}
                          readBioBtn={true}
                        />
                      </div>
                    ))}
                    {speakers.length > ITEMS_PER_PAGE && (
                      <div className="showMoreLessBtn">
                        <button onClick={() => setIsExpanded(!isExpanded)}>
                          {isExpanded ? 'Show Less' : 'Show More'}
                        </button>
                      </div>
                    )}
                  </div>
                </section>
              </>
            )}

            {registration && (
              <>
                <div className="separator" />
                <section className="about registration" ref={refMapping.registration}>
                  <SplitTextSection
                    lists={[]}
                    content={
                      <div className="engagements_list">
                        <div>
                          <div dangerouslySetInnerHTML={{ __html: registration }} />
                        </div>
                      </div>
                    }
                    title={<h2 className="section_title">Registration</h2>}
                    bgColor="#FFFFFF"
                  />
                </section>
              </>
            )}

            {FundingPartners && FundingPartners.length > 0 && (
              <>
                <div className="separator" />
                <section className="Funding_partners" ref={refMapping.partners}>
                  <SplitTextSection
                    lists={[]}
                    content={
                      <div className="partners-wrapper">
                        <div className="partner-logos">
                          <div className="grid-container">
                            {FundingPartners.map((item) => (
                              <a
                                className="cell"
                                key={item.id}
                                href={item.website_link}
                                target="_blank">
                                <img
                                  className="logo"
                                  src={item.partner_logo}
                                  alt={item.name}
                                  loading="lazy"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    }
                    title={<h2 className="section_title">Funding Partners</h2>}
                    bgColor="#FFFFFF"
                  />
                </section>
              </>
            )}

            {OtherPartners && OtherPartners.length > 0 && (
              <>
                <div className="separator" />
                <section className="forum_partners">
                  <SplitTextSection
                    lists={[]}
                    content={
                      <div style={{}}>
                        <div className="partners-wrapper">
                          <div className="partner-logos">
                            <div className="grid-container">
                              {currentItems.map((item) => (
                                <a
                                  className="cell"
                                  key={item.id}
                                  href={item.website_link}
                                  target="_blank">
                                  <img
                                    className="logo"
                                    src={item.partner_logo}
                                    alt={item.name}
                                    loading="lazy"
                                  />
                                </a>
                              ))}
                            </div>

                            <Pagination
                              currentPage={currentPage}
                              setCurrentPage={setCurrentPage}
                              totalPages={totalPages}
                            />
                          </div>
                        </div>
                      </div>
                    }
                    title={<h2 className="section_title">Other Partners</h2>}
                    bgColor="#FFFFFF"
                  />
                </section>
              </>
            )}

            {travelLogistics && (
              <>
                <div className="separator" />
                <section className="about travel" ref={refMapping.travel}>
                  <SplitTextSection
                    lists={[]}
                    content={<div dangerouslySetInnerHTML={{ __html: travelLogistics }} />}
                    title={<h2 className="section_title">Travel Logistics</h2>}
                    bgColor="#FFFFFF"
                  />
                </section>
              </>
            )}

            {support && support.length > 0 && (
              <section className="about support">
                <SplitTextSection
                  lists={[]}
                  content={
                    <div className="engagements_list">
                      {support.map((support) => (
                        <div key={support.id}>
                          <h3>{support.query}</h3>
                          <p>{support.name}</p>
                          <p>{support.role}</p>
                          <a href={`mailto:${support.email}`}>{support.email}</a>
                        </div>
                      ))}
                    </div>
                  }
                  title={<h2 className="section_title">Support</h2>}
                  bgColor="#FFFFFF"
                />
              </section>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '50vh'
          }}>
          No data found, please check back later.
        </div>
      )}
    </Page>
  );
};

export default CleanAirForumEvent;
