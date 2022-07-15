import React, { useEffect } from 'react';
import { Link } from 'react-scroll';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'underscore';
import { useInitScrollTop } from 'utils/customHooks';
import { useTeamData } from 'reduxStore/Team/selectors';
import { loadTeamData } from 'reduxStore/Team/operations';
import Profile from '../components/Profile';
import Page from './Page';
import WorldBankLogo from 'assets/img/partners/partner-logo-1.png';
import GoogleLogo from 'assets/img/partners/partner-logo-2.png';
import BirminghamUniLogo from 'assets/img/partners/partner-logo-3.png';
import EpsrcLogo from 'assets/img/partners/partner-logo-4.png';
import NRFLogo from 'assets/img/partners/partner-logo-5.png';
import ZindiLogo from 'assets/img/partners/partner-logo-6.png';
import TeamImg from 'assets/img/team.png';
import Vector1 from 'assets/img/about_us_vector_3.png';
import Vector2 from 'assets/img/about-us-vector-2.png';

const teamMembers = [
  { name: 'Prof. Engineer Bainomugisha', title: 'Project Lead', img: ProfileImg1 },
  { name: 'Deo Okure', title: 'Air Quality Scientist & Programme Manager', img: DeoImg },
  { name: 'Martin Bbaale', title: 'Software Engineering Lead', img: MartinImg },
  { name: 'Maclina Birungi, MSc, MCIM', title: 'Marketing And Communications Lead', img: MaclinaImg },
  { name: 'Joel Ssematimba', title: 'Hardware Development & Manufacturing Lead', img: JoelImg },
  { name: 'Dora Bampangana', title: 'Project Administrator', img: DoraImg },
  { name: 'Priscilla Adong', title: 'Data Scientist', img: PriscillaImg },
  { name: 'Joseph Odur', title: 'Software Engineer', img: ProfileImg7 },
  { name: 'Richard Sserunjogi', title: 'Data Scientist', img: RichardImg },
  { name: 'Proscovia Nakiranda', title: 'Data Scientist', img: ProssyImg },
  { name: 'Noah Nsimbe', title: 'Software Engineer', img: ProfileImg10 },
  { name: 'Paul Zana', title: 'UI/UX Designer', img: PaulImg },
  { name: 'Deo Okedi', title: 'Embedded Systems Engineer', img: OkediImg },
  { name: 'Marvin Banda', title: 'Assistant Embedded Systems Engineer', img: MarvinImg },
  { name: 'George Settala', title: 'Embedded Systems and Network Support Engineer', img: GeorgeImg },
  { name: 'Daniel Ogenrwot', title: 'Assistant Software Engineer', img: ProfileImg12 },
  { name: 'Lillian Muyama', title: 'Data Scientist', img: ProfileImg13 },
  { name: 'Pablo A Alvarado Duran', title: 'Research Scientist', img: ProfileImg14 },
  { name: 'Dennis M Reddyhoff', title: 'Researcher', img: ProfileImg15 },
  { name: 'Paterne Gahungu', title: 'Postdoctoral Researcher', img: ProfileImg16 },
  { name: 'Dr. Gabriel Okello', title: 'Visiting Research Fellow', img: ProfileImg17 },
  { name: 'Angela Nshimye', title: 'Policy And Engagement Officer', img: AngelaImg },
  { name: 'Adrine Priscah Warigo', title: 'Digital Communications Executive', img: PriscahImg },
  { name: 'Busigu Faith Daka', title: 'Frontend Engineer', img: FaithImg },
  { name: 'Wabinyai Fidel Raja', title: 'Data Scientist', img: FidelImg },
  { name: 'Belinda Marion Kobusingye', title: 'Frontend Engineer', img: BelindaImg },
  { name: 'Mike Mwanje', title: 'DevOps Engineer', img: MikeImg },
];

