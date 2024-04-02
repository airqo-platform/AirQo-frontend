import React, { useState, useRef } from 'react';
import Page from 'src/pages/CleanAir/Page';
import { AccessTimeOutlined, CalendarMonth, PlaceOutlined } from '@mui/icons-material';
import { Pagination, usePagination } from 'components/CleanAir/pagination/Pagination';
import { SplitTextSection } from 'components/CleanAir';
import ProfileImage from 'src/assets/img/cleanAir/prof.jpg';
import Profile from 'components/Profile';

const ITEMS_PER_PAGE = 6;

const CleanAirForumEvent = () => {
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
    { name: 'Partners', url: 'partners' },
    { name: 'Speakers', url: 'speakers' },
    { name: 'Schedule', url: 'schedule' },
    { name: 'Registration', url: 'registration' },
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
    }
  ];

  const { currentItems, currentPage, setCurrentPage, totalPages } = usePagination(
    lists,
    ITEMS_PER_PAGE
  );

  const [isExpanded, setIsExpanded] = useState(false);

  const displayedProfiles = isExpanded ? profiles : profiles.slice(0, ITEMS_PER_PAGE);

  return (
    <Page showNewsLetter={true} showBottomCTAS={false} showSubNav={false}>
      <div className="CleanAirForumEvent">
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
              <h1>CLEAN Air Forum</h1>
              <h2>Participatory air quality management</h2>
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
          <div className="about" ref={refMapping.about}>
            <section className="intro">
              <p>
                The 2024 edition of the <a>CLEAN AIR</a> engagement brings together communities of
                practice in Africa to promote Africa-led collaborations and multi-regional
                partnerships that particularly emphasizes the need to strengthen regional networks
                for sustained interventions.
              </p>
              <p>
                The forum is a build-up from the success of the inaugural CLEAN-Air workshop held in
                Kampala in 2023. You can <a>access the full Kampala Forum report here</a>. This
                year's forum aims to further our collective efforts in advancing air quality
                initiatives across the continent. 
              </p>
            </section>

            <div className="separator" />

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
          </div>

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
                          <div
                            className="cell"
                            key={item.id}
                            style={{
                              flex: '0 0 calc(50% - 20px)',
                              '@media (min-width: 768px)': {
                                flex: '0 0 calc(33.333% - 20px)'
                              },
                              '@media (max-width: 768px)': {
                                flex: '0 0 100%'
                              }
                            }}>
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

          <section className="speakers" ref={refMapping.speakers}>
            <h2 style={{ marginBottom: '20px' }} className="section_title">
              Speakers
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

          <section className="schedule" ref={refMapping.schedule}>
            <h2 style={{ marginBottom: '20px' }} className="section_title">
              Schedule
            </h2>

            <div class="schedule">
              {schedules.map((schedule) => (
                <div class="event" key={schedule.id}>
                  <p class="date">{schedule.date}</p>
                  <p class="title">{schedule.title}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="separator" />

          <section className="about registration" ref={refMapping.registration}>
            <SplitTextSection
              lists={[]}
              content={
                <div className="engagements_list">
                  <div>
                    <div>
                      <h3>Visa to Nigeria</h3>
                      <p>Download the Visa invitation letter</p>
                      <span onClick={null}>Download here</span>
                    </div>
                  </div>
                  <div>
                    <div>
                      <p>We look forward to welcoming you to Lagos, Nigeria!</p>
                      <span onClick={null}>Register here</span>
                    </div>
                  </div>
                </div>
              }
              title={<h2 className="section_title">Registration</h2>}
              bgColor="#FFFFFF"
            />
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
              title={<h2 className="section_title">Vaccination</h2>}
              bgColor="#FFFFFF"
            />
          </section>

          <div className="separator" />

          <section className="about support" ref={refMapping.support}>
            <SplitTextSection
              lists={[]}
              content={
                <div className="engagements_list">
                  <div>
                    <h3>Programme and General Inquiries</h3>
                    <p>Deo Okure</p>
                    <p>Air Quality Scientist and Programmmes Manager </p>
                    <p>dokure@airqo.net</p>
                  </div>
                  <div>
                    <h3>Logistics and Travel arrangements</h3>
                    <p>Dora Bampangana</p>
                    <p>Project Administrator</p>
                    <p>dora@airqo.net</p>
                  </div>
                  <div>
                    <h3>Communications and Visibility</h3>
                    <p>Maclina Birungi</p>
                    <p>Marketing and Communications Lead</p>
                    <p>maclina@airqo.net</p>
                  </div>
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
