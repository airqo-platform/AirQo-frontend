import React from 'react';
import MakText from 'icons/nav/MakText';
import AirQo from 'icons/footer/AirQo';
import Instagram from 'icons/footer/Instagram';
import Facebook from 'icons/footer/Facebook';
import Youtube from 'icons/footer/Youtube';
import Twitter from 'icons/footer/Twitter';

const Footer = () => (
        <footer className="Footer">
            <div className="body-section">
                <div className="logo">
                    <AirQo />
                    <div className="social-links">
                        <Instagram />
                        <Facebook />
                        <Youtube />
                        <Twitter />
                    </div>
                </div>
                <div className="content">
                    <div className="section">
                        <div>Products</div>
                        <div>AirQo Monitors</div>
                        <div>AirQo Analytics</div>
                        <div>AirQo App</div>
                        <div>AirQo API</div>
                        <div>Research</div>
                    </div>
                    <div className="section">
                        <div>Company</div>
                        <div>About us</div>
                        <div>Contact us</div>
                        <div>Careers</div>
                        <div>Sustainability</div>
                        <div>COVID19</div>
                    </div>
                    <div className="section">
                        <div>Resources</div>
                        <div>Help Center</div>
                        <div>Developer</div>
                        <div>Partners</div>
                        <div>Press</div>
                        <div>Access to Data</div>
                    </div>
                </div>
            </div>
            <div className="copyright-section">
                <div className="copyright-container">
                    <div className="text copyright-text">Copyright © 2021 AirQo</div>
                    <div className="text terms">Terms</div>
                    <div className="text privacy">Privacy</div>
                </div>
                <div className="project-container">
                    <div className="project">
                        <div className="project-text">A project by</div>
                        <MakText />
                    </div>
                </div>
            </div>
        </footer>
);

export default Footer;
