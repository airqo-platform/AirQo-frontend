import React from 'react';
import { useInitScrollTop } from 'utilities/customHooks';
import { SplitSection, MainHighlight, ButtonCTA } from 'components/CleanAir';
import Section1 from 'assets/img/cleanAir/clean.jpeg';
import Section2 from 'assets/img/cleanAir/mission.jpeg';
import Section3 from 'assets/img/cleanAir/acronym.jpg';
import Section4 from 'assets/img/cleanAir/synergy.jpg';
import Section5 from 'assets/img/cleanAir/goals.JPG';
import SEO from 'utilities/seo';

const CleanAirAbout = () => {
  useInitScrollTop();
  return (
    <div className="page-wrapper">
      <SEO
        title="CLEAN-Air Africa Network"
        siteTitle="AirQo"
        description="An African led, multi-region network bringing together a community of practice for air quality solutions and air quality management across Africa."
      />
      {/* section 1 */}
      <div className="Hero">
        <span className="image-container">
          <img src={Section1} />
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
      <div style={{paddingTop:'80px'}}>
        <SplitSection
          pillTitle="CLEAN-Air"
          content="CLEAN-Air, an acronym coined from ‘Championing Liveable urban Environments through African Networks for Air’, brings together stakeholders and researchers in air quality management to share best practices and knowledge on developing and implementing air quality management solutions in African cities."
          imgURL={Section3}
          imageStyle={{
            objectFit: 'cover',
            maxHeight: '400px'
          }}
          // bgColor="#FFFFFF"
          // pillBgColor="#ECF2FF"
          // pillTextColor="#135DFF"
          bgColor="#EDF3FF"
          pillBgColor="#FFFFFF"
          pillTextColor="#000000"
          showButton={false}
        />
      </div>
      {/* section 3 */}
      <div>
        <SplitSection
          pillTitle="CLEAN-Air Mission"
          title="CLEAN-Air Mission"
          content="To strengthen regional networks for sustained partnerships and enable partners to co-develop solutions that enhance the capacity for air quality monitoring, modelling and management across cities in Africa."
          btnText={'Learn how -->'}
          showButton={false}
          link="#"
          imageStyle={{
            objectFit: 'cover',
            maxHeight:'400px'
          }}
          imgURL={Section2}
          // bgColor="#EDF3FF"
          // pillBgColor="#FFFFFF"
          // pillTextColor="#000000"
          bgColor="#FFFFFF"
          pillBgColor="#ECF2FF"
          pillTextColor="#135DFF"
          reverse
        />
      </div>

      {/* section 4 */}
      <div>
        <SplitSection
          pillTitle="CLEAN-Air Membership"
          title="A Synergy for air quality in Africa"
          content="The network comprises a diverse stakeholder landscape including research organisations, city and national governments, the private sector, development partners, and individuals who are championing the air quality agenda in African cities.<br/> <br/>
          Are you an organization or individual interested in air quality in Africa? We welcome you to join the CLEAN-Air Network. 
        "
          link="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform"
          btnText={'Join the Network -->'}
          imgURL={Section4}
          imageStyle={{
            objectFit: 'cover',
          }}
          bgColor="#EDF3FF"
          pillBgColor="#FFFFFF"
          pillTextColor="#000000"
          showButton={true}
        />
      </div>
      {/* section 5 */}
      <div>
        <SplitSection
          pillTitle="CLEAN-Air Goals"
          imgURL={Section5}
          bgColor="#FFFFFF"
          pillBgColor="#ECF2FF"
          pillTextColor="#135DFF"
          reverse
          imageStyle={{
            objectFit: 'cover'
          }}
          showButton={false}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1rem'
            }}>
            <div>
              <span
                style={{
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  color: '#135DFF'
                }}>
                Enhancing Regional Capacity
              </span>
              :  Dedicated to improving capacity in air quality monitoring, modeling, data
              management and access through scaling up of ongoing localized initiatives in African
              Cities.
            </div>
            <div>
              <span
                style={{
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  color: '#135DFF'
                }}>
                Collaboration and awareness
              </span>
              :  Committed to fostering a deeper understanding, awareness and appreciation of air
              quality issues through evidence-informed and participatory advocacy, and knowledge
              sharing.
            </div>
            <div>
              <span
                style={{
                  fontWeight: 'bold',
                  fontSize: '1.5rem',
                  color: '#135DFF'
                }}>
                Clean air solutions for cities
              </span>
              :  CLEAN-Air network is a nexus for developing tangible and contextual clean air
              solutions and frameworks for African cities.
            </div>
          </div>
        </SplitSection>
      </div>
      {/* section 6 */}
      <div>
        <MainHighlight />
      </div>
    </div>
  );
};

export default CleanAirAbout;
