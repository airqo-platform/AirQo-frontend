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
                    <div className="logo-text">Clean air for<br /> all African cities.</div>
                    <div className="social-links">
                        <Instagram />
                        <Facebook />
                        <Youtube />
                        <Twitter />
                    </div>
                </div>
                <div className="content">
                    <section>
                        <span>Our Works</span>
                        <div>
                            <span>Air Quality Monitors</span>
                            <span>Air Quality Analytics</span>
                            <span>Air Quality Mobile App</span>
                            <span>Air Quality Map</span>
                            <span>Air Quality API</span>
                        </div>
                    </section>
                    <section>
                        <span>Company</span>
                        <div>
                            <span>About</span>
                            <span>Contact</span>
                            <span>Careers</span>
                            <span>Press</span>
                            <span>Media Kit</span>
                        </div>
                    </section>
                    <section>
                        <span>Resources</span>
                        <div>
                            <span>Help Center</span>
                            <span>Developer</span>
                            <span>Partners</span>
                            <span>Blog</span>
                            <span>FAQ</span>
                        </div>
                    </section>
                </div>
            </div>
            <div className="copyright-section">
                <div className="copyright-container">
                    <div className="text copyright-text">© {new Date().getFullYear()} AirQo</div>
                    <div className="terms-section">
                        <span className="text mr-24">Terms of service</span>
                        <span className="text mr-24">Privacy policy</span>
                        <span className="text mr-24">Sustainability</span>
                    </div>
                </div>
                <div className="project-container mb-24">
                    <div className="project">
                        <div className="project-text">A project by</div>
                        <MakText />
                    </div>
                </div>
            </div>
        </footer>
);

export default Footer;
