import React from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AnalyticsDashboard from "assets/img/analytics dashboard.svg";
import AnalyticsMobile from "assets/img/analytics_dashboard_mob.svg";

const AnalyticsSection = () => (
    <div className="AnalyticsSection">
        <div className="wrapper">
            <h3>Air Quality Analytics</h3>
            <div className="AnalyticsSection-info">
                <h1>An interactive air quality analytics platform</h1>
                <div className="AnalyticsSection-info-aside">
                    <p>Access and visualise real-time and historical air quality information across Africa through our easy-to-use air quality analytics dashboard</p>
                    <a href="https://platform.airqo.net/login" target="_blank" className="AnalyticsSection-info-aside-btn">Learn more --></a>
                </div>
                
            </div>
        </div>
        <div className="analytics-img">
            <AnalyticsDashboard />
        </div>
        <div className="analytics-img-sm">
            <AnalyticsMobile width={"100%"} />
        </div>
        
    </div>
);

export default AnalyticsSection;