import React from 'react';
import { Link } from 'react-router-dom';
import PageMini from '../PageMini';
import SEO from 'utilities/seo';
import { useTranslation, Trans } from 'react-i18next';

const ContactUs = ({ children, arrow }) => {
  const { t } = useTranslation();
  return (
    <PageMini>
      <SEO
        title="Contact Us"
        siteTitle="AirQo"
        description="Access real-time and historic air quality information across Africa through our easy-to-use air quality analytics dashboard or mobile app. Get in touch"
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
  );
};

export default ContactUs;
