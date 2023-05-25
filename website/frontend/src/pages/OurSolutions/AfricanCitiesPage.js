import React, { useState } from 'react';
import { Link, Outlet } from 'react-router-dom';
import Page from '../Page';
import { useInitScrollTop } from 'utils/customHooks';
import BackgroundShape from 'icons/africanCities/background-shape.svg';
import ArrowRight from 'icons/research/arrow-right.svg';
import SEO from 'utils/seo';

const CityHeroSection = () => {
  return (
    <div className="city-title">
      <div className="page-nav">Solutions {'>'} For African Cities</div>
      <div className="city-main-text">For African cities</div>
      <div className="city-sub-text">
        Leveraging a high-resolution air quality monitoring network to advance air quality
        management in African cities.
      </div>
    </div>
  );
};

const CityBanner = () => {
  return (
    <div className="city-banner">
      Many African cities lack actionable data and evidence on the scale and magnitude of air
      pollution in order to tackle air pollution, a major urban environmental health challenge.
    </div>
  );
};

const AfricanCitiesApproach = () => (
  <section className="approach-section">
    <div className="section-row">
      <h2>Our Approach</h2>
      {/* <p>We empower city authorities and citizens with timely information and evidence to address the air pollution challenge.</p> */}
    </div>
    <div className="section-content">
      <div className="content">
        <h3 className="outstanding-text">
          Locally developed high-resolution air quality monitoring network
        </h3>
        <p>
          We want to see cleaner air in all African Cities. We leverage our understanding of the
          African context and close collaborations with relevant partners to deliver a high
          resolution air quality network to inform contextualised and locally relevant approaches to
          air quality management for African cities.
        </p>
      </div>
      <hr />
      <div className="content">
        <h3>Community-aware digital air quality platforms</h3>
        <p>
          We empower decision-makers and citizens in African Cities with increased access to air
          quality data evidence to help them tackle urban air quality and achieve cleaner air
          objectives.
        </p>
      </div>
      <hr />
      <div className="content">
        <h3>Policy Engagement</h3>
        <p>
          We engage city authorities and government agencies to build their capacity and empower
          them with evidence and digital tools for air quality management and informing air quality
          public policies.
        </p>
      </div>
      <hr />
      <div className="content">
        <h3>Community engagement</h3>
        <p>
          We empower local leaders and targeted communities with air quality information to create
          awareness of air quality issues.
        </p>
      </div>
    </div>
  </section>
);

const CityTab = ({ className, flag, name, link, onClick }) => (
  <Link to={link} onClick={onClick}>
    <span className={className}>
      {flag} <span className="text">{name}</span>
    </span>
  </Link>
);

const CityTabs = () => {
  const [active, setActive] = useState('uganda');
  const handleClick = (country) => () => setActive(country);

  const markActive = (country) => (country === active ? 'active' : '');
  return (
    <div className="city-tabs-wrapper">
      <div className="city-tabs">
        <CityTab
          className={`available ${markActive('uganda')}`}
          flag={<Uganda />}
          name="Kampala"
          link="/solutions/african-cities/uganda"
          onClick={handleClick('uganda')}
        />
        {/* <CityTab
                    className={`available ${markActive("kenya")}`}
                    flag={<Kenya />}
                    name="Nairobi"
                    link="/solutions/african-cities/kenya"
                    onClick={handleClick("kenya")}
                /> */}
        <span className="not-available">
          <Kenya /> <span className="text">Nairobi</span>
        </span>
        <span className="not-available">
          <Nigeria /> <span className="text">Lagos</span>
        </span>
        <span className="not-available">
          <Ghana /> <span className="text">Accra</span>
        </span>
        <span className="not-available">
          <Burundi /> <span className="text">Bujumbura</span>
        </span>
        <span className="not-available">
          <Senegal /> <span className="text">Dakar</span>
        </span>
        <span className="not-available extended">
          <Mozambique /> <span className="text text-extended">Manica and Maputo</span>
        </span>
      </div>
    </div>
  );
};

