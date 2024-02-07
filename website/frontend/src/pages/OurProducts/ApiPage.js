import React from 'react';
import Page from '../Page';
import { useInitScrollTop } from 'utilities/customHooks';
import Header from '../../components/OurProducts/Header';
import NavTab from '../../components/nav/NavTab';
import HeaderImage from '../../assets/img/OurProducts/Api/HeaderImage.png';
import Section1Image from '../../assets/img/OurProducts/Api/section-1.jpg';
import Section2Image from '../../assets/img/OurProducts/Api/section-2.png';
import Section3Image from '../../assets/img/OurProducts/Api/section-3.png';
import { useTranslation, Trans } from 'react-i18next';

const ApiPage = () => {
  useInitScrollTop();
  // generate translation hooks
  const { t } = useTranslation();
  return (
    <Page>
      <div className="product-page api mobile-app analytics">
        <Header
          style={{ backgroundColor: '#FFFDEA' }}
          pageTitle={t('products.api.header.pageTitle')}
          title={t('products.api.header.title')}
          subText={t('products.api.header.subText')}>
          <img src={HeaderImage} alt="" style={{ borderRadius: '8px' }} />
        </Header>
        <div className="content">
          <div className="grid-wrapper column section section-1">
            <div className="row">
              <h2 className="left title">
                <Trans i18nKey="products.api.first.title">
                  Unlock Air Quality <span className="blue">Insights</span>
                </Trans>
              </h2>
              <p className="right">{t('products.api.first.subText')}</p>
            </div>
            <div className="overlap-section">
              <div className="lapping-left card larger-top" style={{ backgroundColor: '#F2F1F6' }}>
                <h5>{t('products.api.second.title')}</h5>
                <p>
                  <Trans i18nKey="products.api.second.subText">
                    The API uses AI and data analysis techniques to provide accurate air quality
                    measurements. It offers PM<sub>2.5</sub> and PM<sub>10</sub> measurements, the
                    most common pollutants in African cities.
                    <br />
                    <br />
                    Our comprehensive air quality datasets include data from our low-cost air
                    quality monitors as well as reference-grade monitors strategically deployed in
                    major African Cities.
                  </Trans>
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
                <h5>{t('products.api.third.title')}</h5>
                <p>
                  <Trans i18nKey="products.api.third.subText">
                    The AirQo API is not only about air quality data — it's about empowering users
                    to take action to protect themselves against air pollution.
                    <br /> <br />
                    Integrate air quality information in your Open Source Projects, Browser
                    Extensions, Plugins, Mobile Apps, Desktop and Web Apps.
                    <br />
                    <br />
                    Help users take charge of their health and join the movement for cleaner air!
                  </Trans>
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
                <Trans i18nKey="products.api.fourth.title">
                  <span className="blue">How</span> it works
                </Trans>
              </h2>
              <p className="right">{t('products.api.fourth.subText')}</p>
              <div className="cta-button">
                <NavTab
                  text={t('products.api.fourth.cta')}
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
