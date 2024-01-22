import React, { useState, useEffect } from 'react';
import { useInitScrollTop } from 'utilities/customHooks';
import { SplitSection, SingleSection, MainHighlight, ButtonCTA } from 'components/CleanAir';
import Section11 from 'assets/img/cleanAir/clean1.jpg';
import Section2 from 'assets/img/cleanAir/mission.jpeg';
import Section4 from 'assets/img/cleanAir/synergy.jpg';
import Section5 from 'assets/img/cleanAir/goals.JPG';
import Placeholder from 'assets/img/cleanAir/placeholder.png';
import Placeholder2 from 'assets/img/cleanAir/placeholder2.png';
import Placeholder3 from 'assets/img/cleanAir/placeholder3.png';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import SEO from 'utilities/seo';
import { useTranslation, Trans } from 'react-i18next';

const CleanAirAbout = () => {
  useInitScrollTop();
  const { t } = useTranslation();

  const [showScroll, setShowScroll] = useState(false);

  const goals = [
    {
      title: t('cleanAirSite.about.section5.subSections.first.title'),
      content: t('cleanAirSite.about.section5.subSections.first.subText'),
      imgURL: Section5
    },
    {
      title: t('cleanAirSite.about.section5.subSections.second.title'),
      content: t('cleanAirSite.about.section5.subSections.second.subText'),
      imgURL: Placeholder3
    },
    {
      title: t('cleanAirSite.about.section5.subSections.third.title'),
      content: t('cleanAirSite.about.section5.subSections.third.subText'),
      imgURL: Placeholder2
    }
  ];

  const checkScrollTop = () => {
    const shouldShowScroll = window.scrollY >= 400;
    if (showScroll !== shouldShowScroll) {
      setShowScroll(shouldShowScroll);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    return () => window.removeEventListener('scroll', checkScrollTop);
  }, [showScroll]);

  const ScrollTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="page-wrapper about-page">
      <SEO
        title="About"
        siteTitle="CLEAN-Air Network"
        description="An African led, multi-region network bringing together a community of practice for air quality solutions and air quality management across Africa."
      />
      {/* section 1 */}
      <div className="Hero">
        <span className="image-container">
          <img src={Section11} />
        </span>
        <div className="hero-content">
          <div>
            <p className="hero-title">
              <Trans i18nKey="cleanAirSite.about.section1.title">
                The CLEAN-Air <br className="breaker" /> Network
              </Trans>
            </p>
            <p className="hero-sub">
              <Trans i18nKey="cleanAirSite.about.section1.subText">
                <span className="fact">An African-led, multi-regional network</span> <br />
                bringing together a community of practice for air quality solutions and air quality
                management across Africa.
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
        <SingleSection
          content={
            <>
              <div className="acronym-content-container">
                <p>
                  <Trans i18nKey="cleanAirSite.about.section2.acronym">
                    <b
                      style={{
                        color: '#135DFF'
                      }}>
                      CLEAN-Air
                    </b>
                    , is an acronym coined from
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
                      <b
                        style={{
                          color: '#135DFF'
                        }}>
                        {' '}
                        Join the network
                      </b>
                    </a>
                  </Trans>
                </p>
              </div>
              <img srcSet={Placeholder} className="acronym-image" />
            </>
          }
          bgColor="#EDF3FF"
        />
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
          imgURL={Section2}
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
            objectFit: 'cover'
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
                  <p style={{ color: '#135DFF' }}>Goals</p>
                </span>
                <h2 className="content-h">CLEAN Air Goals</h2>
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

      {/* scroll top button */}
      {showScroll && (
        <div className="scroll-top" onClick={ScrollTop}>
          <ArrowUpwardIcon
            className="scroll-top-icon"
            sx={{
              width: '40px',
              height: '40px',
              color: '#FFF'
            }}
          />
        </div>
      )}

      {/* section 6 */}
      <div className="page-section">
        <MainHighlight />
      </div>
    </div>
  );
};

export default CleanAirAbout;
