import React, { useState, useEffect, useRef } from 'react';
import Page from 'src/pages/CleanAir/Page';
import { AccessTimeOutlined, CalendarMonth, PlaceOutlined } from '@mui/icons-material';
import { Pagination, usePagination } from 'components/CleanAir/pagination/Pagination';
import { SplitTextSection } from 'components/CleanAir';
import ProfileImage from 'src/assets/img/cleanAir/prof.jpg';
import Profile from 'components/Profile';

const ITEMS_PER_PAGE = 6;

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

const CleanAirForumEvent = () => {
  const wrapperRef = useRef(null);
  const [showAccordion, setShowAccordion] = useState(null);
  const refMapping = {
    about: useRef(null),
    partners: useRef(null),
    speakers: useRef(null),
    schedule: useRef(null),
    registration: useRef(null),
    travel: useRef(null),
    support: useRef(null)
  };

  const links = [
    { name: 'About', url: 'about' },
    { name: 'Schedule', url: 'schedule' },
    { name: 'Speakers', url: 'speakers' },
    { name: 'Registration', url: 'registration' },
    { name: 'Partners', url: 'partners' },
    { name: 'Travel logistics', url: 'travel' },
    { name: 'Support', url: 'support' }
  ];

  const lists = [
    {
      id: 1,
      partner_logo: 'https://via.placeholder.com/150',
      partner_name: 'Partner 1'
    },
    {
      id: 2,
      partner_logo: 'https://via.placeholder.com/150',
      partner_name: 'Partner 2'
    },
    {
      id: 3,
      partner_logo: 'https://via.placeholder.com/150',
      partner_name: 'Partner 3'
    },
    {
      id: 4,
      partner_logo: 'https://via.placeholder.com/150',
      partner_name: 'Partner 4'
    },
    {
      id: 5,
      partner_logo: 'https://via.placeholder.com/150',
      partner_name: 'Partner 5'
    },
    {
      id: 6,
      partner_logo: 'https://via.placeholder.com/150',
      partner_name: 'Partner 6'
    }
  ];

  const profiles = [
    {
      id: 1,
      name: 'John Doe',
      title: 'CEO, Company 1',
      biography: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      profile_image: ProfileImage
    },
    {
      id: 2,
      name: 'Jane Doe',
      title: 'CEO, Company 2',
      biography: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      profile_image: ProfileImage
    },
    {
      id: 3,
      name: 'John Doe',
      title: 'CEO, Company 3',
      biography: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      profile_image: ProfileImage
    },
    {
      id: 4,
      name: 'Jane Doe',
      title: 'CEO, Company 4',
      biography: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      profile_image: ProfileImage
    },
    {
      id: 5,
      name: 'John Doe',
      title: 'CEO, Company 5',
      biography: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      profile_image: ProfileImage
    },
    {
      id: 6,
      name: 'Jane Doe',
      title: 'CEO, Company 6',
      biography: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      profile_image: ProfileImage
    },
    {
      id: 7,
      name: 'John Doe',
      title: 'CEO, Company 7',
      biography: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      profile_image: ProfileImage
    },
    {
      id: 8,
      name: 'Jane Doe',
      title: 'CEO, Company 8',
      biography: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      profile_image: ProfileImage
    }
  ];

  const schedules = [
    {
      id: 1,
      date: '3rd April 2023',
      title: 'Scaling-up Participatory Air Quality Management for African Cities'
    },
    {
      id: 2,
      date: '4th April 2023',
      title: 'Scaling-up Participatory Air Quality Management for African Cities'
    },
    {
      id: 3,
      date: '5th April 2023',
      title: 'Scaling-up Participatory Air Quality Management for African Cities'
    },
    {
      id: 4,
      date: '6th April 2023',
      title: 'Scaling-up Participatory Air Quality Management for African Cities'
    },
    {
      id: 5,
      date: '7th April 2023',
      title: 'Scaling-up Participatory Air Quality Management for African Cities'
    }
  ];

  const support = [
    {
      id: 1,
      supportType: 'Communications and Visibility',
      name: 'John Doe',
      position: 'CEO, Company 1',
      email: 'Johe@gmail.com'
    },
    {
      id: 2,
      supportType: 'Logistics and Operations',
      name: 'Jane Doe',
      position: 'CEO, Company 2',
      email: 'Makr@gmail.com'
    },
    {
      id: 3,
      supportType: 'Programme and Content',
      name: 'John Doe',
      position: 'CEO, Company 3',
      email: 'sam@gmail.com'
    }
  ];

  const { currentItems, currentPage, setCurrentPage, totalPages } = usePagination(
    lists,
    ITEMS_PER_PAGE
  );

  const [isExpanded, setIsExpanded] = useState(false);

  const displayedProfiles = isExpanded ? profiles : profiles.slice(0, ITEMS_PER_PAGE);

  const handleClickOutside = (event) => {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      setShowAccordion(null);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const [isSticky, setSticky] = useState(false);

  const checkScrollTop = () => {
    // Get the position of the body element
    const navPosition = refMapping['about'].current
      ? refMapping['about'].current.getBoundingClientRect().top + 200
      : 0;

    if (!isSticky && window.pageYOffset >= navPosition) {
      setSticky(true);
    } else if (isSticky && window.pageYOffset < navPosition) {
      setSticky(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    return () => {
      window.removeEventListener('scroll', checkScrollTop);
    };
  }, [isSticky]);

  return (
    <Page showNewsLetter={true} showBottomCTAS={false} showSubNav={false}>
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

        <header className="header">
          <div className="header-info-con container">
            <div className="header-info">
              <span>
                <CalendarMonth className="icon" />
                1st July, 2024 - 5th July, 2024
              </span>
              <span>
                <span />
                <AccessTimeOutlined className="icon" />
                08:00 - 17:00
              </span>
              <span>
                <span />
                <PlaceOutlined className="icon" />
                Lagos, Nigeria
              </span>
            </div>
            <div className="header-main-info">
              <h1>CLEAN-Air Forum</h1>
              <h2>
                Advancing collaborations and multi-regional partnerships for clean air actions in
                African cities
              </h2>
            </div>
            <div>
              <button className="register-btn">Register here.</button>
            </div>
          </div>

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

        <div className="body container">
          <section className="about" ref={refMapping.about}>
            <div className="intro">
              <p>
                The 2024 edition of the <a>CLEAN-Air</a> engagement brings together communities of
                practice in Africa to promote knowledge sharing, collaborations and multi-regional
                partnerships that particularly emphasizes the need to strengthen regional networks
                for sustained interventions.
              </p>
              <p>
                The forum follows the success of the inaugural CLEAN-Air workshop held in Kampala in
                2023. You can <a>access the full Kampala Forum report here</a>. This y ear's forum
                aims to further our collective efforts in advancing air quality initiatives across
                the continent.
              </p>
            </div>
          </section>

          <section>
            <div className="header-info-con">
              <div className="header-info">
                <span>
                  <CalendarMonth className="icon" />
                  1st July, 2024 - 5th July, 2024
                </span>
                <span>
                  <span />
                  <AccessTimeOutlined className="icon" />
                  08:00 - 17:00
                </span>
                <span>
                  <span />
                  <PlaceOutlined className="icon" />
                  Lagos, Nigeria
                </span>
              </div>
            </div>
          </section>

          <section className="speakers" ref={refMapping.speakers}>
            <h2 style={{ marginBottom: '20px' }} className="section_title">
              Programme committee
            </h2>
            <div className="AboutUsPage__pictorial">
              {displayedProfiles.map((profile) => (
                <div key={profile.id}>
                  <Profile
                    name={profile.name}
                    title={profile.title}
                    about={profile.biography}
                    ImgPath={profile.profile_image}
                    readBioBtn={true}
                  />
                </div>
              ))}
              {profiles.length > ITEMS_PER_PAGE && (
                <div className="showMoreLessBtn">
                  <button onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? 'Show Less' : 'Show More'}
                  </button>
                </div>
              )}
            </div>
          </section>

          <div className="separator" />

          <section className="forum_partners" ref={refMapping.partners}>
            <SplitTextSection
              lists={[]}
              content={
                <div style={{}}>
                  <div className="partners-wrapper">
                    <div className="partner-logos">
                      <div className="grid-container">
                        {currentItems.map((item) => (
                          <div className="cell" key={item.id}>
                            <img
                              className="logo"
                              src={item.partner_logo}
                              alt={item.partner_name}
                              loading="lazy"
                            />
                          </div>
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
              title={<h2 className="section_title">Partners</h2>}
              bgColor="#FFFFFF"
            />
          </section>

          <div className="separator" />

          <section className="about registration" ref={refMapping.registration}>
            <SplitTextSection
              lists={[]}
              content={
                <div className="engagements_list">
                  <div>
                    <div>
                      <p>
                        We look forward to welcoming you to Lagos, Nigeria! Register your interest.
                        <span onClick={null}>Register here</span>
                      </p>
                    </div>
                  </div>
                </div>
              }
              title={<h2 className="section_title">Registration</h2>}
              bgColor="#FFFFFF"
            />
          </section>

          <section className="Funding_partners">
            <SplitTextSection
              lists={[]}
              content={
                <div>
                  <div className="image-con">
                    <img src="https://via.placeholder.com/150" alt="Funding Partner" />
                    <img src="https://via.placeholder.com/150" alt="Funding Partner" />
                  </div>
                </div>
              }
              title={<h2 className="section_title">Funding Partners</h2>}
              bgColor="#FFFFFF"
            />
          </section>

          <div className="separator" />

          <section className="speakers" ref={refMapping.speakers}>
            <h2 style={{ marginBottom: '20px' }} className="section_title">
              Speakers
            </h2>
            <p>
              Meet the CLEAN-Air Forum speakers!
              <br />
              <br />
              We're thrilled to host distinguished speakers from across the globe, alongside
              prominent city leaders and researchers representing various countries, who will serve
              as key presenters.
            </p>
            <div className="AboutUsPage__pictorial">
              {displayedProfiles.map((profile) => (
                <div key={profile.id}>
                  <Profile
                    name={profile.name}
                    title={profile.title}
                    about={profile.biography}
                    ImgPath={profile.profile_image}
                    readBioBtn={true}
                  />
                </div>
              ))}
              {profiles.length > ITEMS_PER_PAGE && (
                <div className="showMoreLessBtn">
                  <button onClick={() => setIsExpanded(!isExpanded)}>
                    {isExpanded ? 'Show Less' : 'Show More'}
                  </button>
                </div>
              )}
            </div>
          </section>

          <div className="separator" />

          <section className="about">
            <SplitTextSection
              lists={[]}
              content={
                <div className="engagements_list">
                  <div>
                    <h3>DAY 01</h3>
                    <p>
                      Map the policy landscape across Africa and data needs to advance
                      evidence-informed policy development for air quality management.
                    </p>
                  </div>
                  <div>
                    <h3>DAY 02</h3>
                    <p>
                      Take stock of participatory air quality initiatives across African cities
                      against the Kampala meeting commitments.
                    </p>
                  </div>
                  <div>
                    <h3>DAY 03</h3>
                    <p>
                      Define the data ecosystem and best practices for utilising low-cost air
                      quality sensor networks and digital solutions in the African context.
                    </p>
                  </div>
                  <div>
                    <h3>DAY 04</h3>
                    <p>
                      Foster knowledge-sharing and collaborations between cities to advance
                      science-policy interface on air quality.
                    </p>
                  </div>
                </div>
              }
              title={
                <h2 className="section_title">
                  The 4-day engagement aims to achieve the following objectives:
                </h2>
              }
              bgColor="#FFFFFF"
            />
          </section>

          <div className="separator" />

          <section className="schedule" ref={refMapping.schedule}>
            <h2 style={{ marginBottom: '20px' }} className="section_title">
              Schedule
            </h2>
            <div className="schedule" ref={wrapperRef}>
              {schedules.map((schedule) => (
                <div
                  className="event"
                  key={schedule.id}
                  onClick={() => setShowAccordion(schedule.id)}>
                  <div className="event-head">
                    <div>
                      <p className="date">{schedule.date}</p>
                      <p className="title">{schedule.title}</p>
                    </div>
                    <div>
                      {showAccordion === schedule.id ? (
                        <span>{upArrow()}</span>
                      ) : (
                        <span>{downArrow()}</span>
                      )}
                    </div>
                  </div>

                  {showAccordion === schedule.id && (
                    <>
                      <div className="line" />
                      <div className="event-details">
                        <p>
                          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed nonne
                          merninisti licere mihi ista probare, quae sunt a te dicta? Duo Reges:
                          constructio interrete. Quae cum dixisset paulumque institisset, Quid est?{' '}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>

          <div className="separator" />

          <section className="about travel" ref={refMapping.travel}>
            <SplitTextSection
              lists={[]}
              content={
                <div>
                  An international certificate of vaccination or prophylaxis (ICVP) (yellow fever
                  certificate) is required if coming from yellow fever endemic countries. Please
                  make sure to check all vaccination requirements before traveling.
                </div>
              }
              title={<h2 className="section_title">Travel Logistics</h2>}
              bgColor="#FFFFFF"
            />
          </section>

          <section className="about support" ref={refMapping.support}>
            <SplitTextSection
              lists={[]}
              content={
                <div className="engagements_list">
                  {support.map((support) => (
                    <div key={support.id}>
                      <h3>{support.supportType}</h3>
                      <p>{support.name}</p>
                      <p>{support.position}</p>
                      <a href={`mailto:${support.email}`}>{support.email}</a>
                    </div>
                  ))}
                </div>
              }
              title={<h2 className="section_title">Support</h2>}
              bgColor="#FFFFFF"
            />
          </section>
        </div>
      </div>
    </Page>
  );
};

export default CleanAirForumEvent;
