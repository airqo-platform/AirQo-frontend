import React from "react";
import Page from "./Page";

const ResearchHeroSection = () => {
    return (
        <div className="research-title">
            <div className="page-nav">Solutions > For Research</div>
            <div className="research-main-text">Research with AirQo</div>
            <div className="research-sub-text">With the exciting air quality data, we actively collaborate with partners across Africa to jointly tackle air quality research challenges.</div>
        </div>
    )
}

const PublicationsSection = () => {
    return (
        <div className="publications-section">
            <div className="title">Publications</div>
            <div className="main-text">We take air quality monitoring seriously hence our collaboration with AirQo</div>
            <div className="author">Author</div>
            <div className="team">AirQo Team</div>
            <div>
                <div className="link"><span>Read full whitepaper <span className="link-arrow">⟵</span></span></div>
            </div>
        </div>
    )
}

const ResearchPage = () => {
    return (
        <Page>
            <div className="ResearchPage">
                <ResearchHeroSection />
                <PublicationsSection />
            </div>
        </Page>
    )
}

export default ResearchPage;