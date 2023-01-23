import React from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AirQommunities from "assets/svg/community-img.svg";
import AirQommunitiesSm from "assets/img/AirQommunities_mobile.svg";
import { Link } from 'react-router-dom';

const AirQommunitiesSection = () => (
    <div className="AirQommunitiesSection">
        <AirQommunities className="AirQommunitiesSection-img"/>
        <div className="img-mobile">
            <AirQommunitiesSm width={"100%"} height={"400px"} />
        </div>
        <div className="wrapper">
            <h3>AirQommunities</h3>
            <div className="AirQommunitiesSection-info">
                <h1>Community awareness and engagements</h1>
                <p>Empowering communities across Africa with accurate, hyperlocal and timely air quality data to drive air pollution mitigation actions</p>
                <Link style={{ textDecoration:"none" }} to="/solutions/communities"><div className="AirQommunitiesSection-btn">Community Stories <ArrowForwardIcon className="AirQommunitiesSection-icon"/></div></Link>
            </div>
        </div>
    </div>
);

export default AirQommunitiesSection;