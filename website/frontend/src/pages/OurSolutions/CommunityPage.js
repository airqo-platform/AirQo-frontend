import React from 'react';
import { useInitScrollTop } from 'utilities/customHooks';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import AirQommunities from 'assets/img/community/AirQommunities.png';
import Blob from 'assets/img/community/AirQo_blob_fill.svg';
import AssetImg1 from 'assets/img/community/Rectangle 411.jpg';
import AssetImg2 from 'assets/img/community/Rectangle 405.jpg';
import AssetImg3 from 'assets/img/community/Rectangle 410.jpg';
import AssetImg6 from 'assets/img/community/Rectangle 408.png';
import TrainingImg1 from 'assets/img/community/AirQo_Web_IMG01.jpg';
import TrainingImg2 from 'assets/img/community/AirQo_Web_IMG10.jpg';
import CommunityStar from 'assets/img/community/Communities Star.svg';
import AirQoArrowLeft from 'assets/img/community/AirQo_arrow_left.svg';
import AirQoQuotes from 'assets/img/community/AirQo_quotes.png';
import Page from '../Page';
import { useDispatch } from 'react-redux';
import { showGetInvolvedModal } from 'reduxStore/GetInvolved/operations';
import SEO from 'utilities/seo';
import { useTranslation, Trans } from 'react-i18next';

const CommunityPage = () => {
  useInitScrollTop();
  const dispatch = useDispatch();
  const showModal = () => dispatch(showGetInvolvedModal(true));
  const { t } = useTranslation();
  return (
    <Page>
      <div className="CommunityPage">
        <SEO
          title="Our Solutions"
          siteTitle="For Communities"
          description="AirQo harnesses the value that comes with bringing together community members passionate about
                            clean air and a healthy environment"
        />
        <div className="page-container">
          <div className="hero">
            <div className="header-1">
              <h6>{t('solutions.communities.header.breadCrumb')}</h6>
              <ArrowForwardIosIcon className="arrow-forward" />
              <h6>{t('solutions.communities.header.nextCrumb')}</h6>
            </div>
            <h1 className="header-2">{t('solutions.communities.header.title')}</h1>
            <h3 className="header-3">{t('solutions.communities.header.subText')}</h3>
          </div>

          <div className="community_wrapper">
            <div className="blob">
              <img src={AirQommunities} className="blob-img" />
            </div>
            <div className="section-1">
              <div className="layer-1">
                <div className="text">
                  <div className="row">
                    <div className="img-star">
                      <CommunityStar />
                    </div>

                    <h1>{t('solutions.communities.section1.title')}</h1>
                  </div>

                  <p>{t('solutions.communities.section1.paragraph1')}</p>
                  <p>{t('solutions.communities.section1.paragraph2')}</p>
                </div>
                <div className="img-stack">
                  <div className="stack-1">
                    <img src={AssetImg1} alt="Image Stock 1" />
                    <img src={AssetImg2} alt="Image Stock 2" />
                  </div>
                  <img src={AssetImg3} className="stack-2" alt="Image Stock 3" />
                  <div className="layer-2">
                    <Blob className="blob" style={{ height: '360px' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="strip">
              <div className="left-strip">
                <span>
                  <h3>{t('solutions.communities.strip.leftStrip.number')}</h3>
                  <AirQoArrowLeft className="left-strip-arrow" />
                </span>
                <h3>{t('solutions.communities.strip.leftStrip.title')}</h3>
              </div>
              <div className="right-strip">
                <h3>
                  {t('solutions.communities.strip.rightStrip.paragraph')}
                  <a
                    href="https://blog.airqo.net/helping-communities-combat-air-pollution-through-digital-technologies-6a5924a1e1e"
                    target="_blank">
                    <u>{t('solutions.communities.strip.rightStrip.cta')}</u>
                  </a>
                </h3>
              </div>
            </div>

            <div className="section-1">
              <div className="layer-1">
                <div className="text">
                  <h1>{t('solutions.communities.section2.title')}</h1>
                  <p>{t('solutions.communities.section2.paragraphs1')}</p>
                  <p>{t('solutions.communities.section2.paragraphs2')}</p>
                </div>
                <div className="img-stack">
                  <div className="stack-1">
                    <img src={TrainingImg1} alt="Image Stock 1" />
                    <img src={TrainingImg2} alt="Image Stock 2" />
                  </div>
                  <img src={AssetImg6} className="stack-2" alt="Image Stock 3" />
                  <div className="layer-2">
                    <Blob className="blob" style={{ height: '360px' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="lower-banner">
              <img src={AirQoQuotes} />
              <h2>{t('solutions.communities.lowerBanner.text')}</h2>
              <h3>{t('solutions.communities.lowerBanner.author')}</h3>
              <h6>{t('solutions.communities.lowerBanner.role')}</h6>
            </div>

            <section className="bottom-hero-section">
              <h3>{t('solutions.communities.bottomBtn.title')}</h3>
              <a href="#" onClick={showModal} className="section-link">
                <span>
                  {t('solutions.communities.bottomBtn.cta')} {'-->'}
                </span>
              </a>
            </section>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default CommunityPage;
