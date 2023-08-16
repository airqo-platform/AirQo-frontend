import React from 'react';
import Page from '../Page';
import { useInitScrollTop } from 'utils/customHooks';
import Header from '../../components/OurProducts/Header';
import NavTab from '../../components/nav/NavTab';
import HeaderImage from '../../assets/img/OurProducts/Api/HeaderImage.png';
import Section1Image from '../../assets/img/OurProducts/Api/section-1.jpg';
import Section2Image from '../../assets/img/OurProducts/Api/section-2.png';
import Section3Image from '../../assets/img/OurProducts/Api/section-3.png';

const ApiPage = () => {
  useInitScrollTop();
  return (
    <Page>
      <div className="product-page api mobile-app analytics">
        <Header
          style={{ backgroundColor: '#FFFDEA' }}
          pageTitle={'AirQo API'}
          title={'Access real-time air quality data.'}
          subText={
            'Designed to effortlessly enhance your application with vital insights, embrace the transformative potential of air quality information through our API.'
          }>
          <img src={HeaderImage} alt="" style={{ borderRadius: '8px' }} />
        </Header>
        <div className="content">
          <div className="grid-wrapper column section section-1">
            <div className="row">
              <h2 className="left title">
                Unlock Air Quality <span className="blue">Insights</span>
              </h2>
              <p className="right">
                The AirQo API provides open access to a vast repository of over 2 million records of
                raw and calibrated real-time, historical, and forecast air quality data.
              </p>
            </div>
            <div className="overlap-section">
              <div className="lapping-left card larger-top" style={{ backgroundColor: '#F2F1F6' }}>
                <h5>Redefining data access</h5>
                <p>
                  The API uses AI and data analysis techniques to provide accurate air quality
                  measurements. It offers PM<sub>2.5</sub> and PM<sub>10</sub> measurements, the
                  most common pollutants in African cities.
                  <br />
                  <br />
                  Our comprehensive air quality datasets include data from our low-cost air quality
                  monitors as well as reference-grade monitors strategically deployed in major
                  African Cities.
                </p>
              </div>
              <div className="lapping-left image" id="section-1">
                <img src={Section1Image} alt="" />
              </div>
            </div>
          </div>
          <div className="grid-wrapper section">
            <div className="overlap-section">
              <div className="lapping-right card" style={{ backgroundColor: '#FFFCE1' }}>
                <h5>Start empowering your audience</h5>
                <p>
                  The AirQo API is not only about air quality data — it's about empowering users to
                  take action to protect themselves against air pollution.
                  <br /> <br />
                  Integrate air quality information in your Open Source Projects, Browser
                  Extensions, Plugins, Mobile Apps, Desktop and Web Apps.
                  <br />
                  <br />
                  Help users take charge of their health and join the movement for cleaner air!
                </p>
              </div>
              <div className="lapping-right image" id="section-2">
                <img src={Section2Image} alt="" />
              </div>
            </div>
          </div>
          <div
            className="grid-full column section landscape-section"
            id="section-3"
            style={{ backgroundColor: '#F2F1F6' }}>
            <div className="column smaller-width">
              <h2 className="left title">
                <span className="blue">How</span> it works
              </h2>
              <p className="right">
                With our API, you have access to comprehensive documentation to enable you
                seamlessly integrate the data, and a dedicated support team to assist you at every
                step of the integration process.
              </p>
              <div className="cta-button">
                <NavTab
                  text="Read Docs"
                  path="https://docs.airqo.net/airqo-rest-api-documentation/"
                  externalLink
                  hideArrow
                  filled
                />
              </div>
            </div>
            <div className="image">
              <img src={Section3Image} alt="" />
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default ApiPage;
