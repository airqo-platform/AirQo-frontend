import React from 'react';
import ApiSectionImg from "assets/img/ApiSection.png";
import { Link } from 'react-router-dom';

const ApiSection = () => (
    <div className="Apisection">
        <div className="Apisection-details">
            <h3>Air Quality API</h3>
            <h1>Amplify air quality impact through our API</h1>
            <p>Are you a developer? We invite you to leverage our open-air quality data on your App </p>
            <div className="Apisection-details-btn">
                <Link to="/products/api">Get Started {'-->'}</Link>
            </div>
        </div>
        <div className="api-section-img">
            <img src={ApiSectionImg}/>
        </div>
    </div>
);

export default ApiSection;
