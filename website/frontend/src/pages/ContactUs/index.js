import React from 'react';
import { Link } from 'react-router-dom';
import PageMini from '../PageMini';
import SEO from 'utilities/seo';
import LanguageSwitcher from 'src/components/LanguageSwitcher';
import { useTranslation, Trans } from 'react-i18next';

const ContactUs = ({ children, arrow }) => {
  const { t } = useTranslation();
  return (
    <>
      <LanguageSwitcher />
      <PageMini>
        <SEO
          title="Contact AirQo | Real-Time Air Quality Monitoring Across Africa"
          siteTitle="AirQo Africa"
          description="Get in touch with AirQo, a leading African air quality research initiative. Explore our air quality analytics dashboard and mobile app for real-time and historic air quality data across Africa. Learn more about our satellite data projects and how we are using machine learning to fight pollution."
          canonicalUrls={[
            'https://airqo.africa/contact',
            'https://airqo.net/contact',
            'https://airqo.mak.ac.ug/contact'
          ]}
          keywords="AirQo, air quality, Africa, real-time air monitoring, pollution, machine learning, air quality data, environmental justice, air quality prediction"
          article={false}
        />

        <div className="contact-us">
          <div className="left-section">
            <div className="section-container">
              <div className="content">
                <h2>{t('about.contactUs.leftSection.title')}</h2>
                <span id="_1">
                  <p>{t('about.contactUs.leftSection.subTitle')}</p>
                </span>
                <span id="_2">
                  <p>{t('about.contactUs.leftSection.subText')}</p>
                </span>
                <span id="_3">
                  <p>
                    E:
                    <a href="mailto:info@airqo.net?subject=Mail from AirQo Website">
                      {t('about.contactUs.leftSection.cta')}
                    </a>
                  </p>
                </span>
              </div>
            </div>
          </div>
          <div className="right-section">
            <Link to="/contact" className="icon" title="Back">
              {arrow}
            </Link>
            <div className="section-container">
              <div className="content">{children}</div>
            </div>
          </div>
        </div>
      </PageMini>
    </>
  );
};

export default ContactUs;
