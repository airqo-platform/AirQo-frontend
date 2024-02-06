import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import Page from '../Page';
import { useInitScrollTop } from 'utilities/customHooks';
import BackgroundShape from 'icons/africanCities/background-shape.svg';
import ArrowRight from 'icons/research/arrow-right.svg';
import SEO from 'utilities/seo';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'underscore';
import { getAllCities } from '../../../reduxStore/AfricanCities/CitiesSlice';
import SectionLoader from '../../components/LoadSpinner/SectionLoader';
import { useTranslation, Trans } from 'react-i18next';
import { t } from 'i18next';

const CityHeroSection = () => {
  const { t } = useTranslation();
  return (
    <div className="city-title">
      <div className="page-nav">{t('solutions.africanCities.header.breadCrumb')}</div>
      <div className="city-main-text">{t('solutions.africanCities.header.title')}</div>
      <div className="city-sub-text">{t('solutions.africanCities.header.subText')}</div>
    </div>
  );
};

const CityBanner = () => {
  const { t } = useTranslation();
  return <div className="city-banner">{t('solutions.africanCities.banner.mainText')}</div>;
};

const AfricanCitiesApproach = () => (
  <section className="approach-section">
    <div className="section-row">
      <h2>{t('solutions.africanCities.approach.title')}</h2>
      {/* <p>We empower city authorities and citizens with timely information and evidence to address the air pollution challenge.</p> */}
    </div>
    <div className="section-content">
      <div className="content">
        <h3 className="outstanding-text">
          {t('solutions.africanCities.approach.card.first.title')}
        </h3>
        <p>{t('solutions.africanCities.approach.card.first.subText')}</p>
      </div>
      <hr />
      <div className="content">
        <h3>{t('solutions.africanCities.approach.card.second.title')}</h3>
        <p>{t('solutions.africanCities.approach.card.second.subText')}</p>
      </div>
      <hr />
      <div className="content">
        <h3>{t('solutions.africanCities.approach.card.third.title')}</h3>
        <p>{t('solutions.africanCities.approach.card.third.subText')}</p>
      </div>
      <hr />
      <div className="content">
        <h3>{t('solutions.africanCities.approach.card.fourth.title')}</h3>
        <p>{t('solutions.africanCities.approach.card.fourth.subText')}</p>
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
                  content.image.slice(0, 2).map((img) => (
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
      <div className="nav-tabs">
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
      </div>
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
      <div className="title">{t('solutions.africanCities.publications.title')}</div>
      <div>
        <div className="main-text">{t('solutions.africanCities.publications.mainText')}</div>
        <div className="author">{t('solutions.africanCities.publications.author')}</div>
        <div className="team">{t('solutions.africanCities.publications.team')}</div>
        <div>
          <div className="link">
            <a
              href="https://www.sciencedirect.com/science/article/pii/S2352340922007065?via%3Dihub"
              target="_blank"
              download
              rel="noopener noreferrer">
              <span>
                {t('solutions.africanCities.publications.cta')} <ArrowRight />
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
