import React from 'react';
import { Link } from 'react-router-dom';
import { Modal, Box } from '@mui/material';
import MakText from 'icons/nav/MakText';
import AirQo from 'icons/footer/AirQo';
import Instagram from 'icons/footer/Instagram';
import Facebook from 'icons/footer/Facebook';
import Youtube from 'icons/footer/Youtube';
import Twitter from 'icons/footer/Twitter';
import Location from 'icons/footer/Location';
import ArrowDown from 'icons/footer/ArrowDown';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import CancelIcon from 'icons/footer/cancel.svg';

import Uganda from 'icons/africanCities/countries/uganda.svg';
import Kenya from 'icons/africanCities/countries/kenya.svg';
import Nigeria from 'icons/africanCities/countries/nigeria.svg';
import Ghana from 'icons/africanCities/countries/ghana.svg';
import Burundi from 'icons/africanCities/countries/burundi.svg';
import Senegal from 'icons/africanCities/countries/senegal.svg';
import Mozambique from 'icons/africanCities/countries/mozambique.svg';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: 600,
  // minHeight: 200,
  width: '100%',
  bgcolor: 'background.paper',
  // border: '2px solid #000',
  // boxShadow: 24,
  // p: 4,
};

const CountryTab = ({ className, flag, name }) => (
        <div className={className}>{flag} <span>{name}</span></div>
);

const Footer = () => (
        <footer className="footer-wrapper">
            <div className="Footer">
            <div className="body-section">
                <div className="logo">
                    <AirQo />
                    <div className="logo-text">Clean air for all <br/> African Cities!</div>
                    <div className="social-links">
                        <a target="_blank" href="https://www.linkedin.com/company/airqo/mycompany/"><LinkedInIcon style={{color:"#145DFF", height: "32px", width: "32px"}} /></a>
                        <a target="_blank" href="https://www.facebook.com/AirQo"><Facebook /></a>
                        <a target="_blank" href="https://www.youtube.com/channel/UCx7YtV55TcqKGeKsDdT5_XQ"><Youtube /></a>
                        <a target="_blank" href="https://twitter.com/AirQoProject"><Twitter /></a>
                    </div>
                </div>
                <div className="content">
                    <span className="content-tabs middle-tab">
                        <span>Solutions</span>
                        <div>
                            <span><Link to="/solutions/african-cities/uganda">For African cities</Link></span>
                            <span><Link to="/solutions/communities">For Communities</Link></span>
                            <span><Link to="/solutions/research">For Research</Link></span>
                        </div>
                    </span>
                    {/* <span className="content-tabs middle-tab"> */}
                    {/*    <span>Our Works</span> */}
                    {/*    <div> */}
                    {/*        <span>Air Quality Monitors</span> */}
                    {/*        <span>Air Quality Analytics</span> */}
                    {/*        <span>Air Quality Mobile App</span> */}
                    {/*    </div> */}
                    {/* </span> */}
                    <span className="content-tabs">
                        <span>About</span>
                        <div>
                            <span><Link to="/about-us">About</Link></span>
                            <span><Link to="/contact">Contact</Link></span>
                            <span><Link to="/press">Press</Link></span>
                            <span><a target="_blank" href="https://medium.com/@airqo">Blog</a></span>
                        </div>
                    </span>
                </div>
                <div className="airqlouds-summary">
                    <div className="airqloud-dropdown">
                        <Location />
                        <span>Uganda</span>
                        <ArrowDown />
                    </div>
                    <div className="airqloud-count">
                        <span className="count-value">
                            <span>0</span>
                            <span>1</span>
                            <span>1</span>
                            <span>3</span>
                        </span> {' '}
                        <span className="count-text">Monitors in Uganda</span>
                    </div>
                </div>
            </div>
            <div className="copyright-section">
                <div className="copyright-container">
                    <div className="text-copyright">© {new Date().getFullYear()} AirQo</div>
                    <div className="terms-section">
                        <span className="text-terms mr-24"><Link to="/terms">Terms of service</Link></span>
                        {/* <span className="text-terms mr-24">Privacy policy</span> */}
                        {/* <span className="text-terms mr-24">Sustainability</span> */}
                    </div>
                </div>
                <div className="project-container mb-24">
                    <div className="project">
                        <div className="project-text">A project by</div>
                        <MakText />
                    </div>
                </div>
            </div>
            </div>
            <Modal open>
                <Box sx={style}>
                <div className="modal">
                    <div className="modal-title"><span>Country AirQloud</span> <CancelIcon /></div>
                    <div className="divider" />
                    <div className="title">Our growing network in Africa</div>
                    <div className="sub-title">View AirQo developments in your country</div>
                    <div className="category-label">Selected country</div>
                    <CountryTab className="tab tab-selected tab-margin" flag={<Uganda />} name={"Uganda"} />
                    <div className="category-label">Select country</div>
                    <div className="countries">
                        <CountryTab className="tab tab-selected tab-margin-sm" flag={<Uganda />} name={"Uganda"} />
                        <CountryTab className="tab tab-margin-sm" flag={<Kenya />} name={"Kenya"} />
                        <CountryTab className="tab tab-margin-sm" flag={<Nigeria />} name={"Nigeria"} />
                        <CountryTab className="tab tab-margin-sm" flag={<Ghana />} name={"Ghana"} />
                        <CountryTab className="tab tab-margin-sm" flag={<Burundi />} name={"Burundi"} />
                        <CountryTab className="tab tab-margin-sm" flag={<Senegal />} name={"Senegal"} />
                        <CountryTab className="tab tab-margin-sm tab-mb" flag={<Mozambique />} name={"Mozambique"} />
                    </div>
                    <div className="divider" />
                    <div className="btns">
                        <div className="cancel-btn">cancel</div>
                        <div className="save-btn">save</div>
                    </div>
                </div>
                </Box>
            </Modal>
        </footer>
);

export default Footer;
