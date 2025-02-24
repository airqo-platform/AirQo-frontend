import React from 'react';
import Header from '../../components/OurProducts/Header';
import Page from '../Page';
import HeaderImage from '../../assets/img/OurProducts/Analytics/analytics-header.webp';
import { useInitScrollTop } from 'utilities/customHooks';
import Section1Image from '../../assets/img/OurProducts/Analytics/section-1.webp';
import Section1OverlapImage from '../../assets/img/OurProducts/Analytics/section-1-overlap.webp';
import Section2Image from '../../assets/img/OurProducts/Analytics/section-2.webp';
import Section3Image from '../../assets/img/OurProducts/Analytics/analytics-dashboard.webp';
import NavTab from '../../components/nav/NavTab';
import { FileDownloadOutlined } from '@mui/icons-material';
import { useTranslation, Trans } from 'react-i18next';
import SEO from 'utilities/seo';

const UserManual =
  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1716038899/website/docs/AirQoAnalyticsPlatformUserGuide_ssyebk.pdf';

const AnalyticsPage = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  return (
    <Page>
      <SEO
        title="AirQo Analytics - Real-Time Air Quality Insights for Africa"
        siteTitle="AirQo"
        description="Discover AirQo's advanced analytics platform for monitoring and analyzing air quality in African cities. Gain real-time insights and historical data on particulate matter (PM2.5, PM10) and leverage customizable charts, data export options, and forecasting tools to manage air pollution effectively."
        keywords="AirQo, air quality, analytics, PM2.5, PM10, air pollution, real-time air quality data, African cities, air quality monitors, environmental data"
        canonicalUrl="https://airqo.africa/products/analytics"
        article={false}
      />

      <div className="product-page analytics">
        <Header
          pageTitle={t('products.Analytics.header.pageTitle')}
          title={t('products.Analytics.header.title')}
          subText={t('products.Analytics.header.subText')}>
          <img src={HeaderImage} alt="" />
        </Header>
        <div className="content">
          <div className="grid-wrapper column section">
            <div className="row">
              <h2 className="left title">
                <Trans i18nKey="products.Analytics.first.title">
                  <span className="blue">Real-time</span> air quality analytics for African Cities
                </Trans>
              </h2>
              <p className="right">{t('products.Analytics.first.subText')}</p>
            </div>
            <div className="overlap-section">
              <div className="lapping-left card" style={{ backgroundColor: '#ebfff5' }}>
                <h5>{t('products.Analytics.second.title')}</h5>
                <p>
                  <Trans i18nKey="products.Analytics.second.subText">
                    The air quality analytics dashboard is an intuitive software dashboard that
                    allows you to have timely access to historic, real-time, and forecast actionable
                    air quality information across our monitored urban spaces in Africa.
                    <br />
                    <br />
                    We want to see citizens and decision-makers in Africa Cities have timely access
                    to air quality trends, patterns and insights to inform data-driven decisions to
                    tackle air pollution.
                  </Trans>
                  <br />
                  <a
                    href={`${UserManual}?#view=FitH`}
                    target="_blank"
                    download="AirQo_Analytics_Platform_User_Manual.pdf"
                    rel="noreferrer noopener">
                    <button className="download-button">
                      {t('products.Analytics.second.cta')} <FileDownloadOutlined />
                    </button>
                  </a>
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
                className="lapping-right card larger-top smaller-width"
                style={{ backgroundColor: '#ebfff5' }}>
                <h5>{t('products.Analytics.third.title')}</h5>
                <p>
                  <Trans i18nKey="products.Analytics.third.subText">
                    With our air quality analytics dashboard, you can view, historical, real-time or
                    forecast calibrated data in locations that matter to you. <br />
                    <br />
                    You can generate, compare and download air quality data in various African
                    Cities and develop evidence-informed actions for air pollution.
                    <br />
                  </Trans>
                </p>
              </div>
              <div className="lapping-right image" id="section-2">
                <img
                  src={Section2Image}
                  alt=""
                  style={{
                    objectPosition: '0px',
                    objectFit: 'contain',
                    width: '100%',
                    height: '100%',
                    borderRadius: '10px'
                  }}
                />
              </div>
            </div>
          </div>
          <div
            className="grid-full column section landscape-section"
            style={{
              overflow: 'hidden'
            }}>
            <div className="column smaller-width">
              <h2 className="left title">
                <Trans i18nKey="products.Analytics.fourth.title">
                  <span className="blue">Easy to use</span> interface
                </Trans>
              </h2>
              <p className="right">{t('products.Analytics.fourth.subText')}</p>
              <NavTab
                text={t('products.Analytics.fourth.cta')}
                path="/explore-data"
                hideArrow
                filled
              />
            </div>
            <div className="image">
              <img
                src={Section3Image}
                alt=""
                style={{
                  objectPosition: '0px',
                  padding: window.innerWidth < 768 ? '0 20px' : '0 100px',
                  objectFit: 'contain',
                  width: '100%',
                  borderRadius: '10px'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default AnalyticsPage;
