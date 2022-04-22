import React from 'react';
import { Link } from 'react-router-dom';
import MakText from 'icons/nav/MakText';
import AirQo from 'icons/footer/AirQo';
import Instagram from 'icons/footer/Instagram';
import Facebook from 'icons/footer/Facebook';
import Youtube from 'icons/footer/Youtube';
import Twitter from 'icons/footer/Twitter';
import Location from 'icons/footer/Location';
import ArrowDown from 'icons/footer/ArrowDown';

const Footer = () => (
        <footer className="footer-wrapper">
            <div className="Footer">
            <div className="body-section">
                <div className="logo">
                    <AirQo />
                    <div className="logo-text">Closing the air quality data gap in Africa.</div>
                    <div className="social-links">
                        <Instagram />
                        <Facebook />
                        <Youtube />
                        <Twitter />
                    </div>
                </div>
                <div className="content">
                    <span className="content-tabs">
                        <span>Solutions</span>
                        <div>
                            <span><Link to="/solutions/african-cities/uganda">For African cities</Link></span>
                            <span><Link to="/solutions/communities">For Communities</Link></span>
                            <span><Link to="/solutions/research">For Research</Link></span>
                        </div>
                    </span>
                    <span className="content-tabs middle-tab">
                        <span>Our Works</span>
                        <div>
                            <span>Air Quality Monitors</span>
                            <span>Air Quality Analytics</span>
                            <span>Air Quality Mobile App</span>
                        </div>
                    </span>
                    <span className="content-tabs">
                        <span>About</span>
                        <div>
                            <span><Link to="/about-us">About</Link></span>
                            <span><Link to="/contact">Contact</Link></span>
                            <span><Link to="/press">Press</Link></span>
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
                        {/*<span className="text-terms mr-24">Privacy policy</span>*/}
                        {/*<span className="text-terms mr-24">Sustainability</span>*/}
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
        </footer>
);

export default Footer;
