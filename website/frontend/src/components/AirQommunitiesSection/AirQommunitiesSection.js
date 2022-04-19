import React from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AirQommunities from "assets/img/air-qommunity.svg";

const AirQommunitiesSection = () => (
    <div className="AirQommunitiesSection">
        <AirQommunities className="AirQommunitiesSection-img"/>
        <div className="wrapper">
            <h3>AirQommunities</h3>
            <div className="AirQommunitiesSection-info">
                <h1>Community awareness and engagements</h1>
                <p>Empowering communities across Africa with accurate, hyperlocal and timely air quality data to drive air pollution mitigation actions</p>
                <div className="AirQommunitiesSection-btn">Community Stories <ArrowForwardIcon className="AirQommunitiesSection-icon"/></div>
            </div>
        </div>
    </div>
);

export default AirQommunitiesSection;