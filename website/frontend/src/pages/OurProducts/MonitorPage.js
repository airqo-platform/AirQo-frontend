import React from 'react';
import Header from '../../components/OurProducts/Header';
import HeaderImage from '../../assets/img/OurProducts/Monitor/monitor.png';
import Page from '../Page';
import Section1Image from '../../assets/img/OurProducts/Monitor/section-1.png';
import Section2Image from '../../assets/img/OurProducts/Monitor/Africa.png';
import Section3Image from '../../assets/img/OurProducts/Monitor/activate.png';
import UserGuide from '../../assets/docs/AirQoMonitorUserGuideV04.pdf';
import { FileDownloadOutlined } from '@mui/icons-material';

const MonitorPage = () => {
  return (
    <Page>
      <div className="product-page monitor">
        <Header
          pageTitle={'Binos Monitor'}
          title={'Built in Africa for African cities'}
          subText={
            'The monitors are optimised with capabilities to cope with challenges like extreme weather conditions including high levels of dust and heat,  intermittent power and internet connectivity, typical to the context of African cities.'
          }>
          <img src={HeaderImage} alt="" />
        </Header>
        <div className="content">
          <div className="grid-wrapper column section">
            <div className="row">
              <h2 className="left title">
                <span className="blue">Locally built</span> low cost monitors
              </h2>
              <p className="right">
                The Binos Monitor is a low-cost air quality device configured to measure particulate
                matter PM<sub>2.5</sub> and PM<sub>10</sub>, the most common pollutants in African
                cities. It also measures ambient meteorological conditions such as humidity and
                atmospheric pressure.
              </p>
            </div>
            <div className="overlap-section">
              <div className="lapping-left card" style={{ backgroundColor: '#ebfff5' }}>
                <h5>Designed for Africa</h5>
                <p>
                  The device is locally built and uniquely designed to withstand environmental and
                  physical conditions such as dust and extreme weather. <br />
                  <br />
                  Powered by either mains or solar, the device is optimised to work in settings
                  characterised by unreliable power and intermittent internet connectivity. <br />
                  <br />
                  It runs on a 2G GSM network configuration for IoT sim cards.
                </p>
              </div>
              <div className="lapping-left image" id="section-1">
                <img src={Section1Image} alt="" />
              </div>
            </div>
          </div>
          <div className="grid-wrapper section">
            <div className="overlap-section">
              <div className="lapping-right card" style={{ backgroundColor: '#ebfff5' }}>
                <h5>160+ Air quality monitors installed in 8 major African cities</h5>
                <p>
                  The monitors are easy to install and can be placed on static buildings or
                  motor-cycle taxis locally called 'boda-bodas' to improve spatial coverage and
                  revolution.
                </p>
              </div>
              <div className="lapping-right image africa">
                <img src={Section2Image} alt="" />
              </div>
            </div>
          </div>
          <div className="grid-wrapper column section">
            <div className="row">
              <h2 className="left title">
                <span className="blue">Monitor</span> Installation
              </h2>
              <p className="right">
                This guide includes instructions and manuals on how to easily activate, install,
                operate and manage the Binos Air Quality Monitors.
              </p>
            </div>
            <div className="overlap-section">
              <div className="lapping-left card" style={{ backgroundColor: '#FFFCE1' }}>
                <h5>Activate, install, operate and manage the Binos Monitors </h5>
                <p>
                  This guide includes instructions and manuals on how to easily activate, install,
                  operate and manage the Binos Air Quality Monitors.
                </p>
                <a href={UserGuide} target='_blank' download={'BinosMonitorUserGuideV0.04.pdf'} rel="noreferrer noopener">
                  <button className="download-button">
                    Download the User Guide <FileDownloadOutlined />
                  </button>
                </a>
                <div style={{ textAlign: 'center' }}>
                  <small>
                    In this guide, you will find recommendations on:
                    <br /> • Where to place the monitor • How to install the monitor • How to access the
                    monitor data using our analytics dashboard
                  </small>
                </div>
              </div>
              <div className="lapping-left image" id="section-3">
                <img src={Section3Image} alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default MonitorPage;
