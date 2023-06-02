import React from 'react';
import { Link } from 'react-router-dom';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import MobileApp from 'assets/svg/explore/discover-air-quality.svg';
import AirqualityPlatform from 'assets/svg/explore/air-quality-platform.svg';
import { useInitScrollTop } from 'utils/customHooks';
import { NETMANAGER_URL } from 'config/urls';
import SEO from 'utils/seo';
import UserManual from 'assets/docs/AirQoAnalyticsPlatformUserGuide.pdf';
import DownloadIcon from 'assets/svg/explore/download.svg'

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

const ExploreData = () => {
  useInitScrollTop();
  return (
    <ExploreDataModal>
      <div className="ExploreData">
        <div className="left-section">
          <div className="nav">
            <Link to="/">
              <h3>Home</h3>
            </Link>
            <ArrowForwardIosIcon className="icon" />
            <h3 className="blur-text">Explore Data</h3>
          </div>
          <div className="content">
            <h2>Visualise air quality information.</h2>
            <p>
              Access real-time and historic air quality information across Africa through our
              easy-to-use air quality analytics dashboard or mobile app.
            </p>
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
              <h6>Discover the quality of air you are breathing.</h6>
              <Link to="/explore-data/download-apps">
                <button className="nav-button">Download App</button>
              </Link>
            </div>
            <div className="nav-option">
              <div className="img-wrapper">
                <div className="img-2">
                  <AirqualityPlatform />
                </div>
              </div>
              <h6>An interactive air quality analytics platform</h6>
              <Link to={`${NETMANAGER_URL}`} target="_blank" rel="noopener noreferrer">
                <button className="nav-button">Air Quality Dashboard</button>
              </Link>
            </div>
          </div>
          <button className="user-manual">
            <DownloadIcon />
            <a
              href={UserManual}
              download="AirQo_Analytics_Platform_User_Manual.pdf"
              target="_blank"
              rel="noopener noreferrer">
              Air Quality Platform User Manual
            </a>
          </button>
        </div>
      </div>
    </ExploreDataModal>
  );
};

export default ExploreData;
