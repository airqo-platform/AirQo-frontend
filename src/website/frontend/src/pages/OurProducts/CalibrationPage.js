import React from 'react';
import Header from '../../components/OurProducts/Header';
import Page from '../Page';
import HeaderImage from '../../assets/img/OurProducts/Calibration/calibration-header.webp';
import { useInitScrollTop } from 'utilities/customHooks';
import Section1Image from '../../assets/img/OurProducts/Calibration/section-1.webp';
import Section2Image from '../../assets/img/OurProducts/Calibration/section-2.webp';
import Section3Image from '../../assets/img/OurProducts/Calibration/section-3.webp';
import NavTab from '../../components/nav/NavTab';
import { OpenInNew } from '@mui/icons-material';
import { useTranslation, Trans } from 'react-i18next';
import SEO from 'utilities/seo';

const CalibrationPage = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  return (
    <Page>
      <SEO
        title="AirQo Calibrate Tool - Enhance Air Quality Data Accuracy"
        siteTitle="AirQo"
        description="Discover AirQo's Calibrate tool, designed to improve the accuracy of air quality monitoring sensors across Africa. Learn how we ensure reliable air quality data through advanced calibration methods."
        canonicalUrl="https://airqo.africa/products/calibrate"
        keywords="AirQo, calibrate tool, air quality calibration, sensor accuracy, air pollution Africa, air quality data"
        article={false}
      />

      <div className="product-page calibrate mobile-app analytics api">
        <Header
          style={{ backgroundColor: '#e6e8fa' }}
          pageTitle={t('products.calibrate.header.pageTitle')}
          title={t('products.calibrate.header.title')}
          subText={t('products.calibrate.header.subText')}>
          <img src={HeaderImage} alt="" style={{ borderRadius: '8px' }} />
        </Header>
        <div className="content">
          <div className="grid-wrapper column section section-1">
            <div className="row">
              <h2 className="left title">
                <Trans i18nKey="products.calibrate.first.title">
                  <span className="blue"> Why calibrate</span> your low-cost sensor data?
                </Trans>
              </h2>
              <p className="right">
                <Trans i18nKey="products.calibrate.first.subText">
                  Low cost sensors are relied on to increase the geographical coverage of air
                  quality monitoring networks but, they are sensitive to ambient conditions
                  (humidity, temperature) which could affect the accuracy of air quality data.
                  <br />
                  Calibration enhances the quality and reliability of air quality data from low-cost
                  sensors.
                </Trans>
              </p>
            </div>
            <div className="overlap-section">
              <div
                className="lapping-left card"
                /*card-sm larger-top*/ style={{ backgroundColor: '#FFFCE1' }}>
                <h5>{t('products.calibrate.second.title')}</h5>
                <p>
                  <Trans i18nKey="products.calibrate.second.subText">
                    AirQalibrate is a Machine Learning based calibration tool that eliminates the
                    need for reference grade monitors or on-site monitor calibration.
                    <br />
                    <br />
                    It enables users without access to reference grade monitors or technical
                    expertise to calibrate data from their low-cost monitors, improve performance
                    and build trust in the air quality network.
                    <br />
                    <br />
                    This reduces operational costs involved in monitoring thereby enabling the
                    expansion of monitoring systems to create a dense air quality monitoring and
                    management network.
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
              <div
                className="lapping-right card"
                style={{ backgroundColor: '#E6E6FA', marginTop: '30px' }}>
                <h5>{t('products.calibrate.third.title')}</h5>
                <p>
                  <Trans i18nKey="products.calibrate.third.subText">
                    Upload a CSV file containing your low-cost sensor PM<sub>2.5</sub> and PM
                    <sub>10</sub> data, follow a few simple steps and calibrate your data. The
                    results are automatically downloaded when the calibration process is completed.
                  </Trans>
                  <br />
                  <a
                    href="https://airqalibrate.airqo.net/"
                    target="_blank"
                    className="download-button">
                    {' '}
                    {t('products.calibrate.third.cta')} <OpenInNew />
                  </a>
                </p>
              </div>
              <div className="lapping-right image" id="section-2">
                <img src={Section2Image} alt="" />
              </div>
            </div>
          </div>

          <div className="grid-full column section landscape-section">
            <div className="column smaller-width mx-wdth-800px">
              <h2 className="left title">
                <Trans i18nKey="products.calibrate.fourth.title">
                  <span className="blue">Simple </span> user interface
                </Trans>
              </h2>
              <p className="right ">{t('products.calibrate.fourth.subText')}</p>
              <NavTab
                text={t('products.calibrate.fourth.cta')}
                path="https://wiki.airqo.net/#/calibration/ml_based_approach"
                externalLink
                hideArrow
                filled
              />
            </div>
            <div>
              <img
                src={Section3Image}
                style={{
                  objectPosition: '0px',
                  padding: window.innerWidth < 768 ? '0 20px' : '0 100px',
                  objectFit: 'contain',
                  width: '100%',
                  borderRadius: '10px',
                  marginTop: '30px'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default CalibrationPage;
