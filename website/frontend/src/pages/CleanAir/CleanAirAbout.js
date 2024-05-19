import React from 'react';
import SEO from 'utilities/seo';
import { useInitScrollTop } from 'utilities/customHooks';
import { SplitSection, SingleSection, MainHighlight, ButtonCTA } from 'components/CleanAir';
import Section1 from 'assets/img/cleanAir/section1.webp';
import Section2 from 'assets/img/cleanAir/section2.webp';
import Section3 from 'assets/img/cleanAir/section3.webp';
import Section4 from 'assets/img/cleanAir/section4.webp';
import Placeholder1 from 'assets/img/cleanAir/goal1.webp';
import Placeholder2 from 'assets/img/cleanAir/goal2.webp';
import Placeholder3 from 'assets/img/cleanAir/goal3.webp';
import { useTranslation, Trans } from 'react-i18next';
import CleanAirPageContainer from './Page';

const CleanAirAbout = () => {
  useInitScrollTop();
  const { t } = useTranslation();

  /**
   * @description goals of the CLEAN-Air Network
   * @type {Array} goals
   */
  const goals = [
    {
      title: t('cleanAirSite.about.section5.subSections.first.title'),
      content: t('cleanAirSite.about.section5.subSections.first.subText'),
      imgURL: Placeholder1
    },
    {
      title: t('cleanAirSite.about.section5.subSections.second.title'),
      content: t('cleanAirSite.about.section5.subSections.second.subText'),
      imgURL: Placeholder2
    },
    {
      title: t('cleanAirSite.about.section5.subSections.third.title'),
      content: t('cleanAirSite.about.section5.subSections.third.subText'),
      imgURL: Placeholder3
    }
  ];

  return (
    <CleanAirPageContainer>
      <div className="page-wrapper about-page">
        <SEO
          title="About"
          siteTitle="CLEAN-Air Network"
          description="An African led, multi-region network bringing together a community of practice for air quality solutions and air quality management across Africa."
        />

        {/* section 1 */}
        <div className="Hero">
          <span className="image-container">
            <img src={Section1} />
          </span>
          <div className="hero-content">
            <div>
              <p className="hero-title">
                <Trans i18nKey="cleanAirSite.about.section1.title">
                  The CLEAN-Air <br /> Network
                </Trans>
              </p>
              <p className="hero-sub">
                <Trans i18nKey="cleanAirSite.about.section1.subText">
                  <span className="fact">An African-led, multi-regional network</span> <br />
                  bringing together a community of practice for air quality solutions and air
                  quality management across Africa.
                </Trans>
              </p>
              <ButtonCTA
                label={t('cleanAirSite.about.section1.cta')}
                link="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform"
                style={{
                  width: '200px'
                }}
              />
            </div>
          </div>
        </div>

        {/* section 2 */}
        <div className="page-section">
          <div className="acronym-section-container">
            <div
              className="acronym-section"
              style={{
                backgroundImage: `url(${Section2})`
              }}>
              <div className="content">
                <div className="acronym-content-container">
                  <p>
                    <Trans i18nKey="cleanAirSite.about.section2.acronym">
                      <span className="highlight">CLEAN-Air</span>, is an acronym coined from
                    </Trans>
                  </p>
                  <h2 className="content-h">{t('cleanAirSite.about.section2.title')}</h2>
                  <p>{t('cleanAirSite.about.section2.subText')}</p>
                  <p className="join-now">
                    <Trans i18nKey="cleanAirSite.about.section2.cta">
                      Are you an organization or individual interested in air quality in Africa?
                      <a
                        href="https://docs.google.com/forms/d/e/1FAIpQLScIPz7VrhfO2ifMI0dPWIQRiGQ9y30LoKUCT-DDyorS7sAKUA/viewform"
                        target="_blank"
                        rel="noopener noreferrer">
                        Join the network
                      </a>
                    </Trans>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* section 3 */}
        <div className="page-section">
          <SplitSection
            pillTitle={t('cleanAirSite.about.section3.pillTitle')}
            title={t('cleanAirSite.about.section3.title')}
            content={t('cleanAirSite.about.section3.subText')}
            showButton={false}
            link="#"
            imageStyle={{
              objectFit: 'cover',
              maxHeight: '400px'
            }}
            imgURL={Section3}
            pillBgColor="#ECF2FF"
            pillTextColor="#135DFF"
            reverse={false}
          />
        </div>

        {/* section 4 */}
        <div className="page-section">
          <SplitSection
            pillTitle={t('cleanAirSite.about.section4.pillTitle')}
            title={t('cleanAirSite.about.section4.title')}
            content={t('cleanAirSite.about.section4.subText')}
            imgURL={Section4}
            imageStyle={{
              height: '420px',
              objectFit: 'contain'
            }}
            pillBgColor="#ECF2FF"
            pillTextColor="#135DFF"
            showButton={false}
            reverse={true}
          />
        </div>

        {/* section 5 */}
        <div className="page-section">
          <SingleSection
            content={
              <div className="goals-container">
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start'
                  }}>
                  <span id="first-pill" style={{ backgroundColor: '#FFF' }}>
                    <p style={{ color: '#135DFF' }}>{t('cleanAirSite.about.section5.pillTitle')}</p>
                  </span>
                  <h2 className="content-h">{t('cleanAirSite.about.section5.title')}</h2>
                </div>

                <div className="goals">
                  {goals.map((goal, index) => (
                    <div className={`goal ${index === 0 ? 'first' : ''}`} key={index}>
                      <div className="goal-image-container">
                        <img src={goal.imgURL} className="goal-image" />
                      </div>
                      <div className="goal-content">
                        <h3 className="goal-title">{goal.title}</h3>
                        <p className="goal-p">{goal.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }
            padding="5rem 0"
            bgColor="#EDF3FF"
          />
        </div>

        {/* section 6 */}
        <div className="page-section">
          <MainHighlight />
        </div>
      </div>
    </CleanAirPageContainer>
  );
};

export default CleanAirAbout;
