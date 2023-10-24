import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Modal, Box } from '@mui/material';
import MakText from 'icons/nav/MakText';
import AirQo from 'icons/footer/AirQo';
import Twitter from 'icons/footer/Twitter';
import Facebook from 'icons/footer/Facebook';
import Youtube from 'icons/footer/Youtube';
import LinkedIn from 'icons/footer/LinkedIn.svg';
import Location from 'icons/footer/Location';
import ArrowDown from 'icons/footer/ArrowDown';
import CancelIcon from 'icons/footer/cancel.svg';

import Uganda from 'icons/africanCities/countries/uganda.svg';
import Kenya from 'icons/africanCities/countries/kenya.svg';
import Nigeria from 'icons/africanCities/countries/nigeria.svg';
import Ghana from 'icons/africanCities/countries/ghana.svg';
import Burundi from 'icons/africanCities/countries/burundi.svg';
import Senegal from 'icons/africanCities/countries/senegal.svg';
import Mozambique from 'icons/africanCities/countries/mozambique.svg';
import Cameroon from 'icons/africanCities/countries/cameroon.svg';

import { useAirqloudSummaryData, useCurrentAirqloudData } from 'reduxStore/AirQlouds/selectors';
import { setCurrentAirQloudData } from 'reduxStore/AirQlouds/operations';
import { useTranslation, Trans } from 'react-i18next';
import LocationTracker from './LoctionTracker/LocationTracker';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: 600,
  // minHeight: 200,
  width: '90%',
  bgcolor: 'background.paper',
  outline: 'none'
  // boxShadow: 24,
  // p: 4,
};

const flagMapper = {
  uganda: <Uganda />,
  kenya: <Kenya />,
  nigeria: <Nigeria />,
  ghana: <Ghana />,
  burundi: <Burundi />,
  senegal: <Senegal />,
  mozambique: <Mozambique />,
  cameroon: <Cameroon />
};

const CountryTab = ({ className, flag, name, onClick }) => (
  <div className={className} onClick={onClick}>
    {flag} <span>{name}</span>
  </div>
);

