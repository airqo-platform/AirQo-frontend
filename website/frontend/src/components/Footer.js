import React from 'react';
import MakText from "../icons/nav/MakText";

const Footer = () => {
    return (
        <footer className="Footer">
            <div className="body-section">

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
    )
}

export default Footer;
