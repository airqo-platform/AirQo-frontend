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

const ResearchPage = () => {
    return (
        <Page>
            <div className="ResearchPage">
                <ResearchHeroSection />
            </div>
        </Page>
    )
}

export default ResearchPage;