import React, { useState, useEffect, useRef, useCallback } from 'react';
import Page from 'src/pages/CleanAir/Page';
import { AccessTimeOutlined, CalendarMonth, PlaceOutlined } from '@mui/icons-material';
import BackgroundImage from 'assets/img/cleanAir/section2.png';
import { getAllCleanAirForumEventsApi } from '../../../apis';
import { format } from 'date-fns';
import SectionLoader from 'components/LoadSpinner/SectionLoader';
import { useTranslation } from 'react-i18next';
import About from './ForumEventsPages/About';
import Schedule from './ForumEventsPages/Schedule';
import Speakers from './ForumEventsPages/Speakers';
import Partners from './ForumEventsPages/Partners';
import Travel from './ForumEventsPages/Travel';
import CommitteePage from './ForumEventsPages/CommitteePage';
import { ButtonCTA } from 'components/CleanAir';

/**
 * CleanAirForumEvent component
 * @returns {React.Component}
 *
 */
const CleanAirForumEvent = () => {
  const { t } = useTranslation();
  const [isSticky, setSticky] = useState(false);

  // State variables for different data sections
  const [forumEvents, setForumEvents] = useState([]);
  const [engagements, setEngagements] = useState(null);
  const [committee, setCommittee] = useState(null);
  const [speakers, setSpeakers] = useState(null);
  const [FundingPartners, setFundingPartners] = useState(null);
  const [HostPartner, setHostPartners] = useState(null);
  const [CoConveningPartner, setCoConveningPartner] = useState(null);
  const [travelLogistics, setTravelLogistics] = useState(null);
  const [support, setSupport] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [committeeText, setCommitteeText] = useState('');
  const [speakersText, setSpeakersText] = useState('');

  const links = [
    { name: t('cleanAirSite.Forum.subNav.about'), url: 'about' },
    { name: t('cleanAirSite.Forum.subNav.committee'), url: 'committee' },
    { name: t('cleanAirSite.Forum.subNav.schedule'), url: 'schedule' },
    { name: t('cleanAirSite.Forum.subNav.speakers'), url: 'speakers' },
    { name: t('cleanAirSite.Forum.subNav.partners'), url: 'partners' },
    { name: t('cleanAirSite.Forum.subNav.Travel'), url: 'travel' }
  ];

  const refMapping = {
    about: useRef(null),
    partners: useRef(null),
    speakers: useRef(null),
    schedule: useRef(null),
    travel: useRef(null),
    navigation: useRef(null),
    body: useRef(null)
  };

  const [activeSection, setActiveSection] = useState(
    window.location.hash.replace('#', '') || 'about'
  );

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash) {
        setActiveSection(hash);
        // i want to scroll to the navigation ref
        refMapping['body'].current.scrollIntoView({ behavior: 'smooth' });
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Cleanup function to remove the event listener when the component unmounts
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

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
          setCommitteeText(event.Committee_text_section_html);
          setSpeakersText(event.Speakers_text_section_html);
          setCommittee(filterByCategory(event.persons, 'Committee Member'));
          setSpeakers(filterByCategory(event.persons, 'Speaker'));
          setFundingPartners(filterByCategory(event.partners, 'Funding Partner'));
          setHostPartners(filterByCategory(event.partners, 'Host Partner'));
          setCoConveningPartner(filterByCategory(event.partners, 'Co-Convening Partner'));
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

  // Helper function to filter by category
  const filterByCategory = (array, category) => array.filter((item) => item.category === category);

  // Use useCallback to prevent unnecessary re-renders
  const checkScrollTop = useCallback(() => {
    const navPosition = refMapping['navigation'].current
      ? refMapping['navigation'].current.getBoundingClientRect().top + 600
      : 0;

    setSticky(window.pageYOffset >= navPosition);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    return () => {
      window.removeEventListener('scroll', checkScrollTop);
    };
  }, [checkScrollTop]);

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
                          window.location.hash = link.url;
                        }}>
                        {link.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </nav>
            </header>
          )}

          {/* Main header section */}
          <header className="header">
            <div className="Hero">
              <span className="image-container">
                <img src={forumEvents[0].background_image || BackgroundImage} />
              </span>
              <div className="hero-content">
                <div>
                  <p className="hero-title">{forumEvents.length > 0 && forumEvents[0].title}</p>
                  <p className="hero-sub">
                    {forumEvents.length > 0 && forumEvents[0].title_subtext}
                  </p>
                  <ButtonCTA
                    label={t('cleanAirSite.Forum.header.register')}
                    link={forumEvents[0].registration_link}
                    style={{
                      width: '200px'
                    }}
                  />
                </div>
              </div>
            </div>

            <nav className="navigation" ref={refMapping['navigation']}>
              <ul className="container">
                {links.map((link) => (
                  <li
                    key={link.name}
                    className={
                      (window.location.hash ? window.location.hash.replace('#', '') : 'about') ===
                      link.url
                        ? 'activeClass'
                        : ''
                    }>
                    <span
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.hash = link.url;
                      }}>
                      {link.name}
                    </span>
                  </li>
                ))}
              </ul>
            </nav>
          </header>

          {/* Section content */}
          <div className="body container" ref={refMapping['body']}>
            <div className="time-data-info">
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
            </div>

            {activeSection === 'about' && (
              <About forumEvents={forumEvents} engagements={engagements} committee={committee} />
            )}
            {activeSection === 'committee' && (
              <CommitteePage committee={committee} sectionText={committeeText} />
            )}
            {activeSection === 'schedule' && (
              <Schedule schedule={schedule} registration={registration} />
            )}
            {activeSection === 'speakers' && (
              <Speakers speakers={speakers} sectionText={speakersText} />
            )}
            {activeSection === 'partners' && (
              <Partners
                FundingPartners={FundingPartners}
                HostPartner={HostPartner}
                CoConveningPartner={CoConveningPartner}
              />
            )}
            {activeSection === 'travel' && (
              <Travel travelLogistics={travelLogistics} support={support} />
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
