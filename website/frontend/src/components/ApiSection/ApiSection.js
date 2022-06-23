import React from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ApiSectionImg from "assets/svg/api-section.svg";

const ApiSection = () => (
    <div className="Apisection">
        <div className="Apisection-details">
            <h3>Air Quality API</h3>
            <h1>Amplify air quality impact through our API</h1>
            <p>Are you a developer? We invite you to leverage our open-air quality data on your App </p>
            <div className="Apisection-details-btn">
                <a href="https://docs.airqo.net/airqo-rest-api-documentation/" target="_blank">Read doc --></a>
            </div>
        </div>
        
        <div className="api-section-img">
            <ApiSectionImg />
        </div>
    </div>
);

export default ApiSection;
