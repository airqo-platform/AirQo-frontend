import React from "react";
import Page from "../Page";
import ArrowRight from 'icons/research/arrow-right.svg';
import ConsultImg2 from 'icons/research/consult-2.png';
import ConsultLongImg from 'icons/research/consult-long.png';
import UniversityImg1 from 'assets/img/community/community-9.JPG';
import UniversityImg2 from 'assets/img/community/AirQo_Web_IMG13.jpg';
import UniversityImg3 from 'assets/img/community/AirQo_Web_IMG02.jpg';
import ResearchImg1 from 'assets/img/community/AirQo_Web_IMG06.jpg';
import BackgroundShape from 'icons/research/background-shape.svg';
import { useInitScrollTop } from "utils/customHooks";
import { Link } from "react-router-dom";
import SEO from 'utils/seo';

const ResearchHeroSection = () => {
    return (
        <div className="research-title">
            <div className="page-nav">Solutions {'>'} For Research</div>
            <div className="research-main-text">For Research</div>
            <div className="research-sub-text">We actively collaborate with researchers across the world to jointly tackle air quality research challenges.</div>
        </div>
    )
}

const PublicationsSection = () => {
    return (
        <div className="publications-section">
            <div className="title">Publications</div>
            <div className="main-text">Managing the Environment for Climate Resilient Livelihoods and Sustainable Economic Development.</div>
            <div className="author">Created by</div>
            <div className="team">National Environment Management Authority(NEMA)</div>
            <hr/>
            <div className="author">Supported by</div>
            <div className="team">AirQo and Makerere University</div>
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
                    <img className="img-small" src={ResearchImg1} alt="consult image" />
                    <img className="img-long" src={ConsultLongImg} alt="consult long image" />
                    <img className="img-small" src={ConsultImg2} alt="consult image 2" />
                    <BackgroundShape className="background-shape" />
                </div>
            </div>
            <div className="research-divider" />
            <div className="collaborate-container">
                <div className="consult-text">
                    <div>
                        <p>Collaboration with universities and academic institutions</p>
                        <p>We provide air quality data to facilitate university research. Universities get free access to periodical air quality reports through the AirQo dashboard and the AirQo API.</p>
                    </div>
                </div>
                <div className="consult-images">
                    <img className="img-small" src={UniversityImg2} alt="consult image" />
                    <img className="img-long" src={UniversityImg1} alt="consult long image" />
                    <img className="img-small" src={UniversityImg3} alt="consult image 2" />
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
                
                <section className="bottom-hero-section">
                    <h3>Explore our digital air quality tools.</h3>
                    <Link to="/explore-data" className="section-link"><span>Explore data {'-->'}</span></Link>
                </section>
            </div>
        </Page>
    )
}

export default ResearchPage;