const Footer = () => {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');

  const airqloudSummaries = useAirqloudSummaryData();
  const currentAirqloud = useCurrentAirqloudData();
  const [selectedAirqloud, setSelectedAirqloud] = useState(currentAirqloud);
  const { t } = useTranslation();

  const currentAirqloudData = airqloudSummaries[currentAirqloud] || { numberOfSites: 0 };

  const explodeSummaryCount = (numberOfSites) => {
    const paddedCount = numberOfSites.toString().padStart(4, '0');
    return paddedCount.split('');
  };

  const toggleOpen = () => setOpen(!open);

  const active = (country) => (country === selectedCountry ? 'tab-selected' : '');

  const onTabClick = (country) => () => {
    setSelectedCountry(country);
    setSelectedAirqloud(country);
  };

  const onCancel = () => {
    setSelectedCountry(currentAirqloud);
    setOpen(false);
  };

  const onSave = () => {
    dispatch(setCurrentAirQloudData(selectedCountry));
    setOpen(false);
  };

  useEffect(() => {
    setSelectedCountry(currentAirqloud);
  }, [currentAirqloud]);

  // an array for the countries
  const countries = [
    { name: 'Uganda', flag: <Uganda /> },
    { name: 'Kenya', flag: <Kenya /> },
    { name: 'Nigeria', flag: <Nigeria /> },
    { name: 'Ghana', flag: <Ghana /> },
    { name: 'Burundi', flag: <Burundi /> },
    { name: 'Senegal', flag: <Senegal /> },
    { name: 'Mozambique', flag: <Mozambique /> },
    { name: 'Cameroon', flag: <Cameroon /> }
  ];

  return (
    <footer className="footer-wrapper">
      <div className="Footer">
        <div className="body-section">
          <div className="logo">
            <AirQo />
            <div className="logo-text">
              <Trans i18nKey="homepage.heroSection.title">
                Clean air for <br /> all African cities
              </Trans>
            </div>
            <div className="social-links">
              <a target="_blank" href="https://www.facebook.com/AirQo" rel="noreferrer">
                <Facebook />
              </a>
              <a
                target="_blank"
                href="https://www.youtube.com/channel/UCx7YtV55TcqKGeKsDdT5_XQ"
                rel="noreferrer">
                <Youtube />
              </a>
              <a
                target="_blank"
                href="https://www.linkedin.com/company/airqo/mycompany/"
                rel="noreferrer">
                <LinkedIn />
              </a>
              <a target="_blank" href="https://twitter.com/AirQoProject" rel="noreferrer">
                <Twitter />
              </a>
            </div>
          </div>
          <div className="content">
            <span className="content-tabs middle-tab">
              <span>{t('navbar.products.title')}</span>
              <div>
                <span>
                  <Link to="/products/monitor">{t('navbar.products.subnav.monitor.name')}</Link>
                </span>
                <span>
                  <Link to="/products/analytics">{t('navbar.products.subnav.dashboard.name')}</Link>
                </span>
                <span>
                  <Link to="/products/api">{t('navbar.products.subnav.api.name')}</Link>
                </span>
                <span>
                  <Link to="/products/mobile-app">{t('navbar.products.subnav.mobileapp.name')}</Link>
                </span>
                <span>
                  <Link to="/products/calibrate">AirQalibrate</Link>
                </span>
              </div>
            </span>
            <span className="content-tabs middle-tab">
              <span>{t('navbar.solutions.title')}</span>
              <div>
                <span>
                  <Link to="/solutions/african-cities">{t('navbar.solutions.subnav.cities.name')}</Link>
                </span>
                <span>
                  <Link to="/solutions/communities">{t('navbar.solutions.subnav.communities.name')}</Link>
                </span>
                <span>
                  <Link to="/solutions/research">{t('navbar.solutions.subnav.research.name')}</Link>
                </span>
              </div>
            </span>
            <span className="content-tabs">
              <span>{t('navbar.about.title')}</span>
              <div>
                <span>
                  <Link to="/about-us">{t('navbar.about.title')}  AirQo</Link>
                </span>
                <span>
                  <Link to="/resources">{t('navbar.about.subnav.resources')}</Link>
                </span>
                <span>
                  <Link to="/events">{t('navbar.about.subnav.events')}</Link>
                </span>
                <span>
                  <Link to="/press">{t('navbar.about.subnav.press')}</Link>
                </span>
                <span>
                  <Link to="/careers">{t('navbar.about.subnav.careers')}</Link>
                </span>
                <span>
                  <Link to="/contact">{t('navbar.about.subnav.contact')}</Link>
                </span>
                <span>
                  <a target="_blank" href="https://medium.com/@airqo" rel="noreferrer noopener">
                    {t('footer.blog')}
                  </a>
                </span>
              </div>
            </span>
          </div>
          <div className="airqlouds-summary" onClick={toggleOpen}>
            <div className="airqloud-dropdown">
              <Location />
              <span>{currentAirqloud}</span>
              <ArrowDown />
            </div>
            <div className="airqloud-count">
              <span className="count-value">
                {explodeSummaryCount(currentAirqloudData.numberOfSites).map((value, key) => (
                  <span key={key}>{value}</span>
                ))}
              </span>{' '}
              <span className="count-text">{t('footer.monitors')} <span className='airqloud-name'>{currentAirqloud}</span></span>
            </div>
          </div>
        </div>
        <div className="copyright-section">
          <div className="copyright-container">
            <div className="text-copyright">© {new Date().getFullYear()} AirQo</div>
            <div className="terms-section">
              <span className="text-terms mr-24">
                <Link to="/legal">{t('footer.tos')}</Link>
              </span>
              <span className="text-terms mr-24">
                <Link to="/legal">{t('footer.privacy')}</Link>
              </span>
              {/* <span className="text-terms mr-24">Sustainability</span> */}
            </div>
          </div>
          <div className="project-container mb-24">
            <div className="project">
              <div className="project-text">{t('footer.by')}</div>
              <MakText />
            </div>
          </div>
        </div>
      </div>
      <LocationTracker countries={countries} />
      <Modal open={open} onClose={toggleOpen}>
        <Box sx={style}>
          <div className="modal">
            <div className="modal-title">
              <span>{t('footer.modal.title')}</span>
              <CancelIcon className="modal-cancel" onClick={toggleOpen} />
            </div>
            <div className="divider" />
            <div className="title">{t('footer.modal.subTitle')}</div>
            <div className="sub-title">{t('footer.modal.view')}</div>
            <div className="category-label">{t('footer.modal.select')}</div>
            <CountryTab
              className="tab tab-selected tab-margin"
              flag={flagMapper[selectedAirqloud.toLowerCase()]}
              name={selectedAirqloud}
            />
            <div className="category-label">{t('footer.modal.country')}</div>
            <div className="countries">
              {/* The country list displayed here */}
              {countries.map((country) => (
                <CountryTab
                  className={`tab tab-margin-sm ${active(country.name)}`}
                  flag={country.flag}
                  name={country.name}
                  onClick={onTabClick(country.name)}
                />
              ))}
              <CountryTab className={`tab tab-margin-sm`} />
            </div>
            <div className="divider" />
            <div className="btns">
              <div className="cancel-btn" onClick={onCancel}>
                {t('footer.modal.cancel')}
              </div>
              <div className="save-btn" onClick={onSave}>
                {t('footer.modal.save')}
              </div>
            </div>
          </div>
        </Box>
      </Modal>
    </footer>
  );
};

export default Footer;
