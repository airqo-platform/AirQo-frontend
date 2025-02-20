import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MobileApp from 'assets/svg/explore/discover-air-quality.svg';
import AirqualityPlatform from 'assets/svg/explore/air-quality-platform.svg';
import { useInitScrollTop } from 'utilities/customHooks';
import { NETMANAGER_URL } from 'config/urls';
import SEO from 'utilities/seo';
import AirQo from 'icons/nav/AirQo';
import AppleBtn from 'assets/svg/apple_app_store.svg';
import GoogleplayBtn from 'assets/svg/android_play_store.svg';
import QR_code from 'assets/img/QR_code.jpg';
import ManDownloadingApp from 'assets/img/explore/man-download-app.png';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';

export const PageWithImageLayout = ({ imgPath, children }) => {
  const navigate = useNavigate();

  const navigateBack = () => navigate(-1);
  useInitScrollTop();
  return (
    <ExploreDataModal>
      <div className="ExploreDataWrapper">
        <div className="left-section">
          <img src={imgPath || ManDownloadingApp} width="100%" height="100%" />
        </div>
        <div className="right-section">
          <div className="nav-row">
            <button onClick={navigateBack}>
              <ArrowBackIcon />
            </button>
            <Link to="/">
              <CloseIcon />
            </Link>
          </div>
          <div className="content">{children}</div>
        </div>
      </div>
    </ExploreDataModal>
  );
};

export const ExploreDataModal = ({ children }) => {
  return (
    <div className="ExploreDataModal">
      <SEO
        title="Explore Data"
        siteTitle="AirQo"
        description="Access real-time and historic air quality information across Africa through our easy-to-use air quality analytics dashboard or mobile app."
      />
      <div className="ExploreDataModalWrapper">{children}</div>
    </div>
  );
};

export const ExploreApp = () => (
  <PageWithImageLayout>
    <div className="ExploreApp">
      <div className="brand-icon">
        <AirQo />
      </div>
      <h2>Get the AirQo app</h2>
      <p>Discover the quality of air you are breathing.</p>
      <div className="wrapper">
        <div className="img-wrapper">
          <img src={QR_code} width={200} alt="QR_code" />
        </div>
        <hr />
        <div className="btn-group" style={{}}>
          <a
            target="_blank"
            href="https://apps.apple.com/ug/app/airqo-monitoring-air-quality/id1337573091"
            rel="noreferrer">
            <div
              style={{
                marginBottom: '40px',
                background: '#000',
                borderRadius: '8px',
                padding: '5px'
              }}>
              <AppleBtn />
            </div>
          </a>
          <a
            target="_blank"
            href="https://play.google.com/store/apps/details?id=com.airqo.app"
            rel="noreferrer">
            <div style={{ background: '#000', borderRadius: '8px', padding: '3px' }}>
              <GoogleplayBtn />
            </div>
          </a>
        </div>
      </div>
    </div>
  </PageWithImageLayout>
);

const ExploreData = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  return (
    <ExploreDataModal>
      <div className="ExploreData">
        <div className="left-section">
          <div className="nav">
            <Link to="/">
              <h3>{t('exploreData.leftSection.breadCrumb.home')}</h3>
            </Link>
            <ArrowForwardIosIcon className="icon" />
            <h3 className="blur-text">{t('exploreData.leftSection.breadCrumb.explore')}</h3>
          </div>
          <div className="content">
            <h2>{t('exploreData.leftSection.title')}</h2>
            <p>{t('exploreData.leftSection.subText')}</p>
          </div>
        </div>
        <div className="right-section">
          <div className="nav-icon">
            <Link to="/">
              <CloseIcon />
            </Link>
          </div>
          <div className="nav">
            <div className="nav-option">
              <div className="img-wrapper">
                <div className="img-1">
                  <MobileApp />
                </div>
              </div>
              <h6>{t('exploreData.rightSection.mobileApp.title')}</h6>
              <Link to="/explore-data/download-apps">
                <button className="nav-button">
                  {t('exploreData.rightSection.mobileApp.btnText')}
                </button>
              </Link>
            </div>
            <div className="nav-option">
              <div className="img-wrapper">
                <div className="img-2">
                  <AirqualityPlatform />
                </div>
              </div>
              <h6>{t('exploreData.rightSection.analytics.title')}</h6>
              <Link to={`${NETMANAGER_URL}`} target="_blank" rel="noopener noreferrer">
                <button className="nav-button">
                  {t('exploreData.rightSection.analytics.btnText')}
                </button>
              </Link>
            </div>
          </div>
          <button className="user-manual">
            {/* <DownloadIcon />
            <a
              href={UserManual}
              download="AirQo_Analytics_Platform_User_Manual.pdf"
              target="_blank"
              rel="noopener noreferrer">
              Air Quality Platform User Manual
            </a> */}
          </button>
        </div>
      </div>
    </ExploreDataModal>
  );
};

export default ExploreData;
