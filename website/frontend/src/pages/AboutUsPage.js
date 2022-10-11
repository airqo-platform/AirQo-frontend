import React, { useEffect, useState } from 'react';
import { Link } from 'react-scroll';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'underscore';
import { useInitScrollTop } from 'utils/customHooks';
import { useTeamData } from 'reduxStore/Team/selectors';
import { loadTeamData } from 'reduxStore/Team/operations';
import Profile from 'components/Profile';
import Page from './Page';

import TeamImg from 'assets/img/team.png';
import Vector1 from 'assets/img/about_us_vector_3.png';
import Vector2 from 'assets/img/about-us-vector-2.png';
import SEO from 'utils/seo';

import { showGetInvolvedModal } from 'reduxStore/GetInvolved/operations';
import { usePartnersData } from '../../reduxStore/Partners/selectors';
import { loadPartnersData } from '../../reduxStore/Partners/operations';
import { useNavigate } from 'react-router-dom';

const AboutUsPage = () => {
    useInitScrollTop();
    const dispatch = useDispatch();
    const teamData = useTeamData();
    const partnersData = usePartnersData();
    const navigate = useNavigate();
    const showModal = () => dispatch(showGetInvolvedModal(true));

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
    }, []);
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
                        <h2>About</h2>
                        <ul className="AboutUsPage__nav">
                            <li className="active-link">
                                <Link activeClass="active" spy smooth offset={-70} duration={500} to="vision">
                                    Our vision
                                </Link>
                            </li>
                            <li>
                                <Link activeClass="active" spy smooth offset={-70} duration={500} to="story">
                                    Our story
                                </Link>
                            </li>
                            <li>
                                <Link activeClass="active" spy smooth offset={-70} duration={500} to="mission">
                                    Our mission
                                </Link>
                            </li>
                            <li>
                                <Link activeClass="active" spy smooth offset={-70} duration={500} to="values">
                                    Our values
                                </Link>
                            </li>
                            <li>
                                <Link activeClass="active" spy smooth offset={-70} duration={500} to="team">
                                    Our Team
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="wrapper">
                    <h2 className="AboutUsPage__vision">
                        At AirQo we empower communities across Africa with accurate, hyperlocal, and timely air quality
                        data to drive air pollution mitigation actions.
                    </h2>

                    <img src={TeamImg} className="team_img" alt="Team Photo" loading="lazy" />

                    <div className="AboutUsPage__banner" id="vision">
                        <div className="section-title">
                            <h3>Our vision</h3>
                            <div>
                                <img src={Vector1} className="vector-1" />
                                <img src={Vector2} className="vector-2" />
                            </div>
                        </div>
                        <p>Clean air for all African cities.</p>
                    </div>

                    <hr className="separator-1" />

                    <div className="AboutUsPage__story" id="story">
                        <h3>Our story</h3>
                        <div className="section-info">
                            <p>
                                We are on a mission to empower communities across Africa with information about the
                                quality of the air they breathe.
                            </p>
                            <p>
                                AirQo was founded in 2015 at Makerere University to close the gaps in air quality
                                monitoring across Africa. Our low-cost air quality monitors are designed to suit the
                                African infrastructure, providing locally-led solutions to African air pollution
                                challenges.
                            </p>
                            <p>
                                They provide accurate, hyperlocal, and timely data providing evidence of the magnitude
                                and scale of air pollution across the continent.
                            </p>
                            <p>
                                By empowering citizens with air quality information, we hope to inspire change and
                                action among African citizens to take effective action to reduce air pollution
                            </p>
                        </div>
                    </div>

                    <hr />

                    <h2 className="AboutUsPage__mission" id="mission">
                        Our mission is to efficiently collect, analyse and forecast air quality data to international
                        standards and work with partners to reduce air pollution and raise awareness of its effects in
                        African cities.
                    </h2>

                    <hr />

                    <div className="AboutUsPage__values" id="values">
                        <h3 className="section-title">Our values</h3>
                        <div className="section-info">
                            <div className="subsection">
                                <h6>Citizen Focus</h6>
                                <p>
                                    At AirQo we believe that the main beneficiary of clean air are citizens and the
                                    positive impact it can have on their health and wellbeing.
                                </p>
                            </div>
                            <div className="subsection">
                                <h6>Precision</h6>
                                <p>
                                    We convert low-cost sensor data into a reliable measure of air quality thus making
                                    our network and our models as accurate as they can be.
                                </p>
                            </div>

                            <div className="subsection">
                                <h6>Collaboration and Openness</h6>
                                <p>
                                    In order to maximize our impact, we collaborate by sharing our data through
                                    partnerships.
                                </p>
                            </div>

                            <div className="subsection">
                                <h6>Investment in People</h6>
                                <p>
                                    We work in a fast-moving field with continuous improvements in technology. We
                                    recruit the best teams and also commit to their ongoing professional development and
                                    training.
                                </p>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="AboutUsPage__team" id="team">
                        <h3 className="section-title">Meet the team</h3>
                        <div>
                            <p className="section-info">
                                This is our team, a community of spirited individuals who work hard to bridge the gap in
                                air quality monitoring in Africa.
                            </p>
                            <span className="cta-link">
                                <a className="link" href="/careers">
                                    Join the Team {'-->'}
                                </a>
                            </span>
                        </div>
                        <div className="AboutUsPage__pictorial">
                            {teamData.map((member) => (
                                <Profile
                                    ImgPath={member.picture}
                                    name={member.name}
                                    title={member.title}
                                    twitter={member.twitter}
                                    linkedin={member.linked_in}
                                />
                            ))}
                        </div>
                    </div>
                    <hr />
                    <div className="AboutUsPage__partners">
                        <h3 className="section-title">Our partners</h3>
                        <div>
                            <p className="section-info">
                                Together with our partners, we are solving large, complex air quality monitoring
                                challenges across Africa. We are providing much-needed air quality data to Governments
                                and individuals in the continent to facilitate policy changes that combat air pollution.
                            </p>
                            <span className="cta-link">
                                <span className="link" onClick={showModal}>
                                    Partner with Us
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
                                {togglePartnersDisplay &&
                                    partnerDataGroup.slice(3, lastGroupArray).map((partnerGroup, key) => (
                                        <tr key={key}>
                                            {partnerGroup.map((partner) => (
                                                <td key={partner.id}>
                                                    <img
                                                        src={partner.partner_logo}
                                                        alt={partner.partner_name}
                                                        onClick={onLogoClick(partner.unique_title)}
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                        <button className="partners-toggle-button" onClick={toggleFullPartnersListDisplay}>
                            {togglePartnersDisplay ? 'See less' : 'See more'}
                        </button>
                    </div>
                </div>
            </div>
        </Page>
    );
};

export default AboutUsPage;
