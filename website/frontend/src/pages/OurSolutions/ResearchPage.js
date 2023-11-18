import React from 'react';
import Page from '../Page';
import ArrowRight from 'icons/research/arrow-right.svg';
import ConsultImg2 from 'icons/research/consult-2.png';
import ConsultLongImg from 'icons/research/consult-long.png';
import UniversityImg1 from 'assets/img/community/community-9.JPG';
import UniversityImg2 from 'assets/img/community/AirQo_Web_IMG13.jpg';
import UniversityImg3 from 'assets/img/community/AirQo_Web_IMG02.jpg';
import ResearchImg1 from 'assets/img/community/AirQo_Web_IMG06.jpg';
import BackgroundShape from 'icons/research/background-shape.svg';
import { useInitScrollTop } from 'utilities/customHooks';
import { Link } from 'react-router-dom';
import SEO from 'utilities/seo';
import { useTranslation, Trans } from 'react-i18next';

const ResearchHeroSection = () => {
  const { t } = useTranslation();
  return (
    <div className="research-title">
      <div className="page-nav">{t('solutions.research.header.breadCrumb')}</div>
      <div className="research-main-text">{t('solutions.research.header.title')}</div>
      <div className="research-sub-text">{t('solutions.research.header.subText')}</div>
    </div>
  );
};

const PublicationsSection = () => {
  const { t } = useTranslation();
  return (
    <div className="publications-section">
      <div className="title">{t('solutions.research.publications.title')}</div>
      <div>
        <div className="main-text">{t('solutions.research.publications.mainText')}</div>
        <div className="author">{t('solutions.research.publications.author1')}</div>
        <div className="team">{t('solutions.research.publications.team1')}</div>
        <div className="author">{t('solutions.research.publications.author2')}</div>
        <div className="team">{t('solutions.research.publications.team2')}</div>
        <div>
          <div className="link">
            <a
              href="https://www.nema.go.ug/projects/national-state-environment-report-2018-2019"
              target="_blank"
              download
              rel="noopener noreferrer">
              <span>
                {t('solutions.research.publications.cta')} <ArrowRight />
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

const ResearchContent = () => {
  const { t } = useTranslation();
  return (
    <div className="research-content">
      <p className="content-intro">{t('solutions.research.consult.first.Intro')}</p>
      <div className="research-divider" />
      <div className="consult-container">
        <div className="consult-text">
          <div>
            <Trans i18nKey="solutions.research.consult.second.text">
              <p>Industrial consultation and collaboration </p>
              <p>
                We provide access to our expertise to help in providing historic air quality data,
                conduct location-specific monitoring and surveys, and understand emissions profiles.
              </p>
              <p>
                These insights can assist organizations to take steps to minimize the impact of air
                pollution on communities and explore compliance with current and forthcoming
                legislation.
              </p>
            </Trans>
          </div>
        </div>
        <div className="consult-images">
          <img className="img-small" src={ResearchImg1} alt="consult image" />
          <img className="img-long" src={ConsultLongImg} alt="consult long image" />
          <img className="img-small" src={ConsultImg2} alt="consult image 2" />
          <BackgroundShape className="background-shape" />
        </div>
      </div>
      <div className="research-divider" />
      <div className="collaborate-container">
        <div className="consult-text">
          <div>
            <Trans i18nKey="solutions.research.consult.third.text">
              <p>Collaboration with universities and academic institutions</p>
              <p>
                We provide air quality data to facilitate university research. Universities get free
                access to periodical air quality reports through the AirQo dashboard and the AirQo
                API.
              </p>
            </Trans>
          </div>
        </div>
        <div className="consult-images">
          <img className="img-small" src={UniversityImg2} alt="consult image" />
          <img className="img-long" src={UniversityImg1} alt="consult long image" />
          <img className="img-small" src={UniversityImg3} alt="consult image 2" />
          <BackgroundShape className="background-shape" />
        </div>
      </div>
    </div>
  );
};

const ResearchPage = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  return (
    <Page>
      <div className="ResearchPage">
        <SEO
          title="Our Solutions"
          siteTitle="For Research"
          description="AirQo actively collaborates with researchers across the world to jointly tackle air quality research challenges."
        />
        <ResearchHeroSection />
        <ResearchContent />
        <PublicationsSection />

        <section className="bottom-hero-section">
          <h3>{t('solutions.research.bottomBtn.title')}</h3>
          <Link to="/explore-data" className="section-link">
            <span>
              {t('solutions.research.bottomBtn.cta')} {'-->'}
            </span>
          </Link>
        </section>
      </div>
    </Page>
  );
};

export default ResearchPage;
