import React from 'react';
import Header from '../../components/OurProducts/Header';
import HeaderImage from '../../assets/img/OurProducts/Monitor/monitor.png';
import Page from '../Page';
import Section1Image from '../../assets/img/OurProducts/Monitor/section-1.png';
import Section2Image from '../../assets/img/OurProducts/Monitor/section-2.png';
import Section3Image from '../../assets/img/OurProducts/Monitor/Africa.png';
import Section4Image from '../../assets/img/OurProducts/Monitor/activate.png';
import UserGuide from '../../assets/docs/AirQoMonitorUserGuideV04.pdf';
import MaintenanceManual from '../../assets/docs/Binos-Maintenance-Manual.pdf';
import { FileDownloadOutlined } from '@mui/icons-material';
import { useInitScrollTop } from 'utilities/customHooks';
import { useTranslation, Trans } from 'react-i18next';

const MonitorPage = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  return (
    <Page>
      <div className="product-page monitor">
        <Header
          pageTitle={t('products.monitor.header.pageTitle')}
          title={t('products.monitor.header.title')}
          subText={t('products.monitor.header.subText')}>
          <img src={HeaderImage} alt="" />
        </Header>
        <div className="content">
          <div className="grid-wrapper column section">
            <div className="row">
              <h2 className="left title">
                <Trans i18nKey="products.monitor.first.title">
                  <span className="blue">Locally built</span> low cost monitors
                </Trans>
              </h2>
              <p className="right">
                <Trans i18nKey="products.monitor.first.subText">
                  The Binos Monitor is a low-cost air quality device configured to measure
                  particulate matter PM<sub>2.5</sub> and PM<sub>10</sub>, the most common
                  pollutants in African cities. It also measures ambient meteorological conditions
                  such as humidity and atmospheric pressure.
                </Trans>
              </p>
            </div>
            <div className="overlap-section">
              <div className="lapping-left card" style={{ backgroundColor: '#ebfff5' }}>
                <h5>{t('products.monitor.second.title')}</h5>
                <p>
                  <Trans i18nKey="products.monitor.second.subText">
                    The monitors are optimised with capabilities to cope with challenges like
                    extreme weather conditions including high levels of dust and heat typical to the
                    context of African cities. <br />
                    <br />
                    Powered by either mains or solar, the device is optimised to work in settings
                    characterised by unreliable power and intermittent internet connectivity. It
                    runs on a 2G GSM network configuration for IoT sim cards.
                    <br />
                  </Trans>
                  <a
                    href={MaintenanceManual}
                    target="_blank"
                    download={'BinosMaintenanceManual.pdf'}
                    rel="noreferrer noopener">
                    <button className="download-button">
                      {t('products.monitor.second.cta')} <FileDownloadOutlined />
                    </button>
                  </a>
                </p>
              </div>
              <div className="lapping-left image" id="section-1">
                <img src={Section1Image} alt="" />
              </div>
            </div>
          </div>
          <div className="grid-wrapper section">
            <div className="overlap-section">
              <div className="lapping-right card larger-top" style={{ backgroundColor: '#ebfff5' }}>
                <h5>{t('products.monitor.third.title')}</h5>
                <p>
                  <Trans i18nKey="products.monitor.third.subText">
                    The monitors are easy to install and can be placed on static buildings or
                    motor-cycle taxis locally called 'boda-bodas' to improve spatial coverage and
                    revolution. <br /> <br />
                    Air quality data collection using motorcycle taxis has real potential for
                    high-resolution air quality monitoring in urban spaces. Mobile monitoring
                    enables us to close the gaps and spatial limitations of fixed static monitoring.
                  </Trans>
                </p>
              </div>
              <div className="lapping-right image" id="section-2">
                <img src={Section2Image} alt="" />
              </div>
            </div>
          </div>
          <div className="grid-wrapper section">
            <div className="overlap-section">
              <div className="lapping-right card" style={{ backgroundColor: '#ebfff5' }}>
                <h5>{t('products.monitor.fourth.title')}</h5>
                <p>
                  <Trans i18nKey="products.monitor.fourth.subText">
                    To effectively tackle air pollution, access to data and contextual evidence is
                    important to show the scale and magnitude of air pollution. <br />
                    <br />
                    We’re providing an end-end air quality solution in major African Cities
                    leveraging the locally built low-cost monitors and existing expertise to advance
                    air quality management and, implicitly, air quality improvement in these African
                    cities.
                  </Trans>
                </p>
              </div>
              <div className="lapping-right image africa">
                <img src={Section3Image} alt="" />
              </div>
            </div>
          </div>
          <div className="grid-wrapper column section">
            <div className="row">
              <h2 className="left title">
                <Trans i18nKey="products.monitor.fifth.title">
                  <span className="blue">Monitor</span> Installation
                </Trans>
              </h2>
              <p className="right">{t('products.monitor.fifth.subText')}</p>
            </div>
            <div className="overlap-section">
              <div className="lapping-left card larger-top" style={{ backgroundColor: '#FFFCE1' }}>
                <h5>{t('products.monitor.sixth.title')}</h5>
                <p>
                  <Trans i18nKey="products.monitor.sixth.subText">
                    In this guide, you will find recommendations on:
                    <br />+ Where to place the monitor
                    <br /> + How to install the monitor <br /> + How to access the data using our
                    analytics dashboard
                  </Trans>
                </p>
                <a
                  href={UserGuide}
                  target="_blank"
                  download={'BinosMonitorUserGuideV0.04.pdf'}
                  rel="noreferrer noopener">
                  <button className="download-button">
                    {t('products.monitor.sixth.cta')} <FileDownloadOutlined />
                  </button>
                </a>
              </div>
              <div className="lapping-left image" id="section-3">
                <img src={Section4Image} alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default MonitorPage;