export const ContentUganda = () => {
  return (
    <div className="cities-content">
      <div className="ug-container">
        <div className="consult-text">
          <div>
            <p>Collaboration with KCCA</p>
            <p>
              AirQo partnered with the Kampala Capital City Authority (KCCA) in 2018, to facilitate
              air quality monitoring and data analytics tools across Kampala and other cities around
              the country.
            </p>
            <span className="number-list">
              <span>1</span>
              <span>
                Developed a physical network of low-cost air quality sensors in Kampala and the
                metropolitan areas comprising over 70 installations.
              </span>
            </span>
            <span className="number-list">
              <span>2</span>
              <span>
                Developed a dedicated data analytics dashboard and supporting capacity development
                on air quality monitoring.
              </span>
            </span>
            <span className="number-list">
              <span>3</span>
              <span>
                Improved air quality monitoring resolution. Kampala city is now one of the cities in
                Africa with the highest concentration of air quality monitors.
              </span>
            </span>
          </div>
        </div>
        <div className="consult-images">
          <img className="img-small" src={KCCACollabImg1} alt="consult image" />
          <img className="img-long" src={KCCACollabImg3} alt="consult long image" />
          <img className="img-small" src={KCCACollabImg2} alt="consult image 2" />
          <BackgroundShape className="background-shape" />
        </div>
      </div>

      <div className="cities-divider" />

      <div className="ug-container">
        <div className="consult-text">
          <div>
            <p>Collaboration with NEMA</p>
            <p>
              National Environment Management Authority (NEMA) is the lead government agency
              mandated to coordinate, supervise, and regulate environmental management in Uganda.
            </p>
            <span className="number-list">
              <span>1</span>
              <span>
                AirQo contributes to the air quality chapter in the national state of the
                environment report, a biennal statutory requirement.
              </span>
            </span>
            <span className="number-list">
              <span>2</span>
              <span>
                Officially contributed to the development of the national air quality regulations
                and standards for Uganda.
              </span>
            </span>
            <span className="number-list">
              <span>3</span>
              <span>
                Raise the profile of air quality as a national priority. Air quality is now featured
                as an important priority in the country’s National Development Plan III.
              </span>
            </span>
          </div>
        </div>
        <div className="consult-images">
          <img className="img-small" src={NEMACollabImg2} alt="consult image" />
          <img className="img-long-right" src={NEMACollabImg1} alt="consult long image" />
          <img className="img-small" src={NEMACollabImg3} alt="consult image 2" />
          <BackgroundShape className="background-shape" />
        </div>
      </div>
    </div>
  );
};

export const ContentKenya = () => {
  return (
    <div className="cities-content">
      <div className="cities-content">
        <div className="ke-container">
          <div className="consult-text">
            <div>
              <p>Network deployment in Kenya</p>
              <p>
                Nairobi is located over 600 km from Kampala. It is the first city outside Uganda to
                have an AirQo monitor.
              </p>
              <p>
                We are in advanced stages of developing the air quality network in Nairobi and have
                so far established a collocation installation in Nairobi in partnership with United
                Nations Environment Programme (UNEP).
              </p>
              <p>
                The collocation will also be an opportunity to support existing initiatives on data
                quality assurance for low-cost monitors.
              </p>
            </div>
          </div>
          <div className="consult-images">
            <img className="img-small" src={UnepKenyaImg2} alt="consult image" />
            <img className="img-long" src={UnepKenyaImg1} alt="consult long image" />
            <img className="img-small" src={UnepKenyaImg2} alt="consult image 2" />
            <BackgroundShape className="background-shape" />
          </div>
        </div>
      </div>
      <div className="cities-divider" />
    </div>
  );
};

const PublicationsSection = () => {
  return (
    <div className="publications-section">
      <div className="title">Publications</div>
      <div>
        <div className="main-text">
          Seeing the air in detail: Hyperlocal air quality dataset collected from spatially
          distributed AirQo network.
        </div>
        <div className="author">Published by</div>
        <div className="team">AirQo</div>
        <div>
          <div className="link">
            <a
              href="https://www.sciencedirect.com/science/article/pii/S2352340922007065?via%3Dihub"
              target="_blank"
              download
              rel="noopener noreferrer"
            >
              <span>
                Read More <ArrowRight />
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const AfricanCitiesPage = () => {
  useInitScrollTop();
  return (
    <Page>
      <div className="AfricanCitiesPage">
        <SEO
          title="Our Solutions"
          siteTitle="For African Cities"
          description="Leveraging a high-resolution air quality monitoring network to advance air quality management in African cities."
        />
        <CityHeroSection />
        <CityBanner />
        <div className="cities-divider" />
        <AfricanCitiesApproach />
        <CityTabs />
        <Outlet />
        <PublicationsSection />
      </div>
    </Page>
  );
};

export default AfricanCitiesPage;
