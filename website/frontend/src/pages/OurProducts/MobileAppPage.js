import React from 'react';
import Page from '../Page';
import { useInitScrollTop } from 'utilities/customHooks';
import Header from '../../components/OurProducts/Header';
import HeaderImage from '../../assets/img/OurProducts/MobileApp/mobile-header.webp';
import Section1Image from '../../assets/img/OurProducts/MobileApp/section-1.webp';
import Section1OverlapImage from '../../assets/img/OurProducts/MobileApp/section-1-bell.webp';
import Section2Image from '../../assets/img/OurProducts/MobileApp/section-2.webp';
import Section2OverlapImage from '../../assets/img/OurProducts/MobileApp/section-2-calendar.webp';
import Section3Image from '../../assets/img/OurProducts/MobileApp/section-3.webp';
import GetApp from '../../components/get-app/GetApp';
import { useTranslation, Trans } from 'react-i18next';
import SEO from 'utilities/seo';

const MobileAppPage = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  return (
    <Page>
      <SEO
        title="AirQo Mobile App - Monitor Air Quality Across Africa"
        siteTitle="AirQo"
        description="Stay updated on real-time air quality data across Africa with the AirQo mobile app. Access historical trends and forecasts, covering Uganda, Kenya, Cameroon, and beyond. Empowering communities with data for healthier living."
        canonicalUrl={[
          'https://airqo.africa/products/mobile-app',
          'https://airqo.net/products/mobile-app',
          'https://airqo.mak.ac.ug/products/mobile-app'
        ]}
        keywords="AirQo, air quality, mobile app, real-time air monitoring, Africa air pollution, Uganda, Kenya, air quality forecast, pollution alerts"
        image="https://res.cloudinary.com/dbibjvyhm/image/upload/v1726576251/website/photos/Get-app_ha3sbf.png"
        article={false}
      />

      <div className="product-page mobile-app">
        <Header
          style={{ backgroundColor: '#FFFDEA' }}
          pageTitle={t('products.mobileApp.header.pageTitle')}
          title={t('products.mobileApp.header.title')}
          subText={t('products.mobileApp.header.subText')}>
          <img src={HeaderImage} alt="" />
        </Header>
        <div className="content">
          <div className="grid-wrapper column section section-1">
            <div className="row">
              <h2 className="left title">
                <Trans i18nKey="products.mobileApp.first.title">
                  Know your <span className="blue">Air</span>
                </Trans>
              </h2>
              <p className="right">{t('products.mobileApp.first.subText')}</p>
            </div>
            <div className="overlap-section">
              <div className="lapping-left card" style={{ backgroundColor: '#F2F1F6' }}>
                <h5>{t('products.mobileApp.second.title')}</h5>
                <p>
                  <Trans i18nKey="products.mobileApp.second.subText">
                    Receive personalized air quality alerts and recommendations to empower you to
                    take action and stay healthy.
                    <br />
                    <br /> Set up your favourite places to quickly check the quality of air in areas
                    that matter to you.
                    <br />
                    <br /> Turn on the notifications to know the quality of the air you are
                    breathing. <br />
                    <br /> You will receive a push notification whenever the quality of air is clean
                    or gets above the recommended safe levels.
                  </Trans>
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
              <div className="lapping-right card larger-top" style={{ backgroundColor: '#F2F1F6' }}>
                <h5>{t('products.mobileApp.third.title')}</h5>
                <p>
                  <Trans i18nKey="products.mobileApp.third.subText">
                    Our App gives you access to real-time and forecast air quality information at
                    the palm of your hands, giving you the power to make informed decisions about
                    your daily activities. <br /> <br />
                    Our 24-hour air quality forecast developed using Machine Learning and AI
                    provides you with the power to better plan your day, know when to take a walk or
                    a jog to avoid air pollution and stay healthy.
                  </Trans>
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
                <h5>{t('products.mobileApp.fourth.title')}</h5>
                <p>
                  <Trans i18nKey="products.mobileApp.fourth.subText">
                    Our App provides you with detailed information beyond the numbers.
                    <br />
                    <br />
                    You have access to frequent tips to help you stay healthy and learn how you can
                    reduce your exposure to air pollution.
                  </Trans>
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
