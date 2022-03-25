import React from 'react';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ApiSectionImg from "../../assets/img/api-section-img.png";

const ApiSection = () => (
    <div className="Apisection">
        <div className="Apisection-details">
            <h3>Air Quality API</h3>
            <h1>Integrate your products with our air quality API</h1>
            <p>We deliver the fast, reliable, and hyper-accurate air quality data you need, with the flexibility to integrate this data source with your applications, systems and a wide range of tools.</p>
            <div className="Apisection-details-btn">Read doc <ArrowForwardIcon className="Apisection-icon"/></div>
        </div>
        <img src={ApiSectionImg} alt="API section image" />
    </div>
);

export default ApiSection;