const AboutUsPage = () => {
  useInitScrollTop();
  const dispatch = useDispatch();
  const teamData = useTeamData();

  useEffect(() => {
    if (isEmpty(teamData)) dispatch(loadTeamData());
  }, []);

  return (
        <Page>
            <div className="AboutUsPage">
                <div className="AboutUsPage__hero">
                    <div className="content">
                        <h2>About</h2>
                        <ul className="AboutUsPage__nav">
                            <li className="active-link">
                                <Link
                                  activeClass="active"
                                  spy
                                  smooth
                                  offset={-70}
                                  duration={500}
                                  to="vision"
                                >Our vision
                                </Link>
                            </li>
                            <li>
                                <Link
                                  activeClass="active"
                                  spy
                                  smooth
                                  offset={-70}
                                  duration={500}
                                  to="story"
                                >Our story
                                </Link>
                            </li>
                            <li>
                                <Link
                                  activeClass="active"
                                  spy
                                  smooth
                                  offset={-70}
                                  duration={500}
                                  to="mission"
                                >Our mission
                                </Link>
                            </li>
                            <li>
                                <Link
                                  activeClass="active"
                                  spy
                                  smooth
                                  offset={-70}
                                  duration={500}
                                  to="values"
                                >Our values
                                </Link>
                            </li>
                            <li>
                                <Link
                                  activeClass="active"
                                  spy
                                  smooth
                                  offset={-70}
                                  duration={500}
                                  to="team"
                                >Our Team
                                </Link>
                            </li>
                        </ul>
                    </div>
                    {/* <img src={KitengiImg} alt="African Kitengi" /> */}
                </div>

                <div className="wrapper">
                    <h2 className="AboutUsPage__vision">At AirQo we empower communities across Africa with accurate, hyperlocal, and timely air quality data to drive air pollution mitigation actions.</h2>

                    <img src={TeamImg} className="team_img" alt="Team Photo" />

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
                            <p>We are on a mission to empower communities across Africa with information about the quality of the air they breathe.</p>
                            <p>AirQo was founded in 2015 at Makerere University to close the gaps in air quality monitoring across Africa. Our low-cost air quality monitors are designed to suit the African infrastructure, providing locally-led solutions to African air pollution challenges.</p>
                            <p>They provide accurate, hyperlocal, and timely data providing evidence of the magnitude and scale of air pollution across the continent.</p>
                            <p>By empowering citizens with air quality information, we hope to inspire change and action among African citizens to take effective action to reduce air pollution</p>
                        </div>
                    </div>

                    <hr />

                    <h2 className="AboutUsPage__mission" id="mission">Our mission is to efficiently collect, analyse and forecast air quality data to international standards and work with partners to reduce air pollution and raise awareness of its effects in African cities.</h2>

                    <hr />

                    <div className="AboutUsPage__values" id="values">
                        <h3 className="section-title">Our values</h3>
                        <div className="section-info">
                            <div className="subsection">
                                <h6>Citizen Focus</h6>
                                <p>At AirQo we believe that the main beneficiary of clean air are citizens and the positive impact it can have on their health and wellbeing.</p>
                            </div>
                            <div className="subsection">
                                <h6>Precision</h6>
                                <p>We convert low-cost sensor data into a reliable measure of air quality thus making our network and our models as accurate as they can be.</p>
                            </div>

                            <div className="subsection">
                                <h6>Collaboration and Openness</h6>
                                <p>In order to maximize our impact, we collaborate by sharing our data through partnerships.</p>
                            </div>

                            <div className="subsection">
                                <h6>Investment in People</h6>
                                <p>We work in a fast-moving field with continuous improvements in technology. We recruit the best teams and also commit to their ongoing professional development and training.</p>
                            </div>
                        </div>
                    </div>
                    <hr />
                    <div className="AboutUsPage__team" id="team">
                        <div className="AboutUsPage__team_info">
                            <h3 className="section-title">Meet the team</h3>
                            <p className="section-info">This is our team, a lot of smiling happy people who work hard to bridge the gap in air quality in Africa.</p>
                        </div>
                        <div className="AboutUsPage__pictorial">
                            {teamData.map((member) => (
                                <Profile
                                  ImgPath={member.picture}
                                  name={member.name}
                                  title={member.title}
                                />
                            ))}
                        </div>
                    </div>
                    <hr />
                    <div className="AboutUsPage__partners">
                        <h3 className="section-title">Our partners</h3>
                        <p className="section-info">We believe in the power of being stronger together. Together with our partners, we are solving large, complex air quality monitoring challenges across Africa. We are providing much-needed air quality data to Governments and individuals in the continent to facilitate policy changes that combat air pollution.</p>
                    </div>
                    <div className="partner-logos">
                        <table>
                            <tr>
                                <td><img src={WorldBankLogo} alt="World Bank Group" /></td>
                                <td><img src={GoogleLogo} alt="Google.org" /></td>
                                <td><img src={BirminghamUniLogo} alt="University of Birmingham" /></td>
                                <td><img src={EpsrcLogo} alt="EPSRC" /></td>
                            </tr>
                            <tr>
                                <td><img src={NRFLogo} alt="National Research Foundation" /></td>
                                <td><img src={ZindiLogo} alt="Zindi" /></td>
                                <td><img src={NRFLogo} alt="National Research Foundation" /></td>
                                <td><img src={ZindiLogo} alt="Zindi" /></td>
                            </tr>
                            <tr>
                                <td><img src={WorldBankLogo} alt="World Bank Group" /></td>
                                <td><img src={GoogleLogo} alt="Google.org" /></td>
                                <td><img src={BirminghamUniLogo} alt="University of Birmingham" /></td>
                                <td><img src={EpsrcLogo} alt="EPSRC" /></td>
                            </tr>
                            <tr>
                                <td><img src={NRFLogo} alt="National Research Foundation" /></td>
                                <td><img src={ZindiLogo} alt="Zindi" /></td>
                                <td><img src={NRFLogo} alt="National Research Foundation" /></td>
                                <td><img src={ZindiLogo} alt="Zindi" /></td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </Page>
  );
};

export default AboutUsPage;
