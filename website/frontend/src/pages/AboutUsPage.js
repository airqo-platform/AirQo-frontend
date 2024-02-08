import React, { useEffect, useState } from 'react';
import { Link } from 'react-scroll';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'underscore';
import { useInitScrollTop } from 'utilities/customHooks';
import { useTeamData } from 'reduxStore/Team/selectors';
import { loadTeamData } from 'reduxStore/Team/operations';
import Profile from 'components/Profile';
import Page from './Page';

import TeamImg from 'assets/img/team.png';
import Vector1 from 'assets/img/about_us_vector_3.png';
import Vector2 from 'assets/img/about-us-vector-2.png';
import SEO from 'utilities/seo';

import { showGetInvolvedModal } from 'reduxStore/GetInvolved/operations';
import { usePartnersData } from '../../reduxStore/Partners/selectors';
import { loadPartnersData } from '../../reduxStore/Partners/operations';
import { useNavigate } from 'react-router-dom';
import { useBoardData } from '../../reduxStore/Board/selectors';
import { loadBoardData } from '../../reduxStore/Board/operations';
import { useTranslation, Trans } from 'react-i18next';

const AboutUsPage = () => {
  useInitScrollTop();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const teamData = useTeamData();
  const allPartnersData = usePartnersData();
  const boardData = useBoardData();
  const navigate = useNavigate();
  const showModal = () => dispatch(showGetInvolvedModal(true));
  const partnersData = allPartnersData.filter((partner) => partner.website_category === 'airqo');

  const [togglePartnersDisplay, setTogglePartnersDisplay] = useState(false);

  const toggleFullPartnersListDisplay = () => {
    setTogglePartnersDisplay(!togglePartnersDisplay);
    document.getElementById('logo-table').scrollIntoView();
  };

  const partnerDataGroup = partnersData
    .map((e, i) => {
      return i % 4 === 0 ? partnersData.slice(i, i + 4) : null;
    })
    .filter((e) => {
      return e;
    });

  const lastGroupArray = partnerDataGroup.length;

  const onLogoClick = (uniqueTitle) => (event) => {
    event.preventDefault();
    navigate(`/partners/${uniqueTitle}/`);
  };

  useEffect(() => {
    if (isEmpty(teamData)) dispatch(loadTeamData());
    if (isEmpty(partnersData)) dispatch(loadPartnersData());
    if (isEmpty(boardData)) dispatch(loadBoardData());
  }, [partnersData, teamData]);
  return (
    <Page>
      <div className="AboutUsPage">
        <SEO
          title="About Us"
          siteTitle="AirQo"
          description="At AirQo we empower communities across Africa with accurate, hyperlocal, and timely air quality data to drive air pollution mitigation actions."
        />
        <div className="AboutUsPage__hero">
          <div className="content">
            <h2>{t('about.aboutUs.header.pageTitle')}</h2>
            <ul className="AboutUsPage__nav">
              <li className="active-link">
                <Link activeClass="active" spy smooth offset={-70} duration={500} to="vision">
                  {t('about.aboutUs.header.subnav.vision')}
                </Link>
              </li>
              <li>
                <Link activeClass="active" spy smooth offset={-70} duration={500} to="story">
                  {t('about.aboutUs.header.subnav.story')}
                </Link>
              </li>
              <li>
                <Link activeClass="active" spy smooth offset={-70} duration={500} to="mission">
                  {t('about.aboutUs.header.subnav.mission')}
                </Link>
              </li>
              <li>
                <Link activeClass="active" spy smooth offset={-70} duration={500} to="values">
                  {t('about.aboutUs.header.subnav.values')}
                </Link>
              </li>
              <li>
                <Link activeClass="active" spy smooth offset={-70} duration={500} to="team">
                  {t('about.aboutUs.header.subnav.team')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="wrapper">
          <h2 className="AboutUsPage__vision">{t('about.aboutUs.vision.text')}</h2>

          <img src={TeamImg} className="team_img" alt="Team Photo" loading="lazy" />

          <div className="AboutUsPage__banner" id="vision">
            <div className="section-title">
              <h3>{t('about.aboutUs.banner.title')}</h3>
              <div>
                <img src={Vector1} className="vector-1" />
                <img src={Vector2} className="vector-2" />
              </div>
            </div>
            <p>{t('about.aboutUs.banner.subText')}</p>
          </div>

          <hr className="separator-1" />

          <div className="AboutUsPage__story" id="story">
            <h3>{t('about.aboutUs.story.title')}</h3>
            <div className="section-info">
              <p>{t('about.aboutUs.story.paragraphs.first')}</p>
              <p>{t('about.aboutUs.story.paragraphs.second')}</p>
              <p>{t('about.aboutUs.story.paragraphs.third')}</p>
              <p>{t('about.aboutUs.story.paragraphs.fourth')}</p>
            </div>
          </div>

          <hr />

          <h2 className="AboutUsPage__mission" id="mission">
            {t('about.aboutUs.mission.text')}
          </h2>

          <hr />

          <div className="AboutUsPage__values" id="values">
            <h3 className="section-title">{t('about.aboutUs.values.title')}</h3>
            <div className="section-info">
              <div className="subsection">
                <h6>{t('about.aboutUs.values.subSection1.title')}</h6>
                <p>{t('about.aboutUs.values.subSection1.subText')}</p>
              </div>
              <div className="subsection">
                <h6>{t('about.aboutUs.values.subSection2.title')}</h6>
                <p>{t('about.aboutUs.values.subSection2.subText')}</p>
              </div>

              <div className="subsection">
                <h6>{t('about.aboutUs.values.subSection3.title')}</h6>
                <p>{t('about.aboutUs.values.subSection3.subText')}</p>
              </div>

              <div className="subsection">
                <h6>{t('about.aboutUs.values.subSection4.title')}</h6>
                <p>{t('about.aboutUs.values.subSection4.subText')}</p>
              </div>
            </div>
          </div>

          <hr />

          <div className="AboutUsPage__team" id="team">
            <div className="header">
              <h3 className="section-title"> {t('about.aboutUs.team.title')}</h3>
              <div>
                <p className="section-info">{t('about.aboutUs.team.subText')}</p>
                <span className="cta-link">
                  <a className="link" href="/careers">
                    {t('about.aboutUs.team.cta')} {'-->'}
                  </a>
                </span>
              </div>
            </div>
            <div className="AboutUsPage__pictorial">
              {teamData.length > 0 ? (
                teamData.map((member) => (
                  <div key={member.id}>
                    <Profile
                      ImgPath={member.picture}
                      name={member.name}
                      title={member.title}
                      twitter={member.twitter}
                      linkedin={member.linked_in}
                      biography={member.descriptions}
                      about={member.about}
                    />
                  </div>
                ))
              ) : (
                <div />
              )}
            </div>
          </div>

          <hr />

          <div className="AboutUsPage__team" id="board">
            <div className="header">
              <h3 className="section-title"> {t('about.aboutUs.board.title')}</h3>
              <div>
                <p className="section-info">{t('about.aboutUs.board.subText')}</p>
              </div>
            </div>
            <div className="AboutUsPage__pictorial">
              {boardData.length > 0 ? (
                boardData.map((member) => (
                  <div key={member.id}>
                    <Profile
                      ImgPath={member.picture}
                      name={member.name}
                      title={member.title}
                      twitter={member.twitter}
                      linkedin={member.linked_in}
                      biography={member.descriptions}
                    />
                  </div>
                ))
              ) : (
                <div />
              )}
            </div>
          </div>

          <hr />

          <div className="AboutUsPage__partners">
            <h3 className="section-title">{t('about.aboutUs.partners.title')}</h3>
            <div>
              <p className="section-info">{t('about.aboutUs.partners.subText')}</p>
              <span className="cta-link">
                <span className="link" onClick={showModal}>
                  {t('about.aboutUs.partners.cta')}
                </span>
              </span>
            </div>
          </div>
          <div className="partner-logos" id="logo-table">
            <table>
              <tbody>
                {partnersData.length > 0 ? (
                  partnerDataGroup.slice(0, 3).map((partnerGroup, key) => (
                    <tr key={key}>
                      {partnerGroup.map((partner) => (
                        <td key={partner.id} onClick={onLogoClick(partner.unique_title)}>
                          <img src={partner.partner_logo} alt={partner.partner_name} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <span />
                )}
                {togglePartnersDisplay && partnerDataGroup.length > 0 ? (
                  partnerDataGroup.slice(3, lastGroupArray).map((partnerGroup, key) => (
                    <tr key={key}>
                      {partnerGroup.map((partner) => (
                        <td key={partner.id} onClick={onLogoClick(partner.unique_title)}>
                          <img src={partner.partner_logo} alt={partner.partner_name} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <div />
                )}
              </tbody>
            </table>
            <button className="partners-toggle-button" onClick={toggleFullPartnersListDisplay}>
              {togglePartnersDisplay
                ? t('about.aboutUs.partners.toggleButtons.showLess')
                : t('about.aboutUs.partners.toggleButtons.showMore')}
            </button>
          </div>
        </div>
      </div>
    </Page>
  );
};

export default AboutUsPage;
