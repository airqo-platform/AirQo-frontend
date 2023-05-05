import React from 'react';
import Page from '../Page';
import { useInitScrollTop } from 'utils/customHooks';
import Header from '../../components/OurProducts/Header';
import HeaderImage from '../../assets/img/OurProducts/MobileApp/mobile-header.png';
import Section1Image from '../../assets/img/OurProducts/MobileApp/section-1.png';
import Section1OverlapImage from '../../assets/img/OurProducts/MobileApp/section-1-bell.png';
import Section2Image from '../../assets/img/OurProducts/MobileApp/section-2.png';
import Section2OverlapImage from '../../assets/img/OurProducts/MobileApp/section-2-calendar.png';
import Section3Image from '../../assets/img/OurProducts/MobileApp/section-3.png';
import GetApp from '../../components/get-app/GetApp';

const MobileAppPage = () => {
  useInitScrollTop();
  return (
    <Page>
      <div className="product-page mobile-app">
        <Header
          style={{ backgroundColor: '#FFFDEA' }}
          pageTitle={'Mobile App'}
          title={'Discover the quality of air around you.'}
          subText={
            'Access to reliable air quality data, is the first step to protecting yourself against air pollution. The AirQo Mobile App is easy to use and free to download allowing you to stay up-to-date on the quality of the air you are breathing.'
          }>
          <img src={HeaderImage} alt="" />
        </Header>
        <div className="content">
          <div className="grid-wrapper column section section-1">
            <div className="row">
              <h2 className="left title">
                Know your <span className="blue">Air</span>
              </h2>
              <p className="right">
                The AirQo Air quality Mobile App is the first of its kind in Africa. With the App,
                you have access to real-time and forecast air quality information from monitored
                urban areas across major cities in Africa.
              </p>
            </div>
            <div className="overlap-section">
              <div className="lapping-left card" style={{ backgroundColor: '#F2F1F6' }}>
                <h5>Personalized air quality alerts and notifications</h5>
                <p>
                  Receive personalized air quality alerts and recommendations to empower you to take
                  action and stay healthy.
                  <br />
                  <br /> Set up your favourite places to quickly check the quality of air in areas
                  that matter to you.
                  <br />
                  <br /> Turn on the notifications to know the quality of the air you are breathing.{' '}
                  <br />
                  <br /> You will receive a push notification whenever the quality of air is clean
                  or gets above the recommended safe levels.
                </p>
              </div>
              <div className="lapping-left image" id="section-1">
                <img src={Section1Image} alt="" />
                <div className="image-overlap">
                  <img src={Section1OverlapImage} alt="" style={{ objectPosition: '0px' }} />
                </div>
              </div>
            </div>
          </div>
          <div className="grid-wrapper section">
            <div className="overlap-section">
              <div
                className="lapping-right card larger-top"
                style={{ backgroundColor: '#F2F1F6' }}>
                <h5>Real-time and forecast</h5>
                <p>
                  Our App gives you access to real-time and forecast air quality information at the
                  palm of your hands, giving you the power to make informed decisions about your
                  daily activities. <br/> <br/>
                  Our 24-hour air quality forecast developed using Machine
                  Learning and AI provides you with the power to better plan your day, know when to
                  take a walk or a jog to avoid air pollution and stay healthy.
                </p>
              </div>
              <div className="lapping-right image" id="section-2">
                <img src={Section2Image} alt="" />
                <div className="image-overlap">
                  <img src={Section2OverlapImage} alt="" />
                </div>
              </div>
            </div>
          </div>
          <div className="grid-wrapper section section-3">
            <div className="overlap-section">
              <div className="lapping-left card" style={{ backgroundColor: '#F2F1F6' }}>
                <h5>Health tips</h5>
                <p>
                  Our App provides you with detailed information beyond the numbers.
                  <br />
                  <br />
                  You have access to frequent tips to help you stay healthy and learn how you can
                  reduce your exposure to air pollution.
                </p>
              </div>
              <div className="lapping-left image" id="section-3">
                <img src={Section3Image} alt="" />
              </div>
            </div>
          </div>
          <div className="grid-wrapper">
            <GetApp />
          </div>
        </div>
      </div>
    </Page>
  );
};

export default MobileAppPage;
