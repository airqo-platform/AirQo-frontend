import React from 'react';
import Header from '../../components/OurProducts/Header';
import Page from '../Page';
import HeaderImage from '../../assets/img/OurProducts/Analytics/analytics-header.png';
import { useInitScrollTop } from 'utils/customHooks';
import Section1Image from '../../assets/img/OurProducts/Analytics/section-1.png';
import Section1OverlapImage from '../../assets/img/OurProducts/Analytics/section-1-overlap.png';
import Section2Image from '../../assets/img/OurProducts/Analytics/section-2.png';
import Section3Image from '../../assets/img/OurProducts/Analytics/analytics-dashboard.png';
import NavTab from '../../components/nav/NavTab';

const AnalyticsPage = () => {
  useInitScrollTop();
  return (
    <Page>
      <div className="product-page analytics">
        <Header
          pageTitle={'Air quality analytics Dashboard'}
          title={'Access and visualise air quality data in African Cities.'}
          subText={
            'If we can’t measure air pollution, we can’t manage it: Access, track, analyse and download insightful air quality data across major cities in Africa.'
          }>
          <img src={HeaderImage} alt="" />
        </Header>
        <div className="content">
          <div className="grid-wrapper column section">
            <div className="row">
              <h2 className="left title">
                <span className="blue">Real-time</span> air quality analytics for African Cities
              </h2>
              <p className="right">
                Air pollution in many cities in Africa is under-monitored in part due to the
                logistical constraints of setting up and maintaining a monitoring network, coupled
                with the expertise to process and analyse data.
              </p>
            </div>
            <div className="overlap-section">
              <div className="lapping-left card larger-top" style={{ backgroundColor: '#ebfff5' }}>
                <h5>Timely access to data</h5>
                <p>
                  The air quality analytics dashboard is an intuitive software dashboard that allows
                  you to have timely access to historic, real-time, and forecast actionable air
                  quality information across our monitored urban spaces in Africa.
                  <br />
                  <br />
                  We want to see citizens and decision-makers in Africa Cities have timely access to
                  air quality trends, patterns and insights to inform data-driven decisions to
                  tackle air pollution.
                </p>
              </div>
              <div className="lapping-left image" id="section-1">
                <img src={Section1Image} alt="" />
                <div className='image-overlap'>
                <img src={Section1OverlapImage} alt="" style={{objectPosition:'0px'}}/>
                </div>
              </div>
            </div>
          </div>
          <div className="grid-wrapper section">
            <div className="overlap-section">
              <div
                className="lapping-right card larger-top smaller-width"
                style={{ backgroundColor: '#ebfff5' }}>
                <h5>Gain insights to take action</h5>
                <p>
                  With our air quality analytics dashboard, you can view, historical, real-time or
                  forecast calibrated data in locations that matter to you. <br />
                  <br />
                  You can generate, compare and download air quality data in various African Cities
                  and develop evidence-informed actions for air pollution.
                </p>
              </div>
              <div className="lapping-right image" id="section-2">
                <img src={Section2Image} alt="" />
              </div>
            </div>
          </div>
          <div className="grid-full column section landscape-section">
            <div className="column smaller-width">
              <h2 className="left title">
                <span className="blue">Easy to use</span> interface
              </h2>
              <p className="right">
                Our visualization charts are designed to help you easily interpret and gain insights
                into the data while giving you access to air quality trends in African Cities over
                time. With our easy-to-use interface, you can track and visualise air quality trends
                over time.
              </p>
              <NavTab text="Explore data" path="/explore-data" hideArrow filled />
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

export default AnalyticsPage;
