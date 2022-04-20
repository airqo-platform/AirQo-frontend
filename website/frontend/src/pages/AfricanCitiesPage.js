import React, { useState } from "react";
import { Link, Outlet } from 'react-router-dom'
import Page from "./Page";
import Uganda from 'icons/africanCities/countries/uganda.svg';
import Kenya from 'icons/africanCities/countries/kenya.svg';
import Nigeria from 'icons/africanCities/countries/nigeria.svg';
import Ghana from 'icons/africanCities/countries/ghana.svg';
import Burundi from 'icons/africanCities/countries/burundi.svg';
import Senegal from 'icons/africanCities/countries/senegal.svg';
import Mozambique from 'icons/africanCities/countries/mozambique.svg';
import { useInitScrollTop } from "../../utils/customHooks";
import ConsultImg from "../icons/research/consult.png";
import ConsultLongImg from "../icons/research/consult-long.png";
import ConsultImg2 from "../icons/research/consult-2.png";
import BackgroundShape from "../icons/africanCities/background-shape.svg";
import ArrowRight from "../icons/research/arrow-right.svg";

const CityHeroSection = () => {
    return (
        <div className="city-title">
            <div className="page-nav">Solutions > For African Cities</div>
            <div className="city-main-text">African cities with AirQo</div>
            <div className="city-sub-text">Some cities already have programs for air quality monitoring, so we collaborate with them on how to increase their network coverage.</div>
        </div>
    )
}

const CityBanner = () => {
    return (
        <div className="city-banner">
            We are in the process of establishing air quality networks in all African cities, and we have established formal partnerships in 6 cities from 3 regions of Africa.
        </div>
    )
}

const CityTab = ({className, flag, name, link, onClick}) => <Link to={link} onClick={onClick}><span className={className}>{flag} <span className="text">{name}</span></span></Link>

const CityTabs = () => {
    const [active, setActive] = useState("uganda");
    const handleClick = (country) => () => setActive(country);

    const markActive = (country) => country === active ? "active" : "";
    return (
        <div className="city-tabs-wrapper">
            <div className="city-tabs">
                <CityTab
                    className={`available ${markActive("uganda")}`}
                    flag={<Uganda />}
                    name="Kampala"
                    link="/solutions/african-cities/uganda"
                    onClick={handleClick("uganda")}
                />
                <CityTab
                    className={`available ${markActive("kenya")}`}
                    flag={<Kenya />}
                    name="Nairobi"
                    link="/solutions/african-cities/kenya"
                    onClick={handleClick("kenya")}
                />
                <span className="not-available"><Nigeria /> <span className="text">Lagos</span></span>
                <span className="not-available"><Ghana /> <span className="text">Accra</span></span>
                <span className="not-available"><Burundi /> <span className="text">Bujumbura</span></span>
                <span className="not-available"><Senegal /> <span className="text">Dakar</span></span>
                <span className="not-available extended">
                    <Mozambique /> <span className="text text-extended">Manica and Maputo</span>
                </span>
            </div>
        </div>
    )
}

export const ContentUganda = () => {
    return (
        <div className="cities-content">
            <div className="ug-container">
                <div className="consult-text">
                    <div>
                        <p>Collaboration with KCCA</p>
                        <p>AirQo partnered with the Kampala Capital City Authority (KCCA) in 2018, to facilitate air quality monitoring and data analytics tools across Kampala. and other cities around the country.</p>
                        <span className="number-list">
                            <span>1</span>
                            <span>Developed a physical network of low-cost air quality sensors in Kampala and the metropolitan areas comprising over 70 installations.</span>
                        </span>
                        <span className="number-list">
                            <span>2</span>
                            <span>Developed a dedicated data analytics dashboard and supporting capacity development on air quality monitoring</span>
                        </span>
                        <span className="number-list">
                            <span>3</span>
                            <span>Improved air quality monitoring resolution. Kampala city is now one of the cities in Africa with the highest concentration of air quality monitors.</span>
                        </span>
                    </div>
                </div>
                <div className="consult-images">
                    <img className="img-small" src={ConsultImg} alt="consult image" />
                    <img className="img-long" src={ConsultLongImg} alt="consult long image" />
                    <img className="img-small" src={ConsultImg2} alt="consult image 2" />
                    <BackgroundShape className="background-shape" />
                </div>
            </div>

            <div className="content-intro"><p>We continue to conduct joint awareness campaigns during the annual air quality awareness week.</p></div>

            <div className="ug-container">
                <div className="consult-text">
                    <div>
                        <p>Collaboration with NEMA</p>
                        <p>NEMA is the lead government agency mandated to coordinate, supervise, and regulate environmental management in Uganda.</p>
                        <span className="number-list">
                            <span>1</span>
                            <span>AirQo contributes to the air quality chapter in the national state of the environment report, a biennal statutory requirement</span>
                        </span>
                        <span className="number-list">
                            <span>2</span>
                            <span>Officially contributed to the development of the national air quality regulations and standards for Uganda</span>
                        </span>
                        <span className="number-list">
                            <span>3</span>
                            <span>Raise the profile of air quality as a national priority. Air quality is now featured as an important priority in the coutnry’s National Development Plan III.</span>
                        </span>
                    </div>
                </div>
                <div className="consult-images">
                    <img className="img-small" src={ConsultImg} alt="consult image" />
                    <img className="img-long-right" src={ConsultLongImg} alt="consult long image" />
                    <img className="img-small" src={ConsultImg2} alt="consult image 2" />
                    <BackgroundShape className="background-shape" />
                </div>
            </div>

            <div className="cities-divider" />
        </div>
    )
}

export const ContentKenya = () => {
    return (
        <div className="cities-content">
            <div className="cities-content">
                <div className="ke-container">
                    <div className="consult-text">
                        <div>
                            <p>Network deployment in Kenya</p>
                            <p>Nairobi is located over 600 km from Kampala, Nairobi is the first city outside Uganda to have an AirQo monitor.</p>
                            <p>We are in advance stages of developing the air quality network in Nairobi and have so far established a collocation installation in Nairobi in partnership with United Nations Environemnt Programme (UNEP).</p>
                            <p>The collocation will also be an opportunity to support existing initiatives on data quality assurance. for low-cost monitors</p>
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
            <div className="cities-divider" />
        </div>
    )
}

const AdvocateSection = () => {
    return (
        <div className="advocate-wrapper">
            <div className="advocate">
                <p>We believe in advocating for policy reforms </p>
                <p>Our model is to work directly with policymakers alongside stakeholder groups to support the policy development process, ultimately pushing air quality management mainstream.</p>
            </div>
        </div>
    )
}

const PublicationsSection = () => {
    return (
        <div className="publications-section">
            <div className="title">Publications</div>
            <div className="main-text">Developed the first ever clean air action plan for Kampala Capital City, a blue print for other cities in Uganda</div>
            <div className="author">Author</div>
            <div className="team">AirQo Team</div>
            <div>
                <div className="link"><span>Read full whitepaper <ArrowRight /></span></div>
            </div>
        </div>
    )
}

const AfricanCitiesPage = () => {
    useInitScrollTop();
    return (
        <Page>
            <div className="AfricanCitiesPage">
                <CityHeroSection />
                <CityBanner />
                <CityTabs />
                <Outlet />
                <AdvocateSection />
                <PublicationsSection />
            </div>
        </Page>
    )
}

export default AfricanCitiesPage;
