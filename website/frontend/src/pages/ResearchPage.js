import React from "react";
import Page from "./Page";
import ArrowRight from 'icons/research/arrow-right.svg';
import ConsultImg from 'icons/research/consult.png';
import ConsultImg2 from 'icons/research/consult-2.png';
import ConsultLongImg from 'icons/research/consult-long.png';
import BackgroundShape from 'icons/research/background-shape.svg';
import { useInitScrollTop } from "../../utils/customHooks";
import SEO from "utils/seo";

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
                <div className="link"><span>Read full whitepaper <ArrowRight /></span></div>
            </div>
        </div>
    )
}

const ResearchContent = () => {
    return (
        <div className="research-content">
            <p className="content-intro">We aim to advance the understanding of air quality issues in sub-Saharan Africa. We take a multidisciplinary approach that encompasses IoT and sensing technology, AI and machine learning, temporal and spatial modeling to enhance air quality understanding in Africa.</p>
            <div className="research-divider" />
            <div className="consult-container">
                <div className="consult-text">
                    <div>
                        <p>Industrial consultation and collaboration </p>
                        <p>We provide access to our expertise to help in providing historic air quality data, conduct location-specific monitoring and surveys, and understand emissions profiles.</p>
                        <p>These insights can assist organizations to take steps to minimize the impact of air pollution on communities and explore compliance with current and forthcoming legislation.</p>
                    </div>
                </div>
                <div className="consult-images">
                    <img className="img-small" src={ConsultImg} alt="consult image" />
                    <img className="img-long" src={ConsultLongImg} alt="consult long image" />
                    <img className="img-small" src={ConsultImg2} alt="consult image 2" />
                    <BackgroundShape className="background-shape" />
                </div>
            </div>

            <div className="research-whitepapers">
                <p>
                    <span>AirQo has publised close to four whitepapers on air pollution in Africa</span>
                </p>
                <div>
                    <span>04</span>
                    <span>Whitepapers</span>
                </div>
            </div>

            <div className="collaborate-container">
                <div className="consult-text">
                    <div>
                        <p>Collaboration with universities and academic instutions</p>
                        <p>We provide air quality data to facilitate university research. Universities get free access to periodical air quality reports through the AirQo dashboard and the AirQo API.</p>
                        <p>During the deployment of air quality monitoring devices,  we recruit universities and other institutions as AirQo hosts. This ensures that they feel part of the mission right from the collection to the data dissemination.</p>
                    </div>
                </div>
                <div className="consult-images">
                    <img className="img-small" src={ConsultImg} alt="consult image" />
                    <img className="img-long" src={ConsultLongImg} alt="consult long image" />
                    <img className="img-small" src={ConsultImg2} alt="consult image 2" />
                    <BackgroundShape className="background-shape" />
                </div>
            </div>
        </div>
    )
}

const ResearchPage = () => {
    useInitScrollTop();
    return (
        <Page>
            <div className="ResearchPage">
                <SEO
                    title="Our Solutions"
                    siteTitle="Research"
                    description="With the exciting air quality data, we actively collaborate with partners across Africa to jointly tackle air quality research challenges."
                />
                <ResearchHeroSection />
                <ResearchContent />
                <PublicationsSection />
            </div>
        </Page>
    )
}

export default ResearchPage;