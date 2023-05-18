import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Page from '../Page';
import Uganda from 'icons/africanCities/countries/uganda.svg';
import Kenya from 'icons/africanCities/countries/kenya.svg';
import Nigeria from 'icons/africanCities/countries/nigeria.svg';
import Ghana from 'icons/africanCities/countries/ghana.svg';
import Burundi from 'icons/africanCities/countries/burundi.svg';
import Senegal from 'icons/africanCities/countries/senegal.svg';
import Mozambique from 'icons/africanCities/countries/mozambique.svg';
import { useInitScrollTop } from 'utils/customHooks';
import BackgroundShape from 'icons/africanCities/background-shape.svg';
import ArrowRight from 'icons/research/arrow-right.svg';
import NEMACollabImg1 from 'assets/img/community/AirQo_Web_IMG05.jpg';
import NEMACollabImg2 from 'assets/img/community/AirQo_Web_IMG03.jpg';
import NEMACollabImg3 from 'assets/img/community/AirQo_Web_IMG04.jpg';
import KCCACollabImg1 from 'assets/img/community/AirQo_Web_IMG09.jpg';
import KCCACollabImg2 from 'assets/img/community/AirQo_Web_IMG08.jpg';
import KCCACollabImg3 from 'assets/img/community/AirQo_Web_IMG07.jpg';
import UnepKenyaImg1 from 'assets/img/AfricanCities/UnepKenya.jpg';
import UnepKenyaImg2 from 'assets/img/AfricanCities/UnepKenya-2.jpg';
import SEO from 'utils/seo';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'underscore';
import { getAllCities } from '../../../reduxStore/AfricanCities/CitiesSlice';
import SectionLoader from '../../components/LoadSpinner/SectionLoader';

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

 // TODO: styling for 3 and 4 image number variations
export const CityContent = ({ content }) => {
  return (
    <>
      {content.map((content) => (
        <div key={content.id}>
          <div className="cities-content">
            <div className="cities-container">
              <div className="consult-text">
                <div>
                  <p className="title">{content.title}</p>
                  {content.description.map((p) => (
                    <p key={p.id}>{p.paragraph}</p>
                  ))}
                </div>
              </div>
              <div className="grid-tiles">
                {content.image.length > 0 ? (
                  content.image.slice(0,2).map((img) => (
                    <div className="grid-tile">
                      <img src={img.image} alt="" key={img.id} />
                      <BackgroundShape className="background-shape" />
                    </div>
                  ))
                ) : (
                  <div>
                    <BackgroundShape className="background-shape" />
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="cities-divider" />
        </div>
      ))}
    </>
  );
};

const CityTab = ({ cities }) => {
  const activeCity = cities.map((entry) => entry.city_name);
  const [selectedTab, setSelectedTab] = useState();
  const [activeTab, setActiveTab] = useState();
  const onClickTabItem = (tab) => setSelectedTab(tab);

  useEffect(() => {
    setSelectedTab(activeCity[0]);
    setActiveTab(activeCity[0]);
  }, [cities]);

  return (
    <div className="city-content-wrapper">
      {cities.map((city) => (
        <>
          <span className="nav-tab" key={city.id}>
            <button
              className={selectedTab === city.city_name ? 'selected' : 'unselected'}
              onClick={() => {
                onClickTabItem(city.city_name);
                setActiveTab(city.city_name);
              }}>
              {city.city_name}
            </button>
          </span>
        </>
      ))}
      {
        <div>
          {selectedTab === activeTab &&
            cities
              .filter((city) => city.city_name === activeTab)
              .map((city) => <CityContent content={city.content} />)}
        </div>
      }
    </div>
  );
};

const CountryTab = ({ className, flag, name, onClick, keyValue }) => (
  <div onClick={onClick} key={keyValue}>
    <span className={className}>
      <img src={flag} alt="" height={22} width={28} /> <span className="text">{name}</span>
    </span>
  </div>
);

const CountryTabs = ({ countries, activeCountry, loading }) => {
  const [activeTab, setActiveTab] = useState();
  const [activatedCountry, setActivatedCountry] = useState();
  const handleClick = (country) => {
    setActiveTab(country);
    setActivatedCountry(country);
  };

  const markActive = (country) => (country === activeTab ? 'active' : '');

  useEffect(() => {
    setActiveTab(activeCountry[0]);
    setActivatedCountry(activeCountry[0]);
  }, [countries]);

 

  return (
    <>
      <div className="city-tabs-wrapper">
        {loading ? (
          <SectionLoader />
        ) : (
          <div className="city-tabs">
            {countries.map((country) => (
              <CountryTab
                keyValue={country.id}
                className={`available ${markActive(country.country_name)}`}
                flag={country.country_flag}
                name={country.country_name}
                onClick={() => {
                  handleClick(country.country_name);
                }}
              />
            ))}
          </div>
        )}
      </div>
      {
        <div className="city-content">
          {activeTab === activatedCountry &&
            countries
              .filter((country) => country.country_name === activatedCountry)
              .map((country) => <CityTab cities={country.city} />)}
        </div>
      }
    </>
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
              rel="noopener noreferrer">
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
  const dispatch = useDispatch();
  const citiesData = useSelector((state) => state.citiesData.cities);
  const africanCountries = citiesData.filter((country) => country.id).sort((a, b) => a.id - b.id);
  const activeCountry = africanCountries.map((entry) => entry.country_name);
  const loadingStatus = useSelector((state) => state.citiesData.loading);

  useEffect(() => {
    if (isEmpty(citiesData)) {
      dispatch(getAllCities());
    }
  }, [dispatch]);

  return (
    <Page>
      <div className="AfricanCitiesPage">
        <SEO
          title="Our Solutions"
          siteTitle="For African Cities"
          description="Leveraging a high-resolution air quality monitoring network to advance air quality management in African cities."
        />
        <CityHeroSection />
        <div className="content-wrapper">
          <CityBanner />
          <div className="cities-divider" />
          <AfricanCitiesApproach />
          <CountryTabs
            countries={africanCountries}
            activeCountry={activeCountry}
            loading={loadingStatus}
          />
          <Outlet />
          <PublicationsSection />
        </div>
      </div>
    </Page>
  );
};

export default AfricanCitiesPage;
