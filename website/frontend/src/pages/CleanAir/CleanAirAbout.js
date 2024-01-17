import React, { useState, useEffect } from 'react';
import { useInitScrollTop } from 'utilities/customHooks';
import { SplitSection, SingleSection, MainHighlight, ButtonCTA } from 'components/CleanAir';
import Section11 from 'assets/img/cleanAir/clean1.jpg';
import Section2 from 'assets/img/cleanAir/mission.jpeg';
import Section4 from 'assets/img/cleanAir/synergy.jpg';
import Section5 from 'assets/img/cleanAir/goals.JPG';
import Placeholder from 'assets/img/cleanAir/placeholder.png';
import Placeholder2 from 'assets/img/cleanAir/placeholder2.png';
import Placeholder3 from 'assets/img/cleanAir/placeholder3.png';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SEO from 'utilities/seo';

const CleanAirAbout = () => {
  useInitScrollTop();

  const [showScroll, setShowScroll] = useState(false);

  const goals = [
    {
      title: 'Enhancing Regional Capacity',
      content:
        'Committed to fostering a deeper understanding, awareness and appreciation of air quality issues through evidence-informed and participatory advocacy, and knowledge sharing.',
      imgURL: Section5
    },
    {
      title: 'Collaboration and awareness',
      content:
        'Committed to fostering a deeper understanding, awareness and appreciation of air quality issues through evidence-informed and participatory advocacy, and knowledge sharing.',
      imgURL: Placeholder3
    },
    {
      title: 'Clean air solutions for cities',
      content:
        'CLEAN-Air network is a nexus for developing tangible and contextual clean air solutions and frameworks for African cities.',
      imgURL: Placeholder2
    }
  ];

  const checkScrollTop = () => {
    const shouldShowScroll = window.scrollY >= 400;
    if (showScroll !== shouldShowScroll) {
      setShowScroll(shouldShowScroll);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScroll]);

  const ScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="page-wrapper about-page">
      <SEO
        title="About"
        siteTitle="CLEAN-Air Network"
        description="An African led, multi-region network bringing together a community of practice for air quality solutions and air quality management across Africa."
      />
      {/* section 1 */}
      <div className="Hero">
        <span className="image-container">
          <img src={Section11} />
        </span>
        <div className="hero-content">
          <div>
            <p className="hero-title">
              The CLEAN-Air <br className="breaker" /> Network
            </p>
            <p className="hero-sub">
              <span className="fact">An African-led, multi-regional network</span> <br />
              bringing together a community of practice for air quality solutions and air quality
              management across Africa.
            </p>
            <ButtonCTA
              label="Join the Network"
              link="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform"
              style={{
                width: '200px'
              }}
            />
          </div>
        </div>
      </div>

      {/* section 2 */}
      <div className="page-section">
        <SingleSection
          content={
            <>
              <div className="acronym-content-container">
                <p>
                  <b
                    style={{
                      color: '#135DFF'
                    }}>
                    CLEAN-Air
                  </b>
                  , is an acronym coined from
                </p>
                <h2 className="content-h">
                  “Championing Liveable urban Environments through African Networks for Air”
                </h2>
                <p>
                  The network brings together stakeholders and researchers in air quality management
                  to share best practices and knowledge on developing and implementing air quality
                  management solutions in African cities.
                </p>
                <p className="join-now">
                  Are you an organization or individual interested in air quality in Africa?
                  <a
                    href="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform"
                    target="_blank"
                    rel="noopener noreferrer">
                    <b
                      style={{
                        color: '#135DFF'
                      }}>
                      {' '}
                      Join the network
                    </b>
                  </a>
                </p>
              </div>
              <img srcSet={Placeholder} className="acronym-image" />
            </>
          }
          bgColor="#EDF3FF"
        />
      </div>

      {/* section 3 */}
      <div className="page-section">
        <SplitSection
          pillTitle="Mission"
          title="CLEAN-Air Mission"
          content="To strengthen regional networks for sustained partnerships and enable partners to co-develop solutions that enhance the capacity for air quality monitoring, modelling and management across cities in Africa."
          btnText={'Learn how -->'}
          showButton={false}
          link="#"
          imageStyle={{
            objectFit: 'cover',
            maxHeight: '400px'
          }}
          imgURL={Section2}
          pillBgColor="#ECF2FF"
          pillTextColor="#135DFF"
          reverse={false}
        />
      </div>

      {/* section 4 */}
      <div className="page-section">
        <SplitSection
          pillTitle="Membership"
          title="A Synergy for air quality in Africa"
          content="The network comprises a diverse stakeholder landscape including research organisations, city and national governments, the private sector, development partners, and individuals who are championing the air quality agenda in African cities.<br/> <br/> 
          Are you an organization or individual interested in air quality in Africa? We welcome you to join the CLEAN-Air Network. 
        "
          imgURL={Section4}
          imageStyle={{
            height: '420px',
            objectFit: 'cover'
          }}
          pillBgColor="#ECF2FF"
          pillTextColor="#135DFF"
          showButton={false}
          reverse={true}
        />
      </div>

      {/* section 5 */}
      <div className="page-section">
        <SingleSection
          content={
            <div className="goals-container">
              <div
                style={{
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start'
                }}>
                <span id="first-pill" style={{ backgroundColor: '#FFF' }}>
                  <p style={{ color: '#135DFF' }}>Goals</p>
                </span>
                <h2 className="content-h">CLEAN Air Goals</h2>
              </div>

              <div className="goals">
                {goals.map((goal, index) => (
                  <div className={`goal ${index === 0 ? 'first' : ''}`} key={index}>
                    <div className="goal-image-container">
                      <img src={goal.imgURL} className="goal-image" />
                    </div>
                    <div className="goal-content">
                      <h3 className="goal-title">{goal.title}</h3>
                      <p className="goal-p">{goal.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          }
          padding="5rem 0"
          bgColor="#EDF3FF"
        />
      </div>

      {/* scroll top button */}
      {showScroll && (
        <div className="scroll-top" onClick={ScrollTop}>
          <ArrowUpwardIcon
            className="scroll-top-icon"
            sx={{
              width: '40px',
              height: '40px',
              color: '#FFF'
            }}
          />
        </div>
      )}

      {/* section 6 */}
      <div className="page-section">
        <MainHighlight />
      </div>
    </div>
  );
};

export default CleanAirAbout;
