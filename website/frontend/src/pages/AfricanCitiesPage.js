import React from "react";
import Page from "./Page";
import Uganda from 'icons/africanCities/countries/uganda.svg';
import Kenya from 'icons/africanCities/countries/kenya.svg';
import Nigeria from 'icons/africanCities/countries/nigeria.svg';
import Ghana from 'icons/africanCities/countries/ghana.svg';
import Burundi from 'icons/africanCities/countries/burundi.svg';
import Senegal from 'icons/africanCities/countries/senegal.svg';
import Mozambique from 'icons/africanCities/countries/mozambique.svg';
import { useInitScrollTop } from "../../utils/customHooks";

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

const CityTabs = () => {
    return (
        <div className="city-tabs-wrapper">
            <div className="city-tabs">
                <span className="available active"><Uganda /> <span className="text">Kampala</span></span>
                <span className="available"><Kenya /> <span className="text">Nairobi</span></span>
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

const AfricanCitiesPage = () => {
    useInitScrollTop();
    return (
        <Page>
            <div className="AfricanCitiesPage">
                <CityHeroSection />
                <CityBanner />
                <CityTabs />
            </div>
        </Page>
    )
}

export default AfricanCitiesPage;
