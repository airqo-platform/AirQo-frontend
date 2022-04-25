import React from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AnalyticsDashboard from "../../assets/img/analytics dashboard.svg";

const AnalyticsSection = () => (
    <div className="AnalyticsSection">
        <div className="wrapper">
            <h3>Air Quality Analytics</h3>
            <div className="AnalyticsSection-info">
                <h1>An intuitive air quality analytics dashboard</h1>
                <div className="AnalyticsSection-info-aside">
                    <p>Access real-time and historical air quality information across Africa through our easy-to-use air quality analytics dashboard</p>
                    <div className="AnalyticsSection-info-aside-btn">Learn more <ArrowForwardIcon className="AnalyticsSection-icon"/></div>
                </div>
                
            </div>
        </div>
        <div className="analytics-img">
            <AnalyticsDashboard />
        </div>
        
    </div>
);

export default AnalyticsSection;